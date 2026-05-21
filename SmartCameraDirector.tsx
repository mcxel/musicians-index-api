import React, { useState, useEffect } from 'react';
import { decideNextLayout } from './SmartCameraDirectorEngine';

const SmartCameraDirector = ({ mode, signals, funnel }) => {
  const [layout, setLayout] = useState('default');

  useEffect(() => {
    // Dynamically decide the next layout based on signals and funnel data
    const nextLayout = decideNextLayout({ mode, layout, signals, funnel });
    setLayout(nextLayout);
  }, [mode, signals, funnel]);

  return (
    <div className={`smart-camera-director layout-${layout}`}>
      {/* Render the layout dynamically */}
      {layout === 'focusA' && <div className="camera-focus performer-a">Performer A</div>}
      {layout === 'focusB' && <div className="camera-focus performer-b">Performer B</div>}
      {layout === 'reaction' && <div className="camera-reaction">Reaction View</div>}
      {layout === 'conversionHighlight' && <div className="camera-conversion">Conversion Highlight</div>}
      {layout === 'default' && <div className="camera-default">Default View</div>}
    </div>
  );
};

export default SmartCameraDirector;