import React from 'react';

export const StageQueueTerminal = () => {
  return (
    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
      <div className="w-16 h-16 rounded-xl bg-[#AA2DFF]/20 border-2 border-[#AA2DFF]/50 flex flex-col items-center justify-center cursor-pointer hover:bg-[#AA2DFF]/40 hover:border-[#AA2DFF] hover:scale-105 transition-all shadow-[0_0_20px_rgba(170,45,255,0.3)] group backdrop-blur-md">
        <span className="text-xl drop-shadow-md">🎤</span>
        <span className="text-[8px] font-black uppercase tracking-widest mt-1 text-[#AA2DFF] group-hover:text-white transition-colors">
          Queue
        </span>
      </div>
    </div>
  );
};