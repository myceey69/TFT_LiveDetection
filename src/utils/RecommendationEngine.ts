import { CompMatch } from './StrategyEngine';
import metaCompsData from '../data/meta_comps.json';

export interface Recommendation {
  id: string;
  type: 'level' | 'unit' | 'item' | 'positioning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  icon: string;
}

/**
 * Generate recommendations based on current board state and best fitting comp
 */
export function generateRecommendations(
  bestComp: CompMatch | null,
  currentLevel: number = 1,
  currentGold: number = 0
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (!bestComp) {
    // No comp match - give general advice
    recommendations.push({
      id: 'start-building',
      type: 'unit',
      priority: 'high',
      title: 'Start Building Your Board',
      description: 'Add champions to see personalized recommendations',
      icon: '🎯',
    });
    return recommendations;
  }

  const comp = metaCompsData.metaComps.find(c => c.id === bestComp.compId);
  if (!comp) return recommendations;

  // 1. Level recommendations
  if (currentLevel < comp.level && currentGold >= 4) {
    const levelDiff = comp.level - currentLevel;
    if (levelDiff >= 2) {
      recommendations.push({
        id: 'level-up',
        type: 'level',
        priority: 'high',
        title: `Level to ${comp.level}`,
        description: `You need ${levelDiff} more levels for this comp. Save gold and level when strong.`,
        icon: '⬆️',
      });
    } else if (levelDiff === 1) {
      recommendations.push({
        id: 'level-up-soon',
        type: 'level',
        priority: 'medium',
        title: `Level to ${comp.level} Soon`,
        description: 'One more level needed to complete this composition.',
        icon: '⬆️',
      });
    }
  }

  // 2. Unit recommendations (most important missing units)
  if (bestComp.missingUnits.length > 0) {
    // Sort by cost (lower cost = higher priority early game)
    const sortedMissing = [...bestComp.missingUnits].sort((a, b) => {
      // Prioritize 3-4 cost units if level 7+
      if (currentLevel >= 7) {
        if (a.cost >= 3 && a.cost <= 4) return -1;
        if (b.cost >= 3 && b.cost <= 4) return 1;
      }
      return a.cost - b.cost;
    });

    const topMissing = sortedMissing.slice(0, 3);
    
    topMissing.forEach((unit, index) => {
      const priority = index === 0 ? 'high' : 'medium';
      const starText = unit.stars > 1 ? `${unit.stars}-star ` : '';
      
      recommendations.push({
        id: `find-${unit.name}`,
        type: 'unit',
        priority,
        title: `Find ${starText}${unit.name}`,
        description: `${unit.cost}-cost unit. Key piece for ${bestComp.compName}.`,
        icon: '🔍',
      });
    });
  }

  // 3. Item recommendations
  if (bestComp.missingItems.length > 0) {
    const topItems = bestComp.missingItems.slice(0, 2);
    
    topItems.forEach(({ unit, item }) => {
      recommendations.push({
        id: `build-${item}`,
        type: 'item',
        priority: 'medium',
        title: `Build ${item}`,
        description: `Equip on ${unit} for maximum effectiveness.`,
        icon: '⚔️',
      });
    });
  }

  // 4. Positioning advice
  if (bestComp.similarity >= 60) {
    recommendations.push({
      id: 'positioning',
      type: 'positioning',
      priority: 'low',
      title: 'Optimize Positioning',
      description: 'Place tanks front, carries back. Spread units to avoid AoE.',
      icon: '📐',
    });
  }

  // 5. Economy advice
  if (currentLevel >= 7 && currentGold < 50 && bestComp.similarity < 80) {
    recommendations.push({
      id: 'economy',
      type: 'level',
      priority: 'medium',
      title: 'Save for Economy',
      description: 'Try to reach 50 gold for maximum interest before rolling.',
      icon: '💰',
    });
  }

  // Return top 3 recommendations
  return recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);
}

/**
 * Get economic recommendation based on gold and level
 */
export function getEconomicAdvice(
  currentGold: number,
  currentLevel: number
): string {
  if (currentGold < 10) {
    return 'Save gold. Aim for 10+ gold for interest.';
  }
  if (currentGold >= 10 && currentGold < 50) {
    return `Keep building economy. ${50 - currentGold} gold until max interest.`;
  }
  if (currentGold >= 50 && currentLevel < 8) {
    return 'Level up to 8 when you find a strong board.';
  }
  if (currentGold >= 50 && currentLevel >= 8) {
    return 'Roll down to find key units and upgrades.';
  }
  return 'Manage your economy wisely.';
}
