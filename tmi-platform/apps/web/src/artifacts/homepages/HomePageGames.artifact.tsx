import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildHomepageStarburst } from "@/lib/homepage/tmiHomepageStarburstTransitionEngine";

// ─── INTERFACES ─────────────────────────────────────────────────────────────
type GameType = 'BATTLE' | 'CYPHER' | 'COMEDY' | 'TRIVIA' | 'GAMESHOW' | 'BEATS' | 'TALENT';
type WinnerCategory = 'ARTIST_WINNER' | 'FAN_WINNER' | 'COMEDIAN_WINNER' | 'BATTLE_WINNER' | 'CYPHER_WINNER';
type UpcomingType = 'BRACKET' | 'SHOW' | 'CONTEST' | 'TOURNAMENT' | 'CYPHER';
type PrizePoolType = 'LADDER' | 'SEASON' | 'WEEKLY' | 'CLAIM' | 'RAFFLE';

interface GameNode {
  id: string;
  title: string;
  status: 'LIVE' | 'UPCOMING' | 'ARCHIVED';
  type: GameType;
  imageUrl: string;
  playersActive?: number;
  color: string;
}

interface WinnerNode {
  id: string;
  name: string;
  category: WinnerCategory;
  prize: string;
  color: string;
  avatarUrl?: string;
}

interface UpcomingNode {
  id: string;
  title: string;
  date: string;
  type: UpcomingType;
  color: string;
}

interface PrizePoolNode {
  id: string;
  sponsor: string;
  poolAmount: string;
  type: PrizePoolType;
}

// ─── TMI GAME CANON AUTHORITY ───────────────────────────────────────────────
const TMI_GAMES: GameNode[] = [
  { id: 'g1', title: 'Dirty Dozens', status: 'LIVE', type: 'BATTLE', playersActive: 2450, imageUrl: '/assets/games/dirty-dozens.jpg', color: '#FF2DAA' },
  { id: 'g2', title: 'Cypher Arena', status: 'LIVE', type: 'CYPHER', playersActive: 8920, imageUrl: '/assets/games/dance-party.jpg', color: '#00FFFF' },
  { id: 'g3', title: 'Joke-Offs', status: 'UPCOMING', type: 'COMEDY', imageUrl: '/assets/games/monday-stage.jpg', color: '#FFD700' },
  { id: 'g4', title: 'Name That Tune', status: 'ARCHIVED', type: 'TRIVIA', imageUrl: '/assets/games/trivia.jpg', color: '#00FF88' },
  { id: 'g5', title: 'Deal Draft', status: 'UPCOMING', type: 'GAMESHOW', imageUrl: '/assets/games/deal.jpg', color: '#AA2DFF' },
  { id: 'g6', title: 'Producer Clash', status: 'LIVE', type: 'BEATS', playersActive: 3100, imageUrl: '/assets/games/beats.jpg', color: '#FF2DAA' },
  { id: 'g7', title: 'Singer Clash', status: 'UPCOMING', type: 'TALENT', imageUrl: '/assets/games/singers.jpg', color: '#00FFFF' },
  { id: 'g8', title: 'DJ Clash', status: 'ARCHIVED', type: 'BATTLE', imageUrl: '/assets/games/dj.jpg', color: '#FFD700' },
  { id: 'g9', title: 'Beat Battle', status: 'LIVE', type: 'BEATS', playersActive: 4200, imageUrl: '/assets/games/beat-battle.jpg', color: '#00FF88' },
];

// Mandatory 5-Category Board
const WEEKLY_WINNERS_BOARD: WinnerNode[] = [
  { id: 'w1', name: 'Wavetek', category: 'ARTIST_WINNER', prize: 'Magazine Cover', color: '#FF2DAA' },
  { id: 'w2', name: 'Sarah J.', category: 'FAN_WINNER', prize: 'VIP Season Pass', color: '#00FFFF' },
  { id: 'w3', name: 'Kevin Gates Jr.', category: 'COMEDIAN_WINNER', prize: '$500 + Feature', color: '#FFD700' },
  { id: 'w4', name: 'Krypt', category: 'BATTLE_WINNER', prize: 'Crown Contender', color: '#00FF88' },
  { id: 'w5', name: 'Julius.B', category: 'CYPHER_WINNER', prize: 'Studio Time', color: '#AA2DFF' },
];

const UPCOMING_EVENTS: UpcomingNode[] = [
  { id: 'u1', title: 'Singer Clash: R&B Finals', date: 'Tonight 9:00 PM', type: 'BRACKET', color: '#FF2DAA' },
  { id: 'u2', title: 'DJ Clash: Electronic Wave', date: 'Tomorrow 8:00 PM', type: 'TOURNAMENT', color: '#00FFFF' },
  { id: 'u3', title: 'Beat Battle: Boom Bap', date: 'Friday 10:00 PM', type: 'CYPHER', color: '#FFD700' },
];

const PRIZE_POOLS: PrizePoolNode[] = [
  { id: 'p1', sponsor: 'SoundWave Audio', poolAmount: '$10,000 Gear Drop', type: 'SEASON' },
  { id: 'p2', sponsor: 'BeatMarket', poolAmount: '$2,500 Cash Pool', type: 'WEEKLY' },
];

const SPONSOR_PRIZES: PrizePoolNode[] = [
  { id: 'sp1', sponsor: 'Velocity Audio', poolAmount: 'Studio Monitors', type: 'CLAIM' },
  { id: 'sp2', sponsor: 'Roland', poolAmount: 'TR-808 Classic', type: 'RAFFLE' },
];

const NEXT_ISSUE_TEASERS = [
  "Producer Heatmap: Who is ruling the beat store?",
  "Cypher Arena expands: 3 new regional rooms opening.",
  "Exclusive Interview: The Rise of Wavetek."
];

// ─── ENGINE COMPONENT ───────────────────────────────────────────────────────
export const HomePageGamesArtifact: React.FC = () => {
  // Rotation Authority State
  const [featuredGameIndex, setFeaturedGameIndex] = useState(0);
  
  // Starburst visual engine
  const rays = useMemo(() => buildHomepageStarburst(1050, 16), []);

  // Rotation Timers (5s for Games Billboard)
  useEffect(() => {
    const gameTimer = setInterval(() => {
      setFeaturedGameIndex((prev) => (prev + 1) % TMI_GAMES.length);
    }, 5000);

    return () => {
      clearInterval(gameTimer);
    };
  }, []);

  const activeGame = TMI_GAMES[featuredGameIndex];

  return (
    <section className="relative w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-8 text-white font-sans overflow-hidden bg-[#06070d]">
      
      {/* --- BACKGROUND STARBURST --- */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-15">
        {rays.map((ray) => (
          <span
            key={ray.id}
            className="absolute left-1/2 top-[20%] origin-left"
            style={{
              width: `${ray.length}px`,
              height: `${ray.width}px`,
              transform: `translate(-50%,-50%) rotate(${ray.angleDeg}deg)`,
              background: `hsla(${ray.hue},95%,62%,0.32)`,
            }}
          />
        ))}
      </div>
      
      {/* --- SECTION A: Games Billboard (Rotating) --- */}
      <div 
        className="relative z-10 w-full h-[420px] overflow-hidden group cursor-pointer transition-all duration-500"
        style={{ 
          clipPath: 'polygon(1% 0, 100% 0, 99% 100%, 0 100%)',
          border: `3px solid ${activeGame.color}60`,
          boxShadow: `0 0 40px ${activeGame.color}25, inset 0 0 20px ${activeGame.color}20`,
          background: 'rgba(0,0,0,0.8)'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGame.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col justify-end p-8 md:p-12"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.95) 10%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%), url(${activeGame.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              {activeGame.status === 'LIVE' ? (
                <span className="px-3 py-1 bg-red-600 text-white text-[10px] tracking-widest font-black uppercase border border-red-400 shadow-[0_0_15px_rgba(255,0,0,0.6)] animate-pulse" style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}>
                  ● LIVE NOW
                </span>
              ) : (
                <span className="px-3 py-1 bg-zinc-800 text-zinc-300 border border-zinc-600 text-[10px] tracking-widest font-black uppercase" style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}>
                  {activeGame.status}
                </span>
              )}
              <span 
                className="px-3 py-1 text-[10px] tracking-widest font-black uppercase" 
                style={{ color: activeGame.color, border: `1px solid ${activeGame.color}`, background: `${activeGame.color}15`, clipPath: 'polygon(0 0, 95% 0, 100% 100%, 5% 100%)' }}
              >
                {activeGame.type}
              </span>
              {activeGame.playersActive && (
                <span className="text-zinc-300 text-xs font-bold tracking-wider ml-2">
                  {activeGame.playersActive} watching
                </span>
              )}
            </div>
            <h2 
              className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-2 transition-colors"
              style={{ color: '#fff', textShadow: `0 0 20px ${activeGame.color}80` }}
            >
              {activeGame.title}
            </h2>
          </motion.div>
        </AnimatePresence>
        
        {/* Rotation Indicators */}
        <div className="absolute bottom-6 right-8 flex gap-2 z-20">
          {TMI_GAMES.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 transition-all duration-500 ${idx === featuredGameIndex ? 'w-10 bg-white shadow-[0_0_10px_#fff]' : 'w-3 bg-zinc-600'}`}
              style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}
            />
          ))}
        </div>
      </div>

      {/* --- SECTION B: Who Won This Week (Full Board) --- */}
      <div className="relative z-10 w-full">
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
            Who Won This Week
          </h3>
          <div className="h-px flex-1 bg-gradient-to-r from-[#FFD700] to-transparent opacity-30" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {WEEKLY_WINNERS_BOARD.map((winner) => (
            <div 
              key={winner.id} 
              className="relative p-4 bg-black/80 backdrop-blur-md transition-transform hover:-translate-y-1 cursor-pointer"
              style={{ 
                border: `1px solid ${winner.color}40`,
                clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)',
                boxShadow: `inset 0 0 20px ${winner.color}10`
              }}
            >
              <p className="text-[9px] font-black tracking-[0.2em] mb-2" style={{ color: winner.color }}>{winner.category.replace(/_/g, ' ')}</p>
              <p className="text-lg font-black uppercase text-white tracking-tight leading-tight">{winner.name}</p>
              <p className="text-[10px] text-zinc-400 mt-2 font-bold tracking-wider uppercase border-t border-white/10 pt-2">Prize: {winner.prize}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- SECTION C: Coming Next (Schedule) --- */}
        <div className="bg-black/60 border border-cyan-400/30 p-6 backdrop-blur-sm" style={{ clipPath: 'polygon(0 0, 98% 0, 100% 100%, 2% 100%)' }}>
          <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 mb-5">Coming Next</h3>
          <div className="flex flex-col gap-4">
            {UPCOMING_EVENTS.map((event) => (
              <div key={event.id} className="flex items-center justify-between group cursor-pointer border-b border-white/5 pb-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-white group-hover:text-cyan-300 transition-colors">{event.title}</p>
                  <p className="text-[10px] font-bold text-zinc-500 tracking-widest mt-1">{event.date}</p>
                </div>
                <span 
                  className="text-[8px] font-black px-2 py-1 uppercase" 
                  style={{ color: event.color, border: `1px solid ${event.color}50`, background: `${event.color}15`, clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}
                >
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECTION D & E: Prize Pools & Sponsor Prizes --- */}
        <div className="bg-black/60 border border-[#FF2DAA] p-6 backdrop-blur-sm lg:col-span-2" style={{ clipPath: 'polygon(2% 0, 100% 0, 98% 100%, 0 100%)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Active Prize Pools */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#FF2DAA] mb-5">Active Prize Pools</h3>
              <div className="flex flex-col gap-3">
                {PRIZE_POOLS.map((pool) => (
                  <div key={pool.id} className="flex items-center justify-between bg-black/80 p-3 border border-white/10" style={{ clipPath: 'polygon(0 0, 96% 0, 100% 100%, 4% 100%)' }}>
                    <div>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">{pool.type} POOL</p>
                      <p className="text-xs font-black uppercase text-white tracking-wider mt-0.5">{pool.sponsor}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#FF2DAA] text-sm font-black tracking-widest">{pool.poolAmount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sponsor Prizes */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#FFD700] mb-5">Sponsor Rewards</h3>
              <div className="flex flex-col gap-3">
                {SPONSOR_PRIZES.map((pool) => (
                  <div key={pool.id} className="flex items-center justify-between bg-black/80 p-3 border border-white/10" style={{ clipPath: 'polygon(4% 0, 100% 0, 96% 100%, 0 100%)' }}>
                    <div>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">{pool.type} REWARD</p>
                      <p className="text-xs font-black uppercase text-white tracking-wider mt-0.5">{pool.sponsor}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#FFD700] text-sm font-black tracking-widest">{pool.poolAmount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* --- SECTION F: What's Coming In Next Magazine --- */}
      <div className="relative z-10 w-full mt-2">
        <div 
          className="bg-gradient-to-r from-[#AA2DFF] to-[#FF2DAA] p-1"
          style={{ clipPath: 'polygon(1% 0, 100% 0, 99% 100%, 0 100%)' }}
        >
          <div className="bg-black p-6 flex flex-col md:flex-row gap-6 items-center" style={{ clipPath: 'polygon(1% 0, 100% 0, 99% 100%, 0 100%)' }}>
            <div className="shrink-0">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Next Issue Preview</h3>
              <p className="text-[#FF2DAA] text-[10px] font-black tracking-[0.2em] uppercase mt-1">Sneak Peek · Drops Sunday</p>
            </div>
            <div className="flex-1 flex flex-col gap-2 border-l-2 border-[#AA2DFF] pl-6">
              {NEXT_ISSUE_TEASERS.map((teaser, idx) => (
                <div key={idx}>
                  <p className="text-xs md:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                    <span className="text-[#00FFFF] mr-2">///</span> {teaser}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION G: Jump Into Game (CTA Lane) --- */}
      <div className="relative z-10 w-full flex flex-wrap gap-4 mt-2 justify-center">
        <button 
          className="px-8 py-4 bg-[#FF2DAA] hover:bg-white text-black font-black uppercase tracking-[0.2em] text-sm transition-colors shadow-[0_0_20px_rgba(255,45,170,0.5)]"
          style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}
        >
          Enter Arena
        </button>
        <button 
          className="px-8 py-4 bg-[#00FFFF] hover:bg-white text-black font-black uppercase tracking-[0.2em] text-sm transition-colors shadow-[0_0_20px_rgba(0,255,255,0.5)]"
          style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}
        >
          Join Cypher
        </button>
        <button 
          className="px-8 py-4 bg-[#FFD700] hover:bg-white text-black font-black uppercase tracking-[0.2em] text-sm transition-colors shadow-[0_0_20px_rgba(255,215,0,0.5)]"
          style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}
        >
          Vote Now
        </button>
      </div>

    </section>
  );
};

export default HomePageGamesArtifact;