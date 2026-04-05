import ocrEngine, { OCRResult } from './OCREngine';
import championDetector, { VisualAnalysisResult } from './ChampionDetector';
import championsDataRaw from '../data/champions.json';
import { Champion } from './StrategyEngine';

// Extract the champions array from the imported data
const championsData = championsDataRaw.champions;

interface ImageProcessingResult {
  champions: Champion[];
  gold: number | null;
  level: number | null;
  confidence: number;
  processingTime: number;
  debug: {
    ocrResult: OCRResult;
    visualResult: VisualAnalysisResult;
    mergedChampions: string[];
  };
}

class ImageProcessor {
  private isProcessing = false;

  async processGameImage(imageSrc: string): Promise<ImageProcessingResult> {
    if (this.isProcessing) {
      throw new Error('Image processing already in progress');
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      console.log('Starting image processing...');

      // Run OCR and visual detection in parallel for better performance
      const [ocrResult, visualResult] = await Promise.all([
        ocrEngine.processImage(imageSrc).catch(error => {
          console.warn('OCR processing failed:', error);
          return {
            detectedText: '',
            champions: [],
            gold: null,
            level: null,
            confidence: 0,
          } as OCRResult;
        }),
        championDetector.analyzeImage(imageSrc).catch(error => {
          console.warn('Visual detection failed:', error);
          return {
            champions: [],
            boardRegion: null,
            confidence: 0,
          } as VisualAnalysisResult;
        }),
      ]);

      // Merge results from both detection methods
      const mergedChampions = this.mergeChampionDetections(ocrResult, visualResult);
      
      // Convert to Champion objects for the strategy engine
      const champions = this.convertToChampionObjects(mergedChampions);

      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(ocrResult, visualResult);

      const processingTime = Date.now() - startTime;

      console.log(`Image processing completed in ${processingTime}ms`);
      console.log(`Detected ${champions.length} champions:`, champions.map(c => c.name));

      return {
        champions,
        gold: ocrResult.gold,
        level: ocrResult.level,
        confidence,
        processingTime,
        debug: {
          ocrResult,
          visualResult,
          mergedChampions,
        },
      };
    } finally {
      this.isProcessing = false;
    }
  }

  private mergeChampionDetections(ocrResult: OCRResult, visualResult: VisualAnalysisResult): string[] {
    const merged = new Set<string>();
    
    // Add champions detected by OCR (text-based)
    for (const championName of ocrResult.champions) {
      merged.add(championName);
    }
    
    // Add champions detected visually (if we have high confidence)
    for (const detectedChampion of visualResult.champions) {
      if (detectedChampion.confidence > 0.3 && detectedChampion.name !== 'Unknown') {
        merged.add(detectedChampion.name);
      }
    }
    
    // If visual detection found champions but couldn't identify them,
    // try to match them with OCR results
    const unknownVisualChampions = visualResult.champions.filter(c => c.name === 'Unknown');
    const ocrChampionNames = ocrResult.champions;
    
    if (unknownVisualChampions.length > 0 && ocrChampionNames.length > 0) {
      // Assume the visual detections correspond to the OCR detections
      const matchCount = Math.min(unknownVisualChampions.length, ocrChampionNames.length);
      for (let i = 0; i < matchCount; i++) {
        merged.add(ocrChampionNames[i]);
      }
    }
    
    return Array.from(merged);
  }

  private convertToChampionObjects(championNames: string[]): Champion[] {
    const champions: Champion[] = [];
    
    for (const name of championNames) {
      const championData = championsData.find(
        c => c.name.toLowerCase() === name.toLowerCase()
      );
      
      if (championData) {
        champions.push({
          name: championData.name,
          cost: championData.cost,
          stars: 1, // Default to 1 star, user can upgrade manually
        });
      } else {
        console.warn(`Champion not found in database: ${name}`);
      }
    }
    
    return champions;
  }

  private calculateOverallConfidence(ocrResult: OCRResult, visualResult: VisualAnalysisResult): number {
    // Weight OCR confidence higher as it's more reliable for champion names
    const ocrWeight = 0.7;
    const visualWeight = 0.3;
    
    return (ocrResult.confidence * ocrWeight) + (visualResult.confidence * visualWeight);
  }

  // Helper method to preload OCR engine
  async initialize(): Promise<void> {
    try {
      await ocrEngine.initialize();
      console.log('Image processor initialized');
    } catch (error) {
      console.error('Failed to initialize image processor:', error);
    }
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    await ocrEngine.cleanup();
  }
}

// Export singleton instance
const imageProcessor = new ImageProcessor();
export default imageProcessor;
export type { ImageProcessingResult };