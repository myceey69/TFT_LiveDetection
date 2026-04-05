import { useMemo } from 'react';
import { Champion } from '../utils/StrategyEngine';

interface TraitData {
  name: string;
  description: string;
  bonuses: Array<{
    units: number;
    bonus: string;
    color: 'bronze' | 'silver' | 'gold' | 'prismatic';
  }>;
  type: 'origin' | 'class';
}

interface TraitSynergyProps {
  currentBoard: Champion[];
  onTraitClick?: (trait: string) => void;
}

// TFT trait data (this would normally come from Data Dragon or community sources)
const TRAIT_DATA: TraitData[] = [
  {
    name: 'Spirit',
    description: 'Spirit units gain Attack Speed and heal allies',
    type: 'origin',
    bonuses: [
      { units: 2, bonus: '15% Attack Speed, heal 30 HP', color: 'bronze' },
      { units: 4, bonus: '35% Attack Speed, heal 60 HP', color: 'silver' },
      { units: 6, bonus: '60% Attack Speed, heal 100 HP', color: 'gold' },
      { units: 8, bonus: '100% Attack Speed, heal 160 HP', color: 'prismatic' }
    ]
  },
  {
    name: 'Duelist',
    description: 'Duelist units gain Attack Speed for each enemy defeated',
    type: 'class',
    bonuses: [
      { units: 2, bonus: '8% Attack Speed per enemy kill', color: 'bronze' },
      { units: 4, bonus: '16% Attack Speed per enemy kill', color: 'silver' },
      { units: 6, bonus: '25% Attack Speed per enemy kill', color: 'gold' },
      { units: 8, bonus: '40% Attack Speed per enemy kill', color: 'prismatic' }
    ]
  },
  {
    name: 'Warrior',
    description: 'Warriors gain Armor and Magic Resist',
    type: 'class',
    bonuses: [
      { units: 2, bonus: '20 Armor, 20 Magic Resist', color: 'bronze' },
      { units: 4, bonus: '50 Armor, 50 Magic Resist', color: 'silver' },
      { units: 6, bonus: '90 Armor, 90 Magic Resist', color: 'gold' }
    ]
  },
  {
    name: 'Protector',
    description: 'Protectors shield the lowest health ally',
    type: 'class',
    bonuses: [
      { units: 2, bonus: '200 HP shield', color: 'bronze' },
      { units: 4, bonus: '400 HP shield', color: 'silver' },
      { units: 6, bonus: '700 HP shield', color: 'gold' }
    ]
  },
  {
    name: 'Mage',
    description: 'Mages gain Ability Power and cast twice',
    type: 'class',
    bonuses: [
      { units: 3, bonus: '20 Ability Power', color: 'bronze' },
      { units: 5, bonus: '50 Ability Power, cast twice', color: 'silver' },
      { units: 7, bonus: '90 Ability Power, cast twice', color: 'gold' }
    ]
  },
  {
    name: 'Marksman',
    description: 'Marksmen gain Attack Range and Critical Strike Chance',
    type: 'class',
    bonuses: [
      { units: 2, bonus: '+1 Range, 20% Crit Chance', color: 'bronze' },
      { units: 4, bonus: '+2 Range, 40% Crit Chance', color: 'silver' },
      { units: 6, bonus: '+3 Range, 60% Crit Chance', color: 'gold' }
    ]
  }
];

// Champion trait mappings (this would come from our data)
const CHAMPION_TRAITS: { [key: string]: string[] } = {
  'Kalista': ['Spirit', 'Duelist'],
  'Garen': ['Warrior', 'Protector'],
  'Darius': ['Warrior', 'Protector'],
  'Yasuo': ['Spirit', 'Duelist'],
  'Shen': ['Spirit', 'Protector'],
  'Irelia': ['Spirit', 'Duelist'],
  'Kindred': ['Spirit', 'Marksman'],
  'Varus': ['Duelist', 'Marksman'],
  'Azir': ['Warrior', 'Mage'],
  'Viktor': ['Mage'],
};

export default function TraitSynergyCalculator({ currentBoard, onTraitClick }: TraitSynergyProps) {
  // Calculate current trait counts and active bonuses
  const { traitCounts, activeBonuses, suggestions } = useMemo(() => {
    const counts: { [trait: string]: number } = {};
    const active: Array<{ trait: string; level: number; bonus: string; color: string }> = [];
    const suggest: Array<{ trait: string; needed: number; nextBonus: string }> = [];

    // Count traits from current board
    currentBoard.forEach(champion => {
      const traits = CHAMPION_TRAITS[champion.name] || [];
      traits.forEach(trait => {
        counts[trait] = (counts[trait] || 0) + 1;
      });
    });

    // Calculate active bonuses and suggestions
    TRAIT_DATA.forEach(traitData => {
      const currentCount = counts[traitData.name] || 0;
      
      // Find active bonuses
      for (const bonus of traitData.bonuses) {
        if (currentCount >= bonus.units) {
          active.push({
            trait: traitData.name,
            level: bonus.units,
            bonus: bonus.bonus,
            color: bonus.color
          });
        }
      }

      // Find next possible bonus
      const nextBonus = traitData.bonuses.find(bonus => bonus.units > currentCount);
      if (nextBonus && currentCount > 0) {
        suggest.push({
          trait: traitData.name,
          needed: nextBonus.units - currentCount,
          nextBonus: nextBonus.bonus
        });
      }
    });

    return {
      traitCounts: counts,
      activeBonuses: active,
      suggestions: suggest.sort((a, b) => a.needed - b.needed)
    };
  }, [currentBoard]);

  const getBorderColor = (color: string) => {
    switch (color) {
      case 'bronze': return 'border-orange-400';
      case 'silver': return 'border-gray-300';
      case 'gold': return 'border-yellow-400';
      case 'prismatic': return 'border-purple-400';
      default: return 'border-gray-400';
    }
  };

  const getTextColor = (color: string) => {
    switch (color) {
      case 'bronze': return 'text-orange-400';
      case 'silver': return 'text-gray-300';
      case 'gold': return 'text-yellow-400';
      case 'prismatic': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Synergies */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          ✨ Active Synergies ({activeBonuses.length})
        </h3>
        
        {activeBonuses.length === 0 ? (
          <div className="text-center py-8 bg-slate-700/30 rounded-lg">
            <div className="text-4xl mb-2">😴</div>
            <p className="text-gray-400">No active synergies yet</p>
            <p className="text-sm text-gray-500 mt-1">Add more champions to activate trait bonuses</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {activeBonuses.map((bonus, index) => (
              <div
                key={index}
                className={`p-4 bg-slate-700/50 border-l-4 ${getBorderColor(bonus.color)} rounded-lg cursor-pointer hover:bg-slate-600/50 transition-colors`}
                onClick={() => onTraitClick?.(bonus.trait)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-semibold ${getTextColor(bonus.color)}`}>
                    {bonus.trait} ({bonus.level})
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTextColor(bonus.color)} bg-slate-800`}>
                    {bonus.color.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{bonus.bonus}</p>
                <div className="mt-2 text-xs text-gray-400">
                  Current units: {traitCounts[bonus.trait]} / {bonus.level}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade Suggestions */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          🎯 Upgrade Suggestions
        </h3>
        
        {suggestions.length === 0 ? (
          <div className="text-center py-6 bg-slate-700/30 rounded-lg">
            <p className="text-gray-400">No upgrade paths available</p>
            <p className="text-sm text-gray-500 mt-1">Perfect synergies or start new traits</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.slice(0, 4).map((suggestion) => (
              <div
                key={suggestion.trait}
                className="p-4 bg-slate-700/30 border border-slate-600 rounded-lg hover:border-slate-500 transition-colors cursor-pointer"
                onClick={() => onTraitClick?.(suggestion.trait)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-white">{suggestion.trait}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    suggestion.needed === 1 ? 'bg-green-600/20 text-green-400' :
                    suggestion.needed === 2 ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    +{suggestion.needed} needed
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-1">
                  Next bonus: {suggestion.nextBonus}
                </p>
                <div className="text-xs text-gray-400">
                  Current: {traitCounts[suggestion.trait] || 0} → Target: {(traitCounts[suggestion.trait] || 0) + suggestion.needed}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Traits Reference */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          📚 Trait Reference
        </h3>
        
        <div className="space-y-4">
          {TRAIT_DATA.map(trait => {
            const currentCount = traitCounts[trait.name] || 0;
            const hasUnits = currentCount > 0;
            
            return (
              <div
                key={trait.name}
                className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                  hasUnits 
                    ? 'bg-slate-700/50 border-slate-500 hover:bg-slate-600/50' 
                    : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => onTraitClick?.(trait.name)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className={`font-semibold ${hasUnits ? 'text-white' : 'text-gray-400'}`}>
                    {trait.name}
                    {hasUnits && <span className="ml-2 text-sm text-purple-400">({currentCount})</span>}
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    trait.type === 'origin' ? 'bg-blue-600/20 text-blue-400' : 'bg-green-600/20 text-green-400'
                  }`}>
                    {trait.type}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm mb-3">{trait.description}</p>
                
                <div className="space-y-2">
                  {trait.bonuses.map((bonus, index) => {
                    const isActive = currentCount >= bonus.units;
                    const isNext = !isActive && currentCount > 0 && 
                      (index === 0 || currentCount >= trait.bonuses[index - 1].units);
                    
                    return (
                      <div
                        key={index}
                        className={`flex justify-between items-center p-2 rounded text-sm ${
                          isActive 
                            ? `${getBorderColor(bonus.color)} bg-slate-600/30 border-l-4` :
                          isNext 
                            ? 'bg-yellow-500/10 border-l-4 border-yellow-500' :
                            'bg-slate-800/20'
                        }`}
                      >
                        <span className={isActive ? getTextColor(bonus.color) : isNext ? 'text-yellow-300' : 'text-gray-500'}>
                          ({bonus.units}) {bonus.bonus}
                        </span>
                        {isActive && <span className="text-green-400 text-xs">✓ ACTIVE</span>}
                        {isNext && <span className="text-yellow-400 text-xs">→ NEXT</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}