import { useMemo, useState } from 'react';
import { Champion } from '../utils/StrategyEngine';

interface Position {
  row: number;
  col: number;
}

interface ChampionPosition extends Position {
  champion: Champion | null;
}

interface PositionAdvice {
  position: Position;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  champion?: string;
}

interface BoardPositionProps {
  currentBoard: Champion[];
  onPositionChange?: (positions: ChampionPosition[]) => void;
}

// TFT board is 7 columns x 4 rows in hexagonal layout
const BOARD_ROWS = 4;
const BOARD_COLS = 7;

export default function BoardPositionAdvisor({ currentBoard, onPositionChange }: BoardPositionProps) {
  const [positions, setPositions] = useState<ChampionPosition[]>(() => {
    // Initialize empty board
    const board: ChampionPosition[] = [];
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        board.push({ row, col, champion: null });
      }
    }
    return board;
  });

  const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);
  const [showAdvice, setShowAdvice] = useState(true);

  // Calculate positioning advice based on current board state
  const positioningAdvice = useMemo(() => {
    const advice: PositionAdvice[] = [];
    
    // Analyze current positioning and provide suggestions
    const occupiedPositions = positions.filter(p => p.champion);
    
    // Front line advice (rows 0-1)
    const frontLineChampions = occupiedPositions.filter(p => p.row <= 1 && p.champion);
    const frontLineTanks = frontLineChampions.filter(p => 
      p.champion && ['Garen', 'Shen', 'Darius'].includes(p.champion.name)
    );

    if (frontLineTanks.length === 0 && currentBoard.length > 2) {
      advice.push({
        position: { row: 0, col: 3 }, // Center front
        reason: 'Need a tank in front line to protect your carries',
        priority: 'high',
        champion: 'Tank (Garen/Shen/Darius)'
      });
    }

    // Back line carries (rows 2-3)
    const backLinePositions = occupiedPositions.filter(p => p.row >= 2);
    const carries = backLinePositions.filter(p => 
      p.champion && ['Kalista', 'Kindred', 'Yasuo'].includes(p.champion.name)
    );

    if (carries.length > 0) {
      // Corner positioning for carries
      const cornerPositions = [
        { row: 3, col: 0 }, { row: 3, col: 6 }, // Back corners
        { row: 2, col: 0 }, { row: 2, col: 6 }  // Mid corners
      ];
      
      carries.forEach(carry => {
        const isInCorner = cornerPositions.some(corner => 
          corner.row === carry.row && corner.col === carry.col
        );
        
        if (!isInCorner) {
          const availableCorner = cornerPositions.find(corner =>
            !positions.some(p => p.row === corner.row && p.col === corner.col && p.champion)
          );
          
          if (availableCorner) {
            advice.push({
              position: availableCorner,
              reason: `Move ${carry.champion?.name} to corner for safety`,
              priority: 'medium',
              champion: carry.champion?.name
            });
          }
        }
      });
    }

    // Hextech/item synergy positioning
    const champions = occupiedPositions.map(p => p.champion).filter(Boolean) as Champion[];
    if (champions.length >= 3) {
      advice.push({
        position: { row: 1, col: 3 }, // Center-mid
        reason: 'Central position for aura items and protection',
        priority: 'low'
      });
    }

    return advice.slice(0, 4); // Limit to top 4 suggestions
  }, [positions, currentBoard]);

  const handlePositionClick = (row: number, col: number) => {
    if (selectedChampion) {
      // Place selected champion
      const newPositions = positions.map(p => {
        if (p.row === row && p.col === col) {
          return { ...p, champion: selectedChampion };
        }
        // Remove champion from previous position if exists
        if (p.champion?.name === selectedChampion.name) {
          return { ...p, champion: null };
        }
        return p;
      });
      
      setPositions(newPositions);
      setSelectedChampion(null);
      onPositionChange?.(newPositions);
    } else {
      // Select champion at this position
      const positionData = positions.find(p => p.row === row && p.col === col);
      if (positionData?.champion) {
        setSelectedChampion(positionData.champion);
      }
    }
  };

  const handleChampionSelect = (champion: Champion) => {
    setSelectedChampion(champion);
  };

  const clearBoard = () => {
    const emptyBoard = positions.map(p => ({ ...p, champion: null }));
    setPositions(emptyBoard);
    setSelectedChampion(null);
    onPositionChange?.(emptyBoard);
  };

  const getPositionStyle = (row: number, col: number) => {
    const position = positions.find(p => p.row === row && p.col === col);
    const isSelected = selectedChampion && position?.champion?.name === selectedChampion.name;
    const hasAdvice = positioningAdvice.some(advice => 
      advice.position.row === row && advice.position.col === col
    );
    
    let baseStyle = 'w-12 h-12 border-2 rounded-lg transition-all cursor-pointer flex items-center justify-center text-xs font-semibold ';
    
    if (position?.champion) {
      baseStyle += isSelected 
        ? 'bg-purple-600 border-purple-400 text-white ring-2 ring-purple-300 '
        : 'bg-slate-600 border-slate-500 text-white hover:bg-slate-500 ';
    } else {
      baseStyle += selectedChampion
        ? 'bg-slate-800 border-slate-600 text-gray-400 hover:bg-purple-600/20 hover:border-purple-500 '
        : hasAdvice
          ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20 '
          : 'bg-slate-800 border-slate-700 text-gray-500 hover:bg-slate-700 ';
    }

    return baseStyle;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-500/10 text-red-300';
      case 'medium': return 'border-yellow-400 bg-yellow-500/10 text-yellow-300';
      case 'low': return 'border-blue-400 bg-blue-500/10 text-blue-300';
      default: return 'border-gray-400 bg-gray-500/10 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Board Grid */}
      <div className="bg-slate-700/50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">🏁 Board Layout</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvice(!showAdvice)}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
            >
              {showAdvice ? 'Hide' : 'Show'} Advice
            </button>
            <button
              onClick={clearBoard}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Hexagonal TFT Board */}
        <div className="space-y-2">
          {Array.from({ length: BOARD_ROWS }, (_, row) => (
            <div
              key={row}
              className="flex justify-center gap-1"
              style={{ 
                marginLeft: row % 2 === 1 ? '1.5rem' : '0' // Offset odd rows for hex pattern
              }}
            >
              {Array.from({ length: BOARD_COLS }, (_, col) => {
                const position = positions.find(p => p.row === row && p.col === col);
                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => handlePositionClick(row, col)}
                    className={getPositionStyle(row, col)}
                    title={position?.champion?.name || `Row ${row + 1}, Col ${col + 1}`}
                  >
                    {position?.champion ? position.champion.name.slice(0, 3) : ''}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-sm text-gray-400">
          <p>↑ Back Line (Carries) | Front Line (Tanks) ↓</p>
        </div>
      </div>

      {/* Champion Selection */}
      <div className="bg-slate-700/50 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">🎯 Your Champions</h3>
        {currentBoard.length === 0 ? (
          <p className="text-gray-400 text-sm">Add champions in Manual Mode to position them here</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currentBoard.map((champion, index) => (
              <button
                key={`${champion.name}-${index}`}
                onClick={() => handleChampionSelect(champion)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  selectedChampion?.name === champion.name
                    ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                    : 'bg-slate-600 text-white hover:bg-slate-500'
                }`}
              >
                {champion.name} ⭐{champion.stars}
              </button>
            ))}
          </div>
        )}
        {selectedChampion && (
          <p className="mt-2 text-purple-300 text-sm">
            Click an empty position to place {selectedChampion.name}
          </p>
        )}
      </div>

      {/* Positioning Advice */}
      {showAdvice && positioningAdvice.length > 0 && (
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">💡 Positioning Tips</h3>
          <div className="space-y-2">
            {positioningAdvice.map((advice, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getPriorityColor(advice.priority)}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium">
                    Position ({advice.position.row + 1}, {advice.position.col + 1})
                    {advice.champion && ` - ${advice.champion}`}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-black/20">
                    {advice.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm opacity-90">{advice.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positioning Guide */}
      <div className="bg-slate-700/30 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">📚 Positioning Guide</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-purple-300 font-medium mb-2">🛡️ Tank Positioning</h4>
            <ul className="text-gray-300 space-y-1">
              <li>• Place tanks in front rows (1-2)</li>
              <li>• Center tanks to protect multiple carries</li>
              <li>• Spread tanks to avoid AoE damage</li>
            </ul>
          </div>
          <div>
            <h4 className="text-red-300 font-medium mb-2">⚔️ Carry Positioning</h4>
            <ul className="text-gray-300 space-y-1">
              <li>• Place carries in back corners for safety</li>
              <li>• Keep distance from enemy assassins</li>
              <li>• Position for maximum attack range</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}