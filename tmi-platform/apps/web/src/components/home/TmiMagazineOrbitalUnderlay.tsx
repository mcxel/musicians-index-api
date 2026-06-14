import React from 'react';

/**
 * TmiMagazineOrbitalUnderlay
 * The scrolling tabloid underlay and orbital wheel.
 */
export const TmiMagazineOrbitalUnderlay: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center opacity-40">
      {/* Scrolling Tabloid Strip */}
      <div className="w-full h-24 bg-[#FFD700] flex items-center overflow-hidden mb-10 transform -skew-y-2 border-y-4 border-black shadow-[0_0_30px_#FFD700]">
        <div className="whitespace-nowrap font-black text-6xl text-black uppercase tracking-tighter mix-blend-multiply">
          WHO TOOK THE CROWN • BATTLE NIGHT • WHO'S GOT THE BARS • CHALLENGE THE CROWN •
        </div>
      </div>

      {/* Placeholder for the 10-artist Orbital Wheel */}
      <div className="relative w-full h-[500px] flex items-center justify-center">
        <div className="absolute w-[600px] h-[600px] rounded-full border border-[#00FFFF] animate-[spin_38s_linear_infinite] opacity-50 shadow-[0_0_50px_rgba(0,255,255,0.1)]"></div>
        <div className="absolute w-[400px] h-[400px] rounded-full border border-[#FF2DAA] animate-[spin_25s_linear_infinite_reverse] opacity-50"></div>
        
        <div className="z-10 text-[#00FFFF] font-mono text-sm uppercase tracking-widest bg-black px-4 py-2 border border-[#00FFFF]">
          Orbital Engine Active
        </div>
      </div>
    </div>
  );
};