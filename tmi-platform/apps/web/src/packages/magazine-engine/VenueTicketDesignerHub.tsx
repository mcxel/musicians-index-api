import React from 'react';
import TMIOverlaySystem from '../foundation-visual/TMIOverlaySystem';

interface TicketDesignerProps {
  eventName?: string;
  venueName?: string;
  date?: string;
  venueThemeColor?: string;
}

/**
 * VenueTicketDesignerHub: Allows venues, fans, and sponsors to generate and print
 * physical or digital tickets stylized perfectly to match the 3D venue environment.
 */
export default function VenueTicketDesignerHub({ 
  eventName = "The Monthly Idol Finals", 
  venueName = "TMI Royal Arena", 
  date = "August 8, 2026", 
  venueThemeColor = "fuchsia" 
}: TicketDesignerProps) {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative min-h-screen bg-black p-8 font-sans flex flex-col items-center justify-center overflow-hidden">
      <TMIOverlaySystem shape="hologram-grid" opacity={10} />
      
      <div className="relative z-10 w-full max-w-4xl text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black italic uppercase text-white mb-2">Ticketing & Box Office Hub</h1>
        <p className="text-zinc-400 text-sm tracking-widest uppercase">Print Venue-Matched Tickets Instantly</p>
      </div>

      {/* Printable Ticket Canvas */}
      <div id="tmi-printable-ticket" className={`relative z-10 w-full max-w-3xl aspect-[21/9] bg-zinc-950 rounded-3xl overflow-hidden border border-${venueThemeColor}-500/50 shadow-[0_0_50px_rgba(var(--tw-colors-${venueThemeColor}-500),0.3)] flex`}>
        <div className={`absolute inset-0 opacity-20 bg-${venueThemeColor}-500 blur-[100px] pointer-events-none`} />
        
        <div className="flex-1 p-10 flex flex-col justify-between border-r-2 border-dashed border-white/20 relative z-10">
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.3em] text-${venueThemeColor}-400 mb-2`}>VIP Access Pass</p>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic text-white leading-none">{eventName}</h2>
            <p className="text-xl text-zinc-300 mt-2 font-serif tracking-wide">{venueName}</p>
          </div>
          <p className="text-sm font-mono text-zinc-400 uppercase tracking-widest">{date} • Doors 8:00 PM</p>
        </div>

        <div className="w-64 bg-black p-8 flex flex-col items-center justify-center relative z-10">
          <div className="w-full aspect-square bg-white rounded-xl mb-4 p-2 flex items-center justify-center shadow-inner">
            {/* Simulated QR Code for Ticket Verification Pipeline */}
            <div className="w-full h-full border-4 border-black bg-[url('/effects/scanline.png')] bg-cover opacity-80" />
          </div>
          <button onClick={handlePrint} className={`w-full py-2 bg-${venueThemeColor}-600 hover:bg-${venueThemeColor}-500 text-white text-xs font-black tracking-widest uppercase rounded cursor-pointer transition-colors`}>Print Pass</button>
        </div>
      </div>
    </div>
  );
}