'use client';

import { motion } from 'framer-motion';

const StatCard = ({ label, value, color, isPrice }: any) => (
  <div className={`p-10 bg-zinc-900 border border-${color}-500/30 rounded-[3rem] shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
    <p className="text-gray-500 text-[10px] uppercase font-black mb-2">{label}</p>
    <p className={`text-4xl font-black text-${color}-400`}>{isPrice ? `$${value}` : value}</p>
  </div>
);

/**
 * TMI Omega Command HUD
 * 100% Visual command of the Global Index fortress.
 */
export function OmegaCommandHUD({ stats, defenseLog }: { stats: any, defenseLog: any[] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-20 bg-black min-h-screen border-[10px] border-emerald-500 rounded-[6rem]">
      <div className="flex justify-between items-center mb-20">
        <h1 className="text-8xl font-black italic text-emerald-500 uppercase tracking-tighter">
          SINGULARITY_OS
        </h1>
        <div className="text-right text-emerald-400 font-mono text-sm">
           <p>SYSTEM_UPTIME: 100.00%</p>
           <p>DEFENSE_GARRISON: UNHACKABLE</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-10">
        <StatCard label="Global Fans" value={stats.fans} color="emerald" />
        <StatCard label="Bots Deflected" value={stats.botsBlocked} color="blue" />
        <StatCard label="Active Ventures" value={stats.tours} color="purple" />
        <StatCard label="Revenue Flow" value={stats.revenue} color="green" isPrice={true} />
      </div>

      {/* Real-time Defense Log */}
      <div className="mt-20 p-10 bg-white/5 rounded-[4rem] border border-emerald-500/30">
        <p className="text-emerald-500 font-bold uppercase text-xs mb-4 tracking-widest italic">Defense_Army_Tactical_Log</p>
        <div className="h-48 overflow-y-auto space-y-2 font-mono text-[10px] text-emerald-400/70">
          {defenseLog.map((log, i) => (
            <p key={i}>[{log.timestamp}] Sentinel_{log.sector}: Intercepted and neutralized {log.threat}.</p>
          ))}
        </div>
      </div>
      <div data-mem-align="16384" className="hidden" />
    </motion.div>
  );
}