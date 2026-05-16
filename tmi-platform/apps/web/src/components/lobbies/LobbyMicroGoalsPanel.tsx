import React from 'react';
import { useUserGoals } from '@/lib/gamification/useUserGoals';

export const LobbyMicroGoalsPanel = ({ userId }: { userId: string }) => {
  const goals = useUserGoals(userId);

  if (!goals || goals.length === 0) return null;

  return (
    <div className="absolute top-24 right-6 w-56 bg-black/70 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-40 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
      <h4 className="text-[10px] font-black text-[#FFD700] tracking-[0.15em] uppercase mb-3">Waiting Goals</h4>
      <div className="space-y-2.5">
        {goals.map(goal => (
          <div key={goal.id} className={`flex items-center gap-3 text-xs ${goal.completed ? 'text-white/90' : 'text-white/60'}`}>
            {goal.completed ? (
              <span className="text-[#00FF88] text-sm drop-shadow-[0_0_5px_#00FF88]">✓</span>
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-white/30 inline-block" />
            )}
            {goal.text}
          </div>
        ))}
      </div>
    </div>
  );
};