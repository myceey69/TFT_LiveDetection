import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

interface CameraScannerProps {
  onCapture?: (imageSrc: string) => void;
  isProcessing?: boolean;
}

export default function CameraScanner({ onCapture, isProcessing = false }: CameraScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const videoConstraints = {
    facingMode,
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc && onCapture) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleUserMedia = () => {
    setHasPermission(true);
  };

  const handleUserMediaError = () => {
    setHasPermission(false);
  };

  return (
    <div className="space-y-4">
      {/* Camera Feed */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        {hasPermission === false ? (
          <div className="aspect-video flex items-center justify-center bg-slate-700">
            <div className="text-center p-8">
              <div className="text-4xl mb-4">📷</div>
              <p className="text-white font-semibold mb-2">Camera Permission Required</p>
              <p className="text-gray-400 text-sm">
                Please allow camera access to use this feature
              </p>
            </div>
          </div>
        ) : (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="w-full"
          />
        )}

        {/* Overlay Guide */}
        {hasPermission && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full border-4 border-purple-500/30 rounded-lg" />
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
              Position your TFT game in the frame
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={capture}
          disabled={!hasPermission || isProcessing}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Analyzing...
            </>
          ) : (
            <>📸 Capture & Analyze</>
          )}
        </button>
        <button
          onClick={switchCamera}
          disabled={!hasPermission || isProcessing}
          className="bg-slate-700 hover:bg-slate-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
          title="Switch Camera"
        >
          🔄
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-slate-700/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-2 text-sm">📋 Tips for Best Results:</h4>
        <ul className="text-gray-300 text-xs space-y-1">
          <li>• Hold your phone steady over your game screen</li>
          <li>• Ensure good lighting - avoid glare and reflections</li>
          <li>• Position the camera parallel to the screen</li>
          <li>• Capture during shop phase for best champion detection</li>
        </ul>
      </div>

      {/* Feature Status */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">✅</div>
          <div>
            <h4 className="text-green-400 font-semibold mb-1 text-sm">
              Camera Mode - Now Active!
            </h4>
            <p className="text-green-200/80 text-xs">
              OCR and champion detection are now enabled. Capture your TFT board to automatically detect champions and game stats.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
