"use client";

type NameThatTuneSlot = {
  id: string;
  content: string;
  revealed: boolean;
};

/**
 * NameThatTuneBoard: The interactive game show screen display.
 * Copilot: Wire the `revealed` boolean on items to trigger the flip animation and play the sound effect.
 */
export default function NameThatTuneBoard({ slots }: { slots: NameThatTuneSlot[] }) {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-zinc-950 border-4 border-fuchsia-600 rounded-3xl shadow-[0_0_50px_rgba(217,70,239,0.3)]">
      <h2 className="text-center text-3xl font-black italic uppercase tracking-widest text-fuchsia-400 mb-8">Name That Tune</h2>
      <div className="grid grid-cols-4 gap-4">
        {slots.map((slot) => (
          <div key={slot.id} className="relative w-full h-24 perspective-1000">
            <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${slot.revealed ? 'rotate-y-180' : ''}`}>
              <div className="absolute inset-0 bg-fuchsia-900 border-2 border-fuchsia-400 rounded-xl flex items-center justify-center text-3xl font-black text-white shadow-inner backface-hidden">?</div>
              <div className="absolute inset-0 bg-white border-2 border-fuchsia-400 rounded-xl flex items-center justify-center text-lg font-bold text-black text-center p-2 rotate-y-180 backface-hidden">
                {slot.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
