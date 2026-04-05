import metaCompsData from '../data/meta_comps.json';

export interface Champion {
  name: string;
  cost: number;
  stars: number;
}

export interface Item {
  name: string;
}

export interface CompMatch {
  compId: string;
  compName: string;
  similarity: number;
  missingUnits: Array<{ name: string; cost: number; stars: number }>;
  missingItems: Array<{ unit: string; item: string }>;
  tier: string;
  description: string;
}

/**
 * Calculate similarity between current board and a meta composition
 * Returns a score from 0-100
 */
function calculateBoardSimilarity(
  currentUnits: Champion[],
  compUnits: Array<{ name: string; cost: number; stars: number }>
): number {
  if (currentUnits.length === 0) return 0;

  const compUnitNames = compUnits.map(u => u.name.toLowerCase());
  const currentUnitNames = currentUnits.map(u => u.name.toLowerCase());

  // Count matching units
  let matches = 0;
  let starMatches = 0;

  currentUnitNames.forEach(currentName => {
    if (compUnitNames.includes(currentName)) {
      matches++;
      
      // Bonus for matching star level
      const currentUnit = currentUnits.find(u => u.name.toLowerCase() === currentName);
      const compUnit = compUnits.find(u => u.name.toLowerCase() === currentName);
      
      if (currentUnit && compUnit && currentUnit.stars >= compUnit.stars) {
        starMatches++;
      }
    }
  });

  // Calculate similarity score
  const unitMatchScore = (matches / compUnits.length) * 70;
  const starMatchScore = (starMatches / compUnits.length) * 30;

  return Math.round(unitMatchScore + starMatchScore);
}

/**
 * Find missing units from a composition
 */
function findMissingUnits(
  currentUnits: Champion[],
  compUnits: Array<{ name: string; cost: number; stars: number }>
): Array<{ name: string; cost: number; stars: number }> {
  const currentUnitNames = currentUnits.map(u => u.name.toLowerCase());
  
  return compUnits.filter(compUnit => 
    !currentUnitNames.includes(compUnit.name.toLowerCase())
  );
}

/**
 * Find missing items from a composition
 */
function findMissingItems(
  currentItems: Item[],
  compItems: Array<{ unit: string; item: string }>
): Array<{ unit: string; item: string }> {
  const currentItemNames = currentItems.map(i => i.name.toLowerCase());
  
  return compItems.filter(compItem => 
    !currentItemNames.includes(compItem.item.toLowerCase())
  );
}

/**
 * Main strategy engine function
 * Analyzes current board state and returns best fitting compositions
 */
export function analyzeBoardState(
  currentUnits: Champion[],
  currentItems: Item[] = []
): CompMatch[] {
  const matches: CompMatch[] = [];

  // Calculate similarity for each meta comp
  metaCompsData.metaComps.forEach(comp => {
    const similarity = calculateBoardSimilarity(currentUnits, comp.units);
    
    // Only include comps with at least 20% similarity or if board is empty
    if (similarity >= 20 || currentUnits.length === 0) {
      matches.push({
        compId: comp.id,
        compName: comp.name,
        similarity,
        missingUnits: findMissingUnits(currentUnits, comp.units),
        missingItems: findMissingItems(currentItems, comp.coreItems),
        tier: comp.tier,
        description: comp.description,
      });
    }
  });

  // Sort by similarity (highest first)
  return matches.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Get the best fitting composition
 */
export function getBestFitComp(
  currentUnits: Champion[],
  currentItems: Item[] = []
): CompMatch | null {
  const matches = analyzeBoardState(currentUnits, currentItems);
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Get top N compositions by similarity
 */
export function getTopComps(
  currentUnits: Champion[],
  currentItems: Item[] = [],
  count: number = 3
): CompMatch[] {
  const matches = analyzeBoardState(currentUnits, currentItems);
  return matches.slice(0, count);
}
