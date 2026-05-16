import React from "react";

export function GridUnderlay() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20 z-0" 
         style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
    </div>
  );
}