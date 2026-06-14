"use client";

import React, { useState } from 'react';

/**
 * OmniDashboards
 * Implements Phase 3: Progressive Disclosure.
 * Defaults to collapsed/minimized. Exposes Studio Mode behind a toggle.
 */
export const OmniDashboards: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStudioMode, setIsStudioMode] = useState(false);

  // Instant Interaction - no generic link redirects
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const toggleStudioMode = () => setIsStudioMode(!isStudioMode);

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col items-end pointer-events-none p-4">
      
      {/* STUDIO MODE / PRO TOGGLE */}
      <div className="mb-4 pointer-events-auto">
        <button 
          onClick={toggleStudioMode}
          className={`px-4 py-1 text-xs font-bold uppercase tracking-widest border transition-all ${
            isStudioMode 
              ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-[0_0_15px_#FFD700]' 
              : 'bg-black text-[#FFD700] border-[#FFD700] hover:bg-[#1a1700]'
          }`}
        >
          {isStudioMode ? 'Studio Mode Active' : 'Enable Studio Mode'}
        </button>
      </div>

      {/* COLLAPSIBLE UTILITY DRAWER */}
      <div className={`transition-all duration-300 ease-in-out pointer-events-auto bg-[#050510] border border-[#00FFFF] shadow-[0_0_20px_rgba(0,255,255,0.2)] rounded-tl-xl ${
        isDrawerOpen ? 'w-80 h-96 opacity-100 translate-y-0' : 'w-12 h-12 opacity-90 translate-y-2'
      }`}>
        
        {/* DRAWER HEADER / TOGGLE */}
        <div 
          onClick={toggleDrawer}
          className="w-full h-12 flex items-center justify-between px-4 cursor-pointer bg-[#00FFFF] bg-opacity-10 hover:bg-opacity-20 border-b border-[#00FFFF] rounded-tl-xl"
        >
          {isDrawerOpen ? (
            <>
              <span className="text-[#00FFFF] font-mono text-sm font-bold tracking-widest">UTILITY COMMS</span>
              <span className="text-[#00FFFF]">▼</span>
            </>
          ) : (
            <span className="text-[#00FFFF] w-full text-center">▲</span>
          )}
        </div>

        {/* DRAWER CONTENT (Rendered only when open) */}
        {isDrawerOpen && (
          <div className="p-4 flex flex-col gap-4 h-[calc(100%-3rem)] overflow-y-auto">
            <div className="p-3 bg-black border border-[#FF2DAA] rounded">
              <h4 className="text-[#FF2DAA] text-xs font-bold mb-2 uppercase">Messenger Widget</h4>
              <p className="text-gray-400 text-xs">Direct messaging active...</p>
            </div>
            <div className="p-3 bg-black border border-[#AA2DFF] rounded">
              <h4 className="text-[#AA2DFF] text-xs font-bold mb-2 uppercase">Favorites Track List</h4>
              <p className="text-gray-400 text-xs">No tracks currently playing.</p>
            </div>
            {isStudioMode && (
              <div className="p-3 bg-black border border-[#FFD700] rounded">
                <h4 className="text-[#FFD700] text-xs font-bold mb-2 uppercase">Pro Analytics</h4>
                <p className="text-gray-400 text-xs">Live stream health: STABLE</p>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
};