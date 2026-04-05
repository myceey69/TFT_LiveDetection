import { useState } from 'react'
import ManualBoardBuilder from './components/ManualBoardBuilder'
import RecommendationsDisplay from './components/RecommendationsDisplay'
import CameraScanner from './components/CameraScanner'
import { Champion } from './utils/StrategyEngine'
import { getBestFitComp } from './utils/StrategyEngine'
import { generateRecommendations } from './utils/RecommendationEngine'

function App() {
  const [mode, setMode] = useState<'manual' | 'camera'>('manual')
  const [currentBoard, setCurrentBoard] = useState<Champion[]>([])
  const [currentLevel] = useState(7) // Default level
  const [currentGold] = useState(30) // Default gold

  // Calculate best comp and recommendations when board changes
  const bestComp = getBestFitComp(currentBoard)
  const recommendations = generateRecommendations(bestComp, currentLevel, currentGold)

  const handleBoardChange = (board: Champion[]) => {
    setCurrentBoard(board)
  }

  const handleCapture = (imageSrc: string) => {
    console.log('Image captured:', imageSrc)
    // TODO: Implement OCR and champion detection
    alert('Image captured! OCR integration coming soon.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Project Tactician
          </h1>
          <p className="text-purple-300 text-lg">
            Your Live TFT Strategy Companion
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-800 rounded-lg p-1 inline-flex">
              <button
                onClick={() => setMode('manual')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  mode === 'manual'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Manual Mode
              </button>
              <button
                onClick={() => setMode('camera')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  mode === 'camera'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Camera Mode
              </button>
            </div>
          </div>

          {/* Content Area */}
          {mode === 'manual' ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Board Builder */}
              <div className="bg-slate-800 rounded-xl shadow-2xl p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">Build Your Board</h2>
                <ManualBoardBuilder onBoardChange={handleBoardChange} />
              </div>

              {/* Right Column - Recommendations */}
              <div className="bg-slate-800 rounded-xl shadow-2xl p-6">
                <h2 className="text-2xl font-semibold mb-4 text-white">Recommendations</h2>
                <RecommendationsDisplay 
                  bestComp={bestComp}
                  recommendations={recommendations}
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl shadow-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4 text-white">Camera Scanner</h2>
              <CameraScanner onCapture={handleCapture} />
            </div>
          )}

          {/* Feature Info */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="text-white font-semibold mb-1">Meta Analysis</h3>
              <p className="text-gray-400 text-sm">
                Compare your board to top-tier compositions
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">💡</div>
              <h3 className="text-white font-semibold mb-1">Smart Advice</h3>
              <p className="text-gray-400 text-sm">
                Get Top 3 best next moves in real-time
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="text-white font-semibold mb-1">100% Private</h3>
              <p className="text-gray-400 text-sm">
                All processing happens on your device
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
