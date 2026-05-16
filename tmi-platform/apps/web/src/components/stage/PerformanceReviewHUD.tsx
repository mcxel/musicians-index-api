"use client";

import { motion } from "framer-motion";
import type { FunnelMetrics } from "@/modules/analytics/FanConversionFunnelEngine";

interface PerformanceReviewProps {
  metrics: FunnelMetrics;
}

export function PerformanceReviewHUD({ metrics }: PerformanceReviewProps) {
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0, scale: 0.9 }}
      animate={{ rotateY: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      style={{ transformStyle: "preserve-3d", transformOrigin: "left center" }}
      className="relative w-full max-w-3xl mx-auto p-12 bg-zinc-900 border-l-8 border-cyan-500 rounded-r-3xl shadow-[30px_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
    >
      {/* Paper/Magazine Texture Overlay */}
      <div className="absolute inset-0 bg-[url('/textures/paper-grain.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 uppercase tracking-tighter mb-2">
          Session Debrief
        </h2>
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-10">
          The Performer Truth Funnel
        </p>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Fan Retention</p>
            <p className="text-3xl text-cyan-400 font-black">{Math.round(metrics.existingFanRetained * 100)}%</p>
          </div>
          <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Stranger Conversion</p>
            <p className="text-3xl text-magenta-400 font-black">{Math.round(metrics.newListenerRetained * 100)}%</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase font-bold mb-4 tracking-widest">Badges Earned</p>
          <div className="flex flex-wrap gap-4">
            {metrics.badgesEarned.length > 0 ? (
              metrics.badgesEarned.map((badge, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + (idx * 0.2), type: "spring" }}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black uppercase text-xs rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                >
                  🏅 {badge}
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-600 font-mono italic">No badges awarded this session.</p>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}