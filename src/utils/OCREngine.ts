import { createWorker } from 'tesseract.js';
import championsDataRaw from '../data/champions.json';

// Extract the champions array from the imported data
const championsData = championsDataRaw.champions;

interface OCRResult {
  detectedText: string;
  champions: string[];
  gold: number | null;
  level: number | null;
  confidence: number;
}

interface DetectedChampion {
  name: string;
  confidence: number;
}

class OCREngine {
  private worker: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await createWorker('eng');
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ',
        tessedit_pageseg_mode: '6', // Assume a single uniform block of text
      });
      this.isInitialized = true;
      console.log('OCR Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR Engine:', error);
      throw error;
    }
  }

  async processImage(imageSrc: string): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { data } = await this.worker.recognize(imageSrc);
      const detectedText = data.text;
      const confidence = data.confidence / 100; // Convert to 0-1 scale

      console.log('OCR Raw Text:', detectedText);
      console.log('OCR Confidence:', confidence);

      // Extract information from the text
      const champions = this.extractChampions(detectedText);
      const gold = this.extractGold(detectedText);
      const level = this.extractLevel(detectedText);

      return {
        detectedText,
        champions,
        gold,
        level,
        confidence,
      };
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw error;
    }
  }

  private extractChampions(text: string): string[] {
    const detectedChampions: DetectedChampion[] = [];
    const championNames = championsData.map(c => c.name.toLowerCase());

    // Look for champion names in the text
    const words = text.toLowerCase().split(/\s+/);
    
    for (const championName of championNames) {
      for (const word of words) {
        // Check for exact matches
        if (word === championName.toLowerCase()) {
          detectedChampions.push({ name: championName, confidence: 1.0 });
          continue;
        }
        
        // Check for partial matches (fuzzy matching)
        const similarity = this.calculateSimilarity(word, championName.toLowerCase());
        if (similarity > 0.7) { // 70% similarity threshold
          detectedChampions.push({ name: championName, confidence: similarity });
        }
      }
    }

    // Remove duplicates and sort by confidence
    const uniqueChampions = detectedChampions
      .filter((champion, index, self) => 
        index === self.findIndex(c => c.name === champion.name)
      )
      .sort((a, b) => b.confidence - a.confidence)
      .map(c => c.name);

    return uniqueChampions;
  }

  private extractGold(text: string): number | null {
    // Look for gold patterns like "Gold: 45" or "45 Gold" or just numbers near "gold"
    const goldPatterns = [
      /gold[:\s]*(\d+)/i,
      /(\d+)\s*gold/i,
      /gold[:\s]*(\d+)/gi,
    ];

    for (const pattern of goldPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const gold = parseInt(match[1], 10);
        if (gold >= 0 && gold <= 999) { // Reasonable gold range
          return gold;
        }
      }
    }

    // Look for standalone numbers that could be gold
    const numbers = text.match(/\b\d{1,3}\b/g);
    if (numbers) {
      for (const numStr of numbers) {
        const num = parseInt(numStr, 10);
        if (num >= 0 && num <= 100) { // Common gold range
          return num;
        }
      }
    }

    return null;
  }

  private extractLevel(text: string): number | null {
    // Look for level patterns like "Level 7" or "Lv 7" or "LVL: 7"
    const levelPatterns = [
      /level[:\s]*(\d+)/i,
      /lv[:\s]*(\d+)/i,
      /lvl[:\s]*(\d+)/i,
    ];

    for (const pattern of levelPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const level = parseInt(match[1], 10);
        if (level >= 1 && level <= 11) { // Valid TFT level range
          return level;
        }
      }
    }

    return null;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    if (str1.length < 3 || str2.length < 3) return 0; // Too short for meaningful comparison
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

// Singleton instance
const ocrEngine = new OCREngine();

export default ocrEngine;
export type { OCRResult };