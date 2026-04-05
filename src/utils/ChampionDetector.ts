import championsDataRaw from '../data/champions.json';
import { Champion } from './StrategyEngine';

// Extract the champions array from the imported data
const championsData = championsDataRaw.champions;

interface DetectedChampion {
  name: string;
  position: { x: number; y: number };
  confidence: number;
  cost: number;
  stars: number;
}

interface VisualAnalysisResult {
  champions: DetectedChampion[];
  boardRegion: { x: number; y: number; width: number; height: number } | null;
  confidence: number;
}

class ChampionDetector {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not create canvas context');
    }
    this.ctx = context;
  }

  async analyzeImage(imageSrc: string): Promise<VisualAnalysisResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Set canvas size to match image
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          
          // Draw image to canvas
          this.ctx.drawImage(img, 0, 0);
          
          // Get image data for analysis
          const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
          
          // Detect the game board region
          const boardRegion = this.detectBoardRegion(imageData);
          
          // Detect champions within the board region
          const champions = this.detectChampions(imageData, boardRegion);
          
          resolve({
            champions,
            boardRegion,
            confidence: this.calculateOverallConfidence(champions),
          });
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for analysis'));
      };
      
      img.src = imageSrc;
    });
  }

  private detectBoardRegion(imageData: ImageData): { x: number; y: number; width: number; height: number } | null {
    const { width, height, data } = imageData;
    
    // Look for the dark blue/black TFT game board background
    // TFT board typically has dark colors with purple/blue tints
    const boardColorThreshold = 50; // Darker colors
    let minX = width, minY = height, maxX = 0, maxY = 0;
    let darkPixelCount = 0;
    
    for (let y = 0; y < height; y += 4) { // Sample every 4th row for performance
      for (let x = 0; x < width; x += 4) { // Sample every 4th column
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        // Check if pixel looks like TFT board (dark with blue/purple tint)
        const brightness = (r + g + b) / 3;
        const blueTint = b > r && b > g;
        
        if (brightness < boardColorThreshold || blueTint) {
          darkPixelCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    // If we found enough dark pixels, return the bounding region
    if (darkPixelCount > (width * height) / 100) { // At least 1% of pixels
      return {
        x: Math.max(0, minX - 10),
        y: Math.max(0, minY - 10),
        width: Math.min(width - minX + 10, maxX - minX + 20),
        height: Math.min(height - minY + 10, maxY - minY + 20),
      };
    }
    
    return null;
  }

  private detectChampions(
    imageData: ImageData, 
    boardRegion: { x: number; y: number; width: number; height: number } | null
  ): DetectedChampion[] {
    const detectedChampions: DetectedChampion[] = [];
    
    if (!boardRegion) {
      console.log('No board region detected, skipping champion detection');
      return detectedChampions;
    }
    
    // TFT board is typically 7x4 hexagonal grid
    // We'll divide the board region into potential champion positions
    const hexPositions = this.generateHexPositions(boardRegion);
    
    for (const position of hexPositions) {
      const champion = this.detectChampionAtPosition(imageData, position);
      if (champion) {
        detectedChampions.push(champion);
      }
    }
    
    return detectedChampions;
  }

  private generateHexPositions(boardRegion: { x: number; y: number; width: number; height: number }) {
    const positions = [];
    const { x, y, width, height } = boardRegion;
    
    // TFT board layout approximation
    const rows = 4;
    const cols = 7;
    const hexSize = Math.min(width / cols, height / rows) * 0.8;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Offset every other row for hexagonal pattern
        const offsetX = (row % 2) * (hexSize / 2);
        const hexX = x + col * hexSize + offsetX + hexSize / 2;
        const hexY = y + row * (hexSize * 0.866) + hexSize / 2; // 0.866 is sqrt(3)/2 for hex spacing
        
        positions.push({
          x: Math.round(hexX),
          y: Math.round(hexY),
          size: hexSize,
        });
      }
    }
    
    return positions;
  }

  private detectChampionAtPosition(
    imageData: ImageData, 
    position: { x: number; y: number; size: number }
  ): DetectedChampion | null {
    const { width, height, data } = imageData;
    const { x, y, size } = position;
    
    // Sample a small area around the position
    const sampleSize = Math.round(size / 3);
    const startX = Math.max(0, x - sampleSize);
    const endX = Math.min(width, x + sampleSize);
    const startY = Math.max(0, y - sampleSize);
    const endY = Math.min(height, y + sampleSize);
    
    // Look for health bar colors (green/yellow/red bars above champions)
    let healthBarPixels = 0;
    let totalPixels = 0;
    
    for (let py = startY; py < endY; py++) {
      for (let px = startX; px < endX; px++) {
        const index = (py * width + px) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        totalPixels++;
        
        // Check for health bar colors
        // Green health: high green, low red and blue
        // Yellow health: high red and green, low blue
        // Red health: high red, low green and blue
        if (
          (g > 150 && r < 100 && b < 100) || // Green health
          (r > 150 && g > 150 && b < 100) || // Yellow health
          (r > 150 && g < 100 && b < 100)    // Red health
        ) {
          healthBarPixels++;
        }
      }
    }
    
    const healthBarRatio = healthBarPixels / totalPixels;
    
    // If we detect enough health bar pixels, assume there's a champion here
    if (healthBarRatio > 0.05) { // 5% threshold
      // For now, return a generic champion detection
      // In a more advanced system, we would analyze the champion's appearance
      return {
        name: 'Unknown', // Would be determined by more advanced image analysis
        position: { x, y },
        confidence: healthBarRatio,
        cost: 1,
        stars: 1,
      };
    }
    
    return null;
  }

  private calculateOverallConfidence(champions: DetectedChampion[]): number {
    if (champions.length === 0) return 0;
    
    const totalConfidence = champions.reduce((sum, champion) => sum + champion.confidence, 0);
    return totalConfidence / champions.length;
  }

  // Convert detected champions to the format expected by the strategy engine
  convertToChampions(detectedChampions: DetectedChampion[]): Champion[] {
    const champions: Champion[] = [];
    
    for (const detected of detectedChampions) {
      // Try to match detected champion name to our database
      const championData = championsData.find(
        c => c.name.toLowerCase() === detected.name.toLowerCase()
      );
      
      if (championData || detected.name === 'Unknown') {
        champions.push({
          name: championData?.name || 'Unknown',
          cost: championData?.cost || detected.cost,
          stars: detected.stars,
        });
      }
    }
    
    return champions;
  }
}

// Export singleton instance
const championDetector = new ChampionDetector();
export default championDetector;
export type { DetectedChampion, VisualAnalysisResult };