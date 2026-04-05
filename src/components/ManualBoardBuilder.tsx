import { useState } from 'react';
import championsData from '../data/champions.json';
import { Champion } from '../utils/StrategyEngine';

interface ManualBoardBuilderProps {
  onBoardChange: (champions: Champion[]) => void;
}

export default function ManualBoardBuilder({ onBoardChange }: ManualBoardBuilderProps) {
  const [selectedChampions, setSelectedChampions] = useState<Champion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Group champions by cost
  const championsByCost = championsData.champions.reduce((acc, champ) => {
    if (!acc[champ.cost]) acc[champ.cost] = [];
    acc[champ.cost].push(champ);
    return acc;
  }, {} as Record<number, typeof championsData.champions>);

  // Filter champions by search
  const filteredChampions = searchTerm
    ? championsData.champions.filter(champ =>
        champ.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  const addChampion = (name: string, cost: number) => {
    // Check if champion already exists
    const existing = selectedChampions.find(c => c.name === name);
    
    if (existing) {
      // Upgrade stars (max 3)
      if (existing.stars < 3) {
        const updated = selectedChampions.map(c =>
          c.name === name ? { ...c, stars: c.stars + 1 } : c
        );
        setSelectedChampions(updated);
        onBoardChange(updated);
      }
    } else {
      // Add new champion
      const newBoard = [...selectedChampions, { name, cost, stars: 1 }];
      setSelectedChampions(newBoard);
      onBoardChange(newBoard);
    }
  };

  const removeChampion = (name: string) => {
    const existing = selectedChampions.find(c => c.name === name);
    
    if (existing && existing.stars > 1) {
      // Downgrade stars
      const updated = selectedChampions.map(c =>
        c.name === name ? { ...c, stars: c.stars - 1 } : c
      );
      setSelectedChampions(updated);
      onBoardChange(updated);
    } else {
      // Remove champion
      const newBoard = selectedChampions.filter(c => c.name !== name);
      setSelectedChampions(newBoard);
      onBoardChange(newBoard);
    }
  };

  const clearBoard = () => {
    setSelectedChampions([]);
    onBoardChange([]);
  };

  const getStarDisplay = (stars: number) => '⭐'.repeat(stars);

  return (
    <div className="space-y-6">
      {/* Current Board */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-white">
            Your Board ({selectedChampions.length}/9)
          </h3>
          {selectedChampions.length > 0 && (
            <button
              onClick={clearBoard}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Clear All
            </button>
          )}
        </div>

        {selectedChampions.length === 0 ? (
          <div className="bg-slate-700/50 rounded-lg p-8 text-center text-gray-400">
            No champions selected. Tap champions below to add them.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {selectedChampions.map((champ) => (
              <div
                key={champ.name}
                onClick={() => removeChampion(champ.name)}
                className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-3 cursor-pointer hover:from-purple-500 hover:to-purple-700 transition-all"
              >
                <div className="text-white font-semibold text-sm">{champ.name}</div>
                <div className="text-xs text-purple-200 mt-1">
                  {getStarDisplay(champ.stars)}
                </div>
                <div className="text-xs text-purple-300 mt-1">${champ.cost}</div>
              </div>
            ))}
          </div>
        )}

        {selectedChampions.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            💡 Tap a champion to upgrade stars or remove
          </p>
        )}
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search champions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Champion Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          {searchTerm ? 'Search Results' : 'Select Champions'}
        </h3>

        {filteredChampions ? (
          // Search results
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {filteredChampions.map((champ) => (
              <button
                key={champ.name}
                onClick={() => addChampion(champ.name, champ.cost)}
                className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-left transition-colors"
              >
                <div className="text-white font-medium text-sm">{champ.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  ${champ.cost} • {champ.traits.join(', ')}
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Grouped by cost
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(championsByCost)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([cost, champs]) => (
                <div key={cost}>
                  <div className="text-purple-400 font-semibold mb-2 text-sm">
                    ${cost} Cost
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {champs.map((champ) => (
                      <button
                        key={champ.name}
                        onClick={() => addChampion(champ.name, champ.cost)}
                        className="bg-slate-700 hover:bg-slate-600 rounded-lg p-2 text-left transition-colors"
                      >
                        <div className="text-white font-medium text-sm">{champ.name}</div>
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {champ.traits.join(', ')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
