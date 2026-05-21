import React, { useState, useEffect } from 'react';

interface CinemationCanvasProps {
  assets: string[];
  intervalMs?: number;
  overlayOpacity?: number;
  feathering?: boolean;
}

export const CinemationCanvas: React.FC<CinemationCanvasProps> = ({
  assets,
  intervalMs = 8000,
  overlayOpacity = 0.6,
  feathering = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!assets || assets.length === 0) return;
    const cycle = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % assets.length);
    }, intervalMs);
    return () => clearInterval(cycle);
  }, [assets, intervalMs]);

  if (!assets.length) return <div className="bg-black w-full h-full absolute inset-0" />;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black z-0 pointer-events-none">
      {assets.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-2000 ease-in-out ${
            index === currentIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
          }`}
          style={{
            backgroundImage: `url('${src}')`,
            filter: feathering ? 'blur(2px) brightness(0.8)' : 'none',
            transformOrigin: 'center center'
          }}
        />
      ))}
      {/* Dark Overlay for UI Readability */}
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-500"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
};

export default CinemationCanvas;