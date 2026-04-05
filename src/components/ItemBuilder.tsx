import { useState, useMemo } from 'react';
import itemsData from '../data/items.json';

interface ItemComponent {
  name: string;
  description: string;
  stats: string;
}

interface CombinedItem {
  name: string;
  components: string[];
  stats: string;
  description: string;
  bestOn: string[];
}

interface ItemBuilderProps {
  onItemSelect?: (item: string) => void;
  selectedItems?: string[];
}

export default function ItemBuilder({ onItemSelect, selectedItems = [] }: ItemBuilderProps) {
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'ad' | 'ap' | 'tank' | 'support'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Parse items data
  const { basicItems, combinedItems } = useMemo(() => {
    const basic: ItemComponent[] = [];
    const combined: CombinedItem[] = [];

    itemsData.items.forEach(item => {
      if (item.components && item.components.length > 0) {
        combined.push({
          name: item.name,
          components: item.components,
          stats: item.description || '',
          description: item.description || '',
          bestOn: [] // Would be populated from meta data
        });
      } else {
        basic.push({
          name: item.name,
          description: item.description || '',
          stats: item.description || ''
        });
      }
    });

    return { basicItems: basic, combinedItems: combined };
  }, []);

  // Find possible combinations from selected components
  const possibleCombinations = useMemo(() => {
    if (selectedComponents.length < 2) return [];
    
    return combinedItems.filter(item => {
      return item.components.every(component => 
        selectedComponents.includes(component)
      ) && item.components.length === selectedComponents.length;
    });
  }, [selectedComponents, combinedItems]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    let items = combinedItems;

    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter !== 'all') {
      items = items.filter(item => {
        const itemLower = item.name.toLowerCase();
        switch (filter) {
          case 'ad':
            return itemLower.includes('edge') || itemLower.includes('whisper') || 
                   itemLower.includes('rageblade') || itemLower.includes('hurricane');
          case 'ap':
            return itemLower.includes('staff') || itemLower.includes('deathcap') || 
                   itemLower.includes('gunblade') || itemLower.includes('cap');
          case 'tank':
            return itemLower.includes('warmog') || itemLower.includes('vest') || 
                   itemLower.includes('claw') || itemLower.includes('armor');
          case 'support':
            return itemLower.includes('locket') || itemLower.includes('zeke') || 
                   itemLower.includes('redemption');
          default:
            return true;
        }
      });
    }

    return items;
  }, [combinedItems, searchQuery, filter]);

  const handleComponentSelect = (component: string) => {
    if (selectedComponents.includes(component)) {
      setSelectedComponents(prev => prev.filter(c => c !== component));
    } else if (selectedComponents.length < 2) {
      setSelectedComponents(prev => [...prev, component]);
    } else {
      // Replace oldest component
      setSelectedComponents(prev => [prev[1], component]);
    }
  };

  const handleItemCraft = (item: CombinedItem) => {
    if (onItemSelect) {
      onItemSelect(item.name);
    }
    setSelectedComponents([]);
  };

  const getItemTypeColor = (itemName: string) => {
    const name = itemName.toLowerCase();
    if (name.includes('edge') || name.includes('whisper') || name.includes('rageblade')) {
      return 'border-red-400 bg-red-500/10';
    }
    if (name.includes('staff') || name.includes('deathcap') || name.includes('gunblade')) {
      return 'border-blue-400 bg-blue-500/10';
    }
    if (name.includes('warmog') || name.includes('vest') || name.includes('claw')) {
      return 'border-green-400 bg-green-500/10';
    }
    return 'border-purple-400 bg-purple-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
        />
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'ad', 'ap', 'tank', 'support'] as const).map(category => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filter === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {category === 'all' ? 'All Items' : category.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Component Builder */}
      <div className="bg-slate-700/50 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">📦 Item Crafter</h3>
        
        {/* Basic Components */}
        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">Select 2 components to craft:</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {basicItems.slice(0, 8).map(component => (
              <button
                key={component.name}
                onClick={() => handleComponentSelect(component.name)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedComponents.includes(component.name)
                    ? 'border-purple-400 bg-purple-500/20 text-white'
                    : 'border-slate-600 bg-slate-800 text-gray-300 hover:border-slate-500'
                }`}
                title={component.description}
              >
                <div className="text-xs font-medium truncate">{component.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Components */}
        {selectedComponents.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-300 text-sm mb-2">Selected Components:</p>
            <div className="flex gap-2">
              {selectedComponents.map(component => (
                <div
                  key={component}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm"
                >
                  {component}
                </div>
              ))}
              {selectedComponents.length === 1 && (
                <div className="px-3 py-1 border-2 border-dashed border-gray-500 rounded-lg text-sm text-gray-400">
                  + Select one more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Possible Combinations */}
        {possibleCombinations.length > 0 && (
          <div>
            <p className="text-green-400 text-sm mb-2">✨ Possible Items:</p>
            <div className="space-y-2">
              {possibleCombinations.map(item => (
                <button
                  key={item.name}
                  onClick={() => handleItemCraft(item)}
                  className="w-full p-3 bg-green-600/20 border border-green-500/50 rounded-lg text-left hover:bg-green-600/30 transition-colors"
                >
                  <div className="font-medium text-green-300">{item.name}</div>
                  <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* All Items List */}
      <div>
        <h3 className="text-white font-semibold mb-3">🎯 All Items ({filteredItems.length})</h3>
        <div className="grid gap-3">
          {filteredItems.map(item => (
            <div
              key={item.name}
              className={`p-4 rounded-lg border-2 ${getItemTypeColor(item.name)} ${
                selectedItems.includes(item.name) ? 'ring-2 ring-purple-400' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-white">{item.name}</h4>
                <button
                  onClick={() => onItemSelect?.(item.name)}
                  className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                >
                  Add
                </button>
              </div>
              
              <p className="text-gray-300 text-sm mb-2">{item.description}</p>
              
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-gray-400">Components:</span>
                {item.components.map(component => (
                  <span
                    key={component}
                    className="px-2 py-1 bg-slate-600 text-white rounded text-xs"
                  >
                    {component}
                  </span>
                ))}
              </div>
              
              {item.bestOn.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-400">Best on:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.bestOn.map(champion => (
                      <span
                        key={champion}
                        className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs"
                      >
                        {champion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}