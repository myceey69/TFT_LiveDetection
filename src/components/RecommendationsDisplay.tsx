import { CompMatch } from '../utils/StrategyEngine';
import { Recommendation } from '../utils/RecommendationEngine';

interface RecommendationsDisplayProps {
  bestComp: CompMatch | null;
  recommendations: Recommendation[];
}

export default function RecommendationsDisplay({ 
  bestComp, 
  recommendations 
}: RecommendationsDisplayProps) {
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S': return 'text-yellow-400 bg-yellow-400/10';
      case 'A': return 'text-blue-400 bg-blue-400/10';
      case 'B': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-500/5';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/5';
      case 'low': return 'border-l-blue-500 bg-blue-500/5';
      default: return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  if (!bestComp) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">🎯</div>
        <p className="text-gray-300 text-lg">
          Add champions to your board to see recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Best Fitting Composition */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-white">{bestComp.compName}</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded ${getTierColor(bestComp.tier)}`}>
                {bestComp.tier} Tier
              </span>
            </div>
            <p className="text-gray-300 text-sm">{bestComp.description}</p>
          </div>
        </div>

        {/* Similarity Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Match Strength</span>
            <span className="text-sm font-semibold text-white">{bestComp.similarity}%</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                bestComp.similarity >= 70
                  ? 'bg-green-500'
                  : bestComp.similarity >= 40
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${bestComp.similarity}%` }}
            />
          </div>
        </div>

        {/* Missing Units */}
        {bestComp.missingUnits.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-purple-300 mb-2">
              Missing Units ({bestComp.missingUnits.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {bestComp.missingUnits.slice(0, 5).map((unit) => (
                <span
                  key={unit.name}
                  className="bg-slate-600 text-white text-xs px-3 py-1 rounded-full"
                >
                  {unit.name} {'⭐'.repeat(unit.stars)}
                </span>
              ))}
              {bestComp.missingUnits.length > 5 && (
                <span className="text-xs text-gray-400 px-2 py-1">
                  +{bestComp.missingUnits.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Recommendations */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>💡</span>
          Top 3 Next Moves
        </h3>

        {recommendations.length === 0 ? (
          <div className="bg-slate-700/50 rounded-lg p-6 text-center text-gray-400">
            No recommendations available
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={rec.id}
                className={`bg-slate-700 rounded-lg p-4 border-l-4 ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{rec.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-purple-400">
                        #{index + 1}
                      </span>
                      <h4 className="text-white font-semibold">{rec.title}</h4>
                    </div>
                    <p className="text-sm text-gray-300">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="bg-slate-700/30 rounded-lg p-4 border border-purple-500/10">
        <p className="text-xs text-gray-400 text-center">
          💡 Recommendations update as you build your board
        </p>
      </div>
    </div>
  );
}
