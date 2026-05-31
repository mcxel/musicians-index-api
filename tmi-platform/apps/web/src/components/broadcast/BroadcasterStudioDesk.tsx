'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Mic, Radio, MonitorPlay, Zap, Power, Settings, ShieldAlert } from 'lucide-react';

interface StreamNode {
  id: string;
  name: string;
  type: 'local-cam' | 'remote-guest' | 'hardware-kiosk';
  status: 'live' | 'standby' | 'offline';
  fps: number;
}

/**
 * Broadcaster Studio Desk
 * HUD for hosts, admins, and producers to switch scenes, control WebRTC streams, 
 * and trigger global platform actions (like curtains and giveaways).
 */
export default function BroadcasterStudioDesk() {
  const [activeScene, setActiveScene] = useState<string>('MAIN_STAGE');
  const [isLive, setIsLive] = useState(false);

  const nodes: StreamNode[] = [
    { id: 'cam-1', name: 'DJ_BOOTH_PI_CAM', type: 'hardware-kiosk', status: 'live', fps: 60 },
    { id: 'cam-2', name: 'HOST_WEBRTC_MAC', type: 'local-cam', status: 'live', fps: 30 },
    { id: 'cam-3', name: 'CROWD_NODE_A', type: 'remote-guest', status: 'standby', fps: 24 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050510] border border-white/10 rounded-xl overflow-hidden font-sans shadow-2xl">
      {/* Control Header */}
      <div className="flex justify-between items-center p-4 bg-black/60 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Radio size={24} className={isLive ? 'text-[#FF2020] animate-pulse' : 'text-white/40'} />
          <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white">
            Broadcast Switcher <span className="text-[#00FFFF] text-xs align-top">v2.0</span>
          </h2>
        </div>
        <button 
          onClick={() => setIsLive(!isLive)}
          className={`px-6 py-2 rounded font-black tracking-widest text-xs transition-all ${
            isLive ? 'bg-[#FF2020] text-white shadow-[0_0_15px_#FF2020]' : 'bg-white/10 text-white hover:bg-[#00FF88] hover:text-black'
          }`}
        >
          {isLive ? 'END BROADCAST' : 'GO LIVE'}
        </button>
      </div>

      {/* Multi-View Grid */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-black/40">
        {nodes.map(node => (
          <div 
            key={node.id} 
            className={`relative aspect-video rounded-lg border-2 overflow-hidden flex flex-col bg-black transition-all ${
              activeScene === node.id ? 'border-[#FF2DAA] shadow-[0_0_20px_rgba(255,45,170,0.3)]' : 'border-white/10 opacity-70 hover:opacity-100 cursor-pointer'
            }`}
            onClick={() => setActiveScene(node.id)}
          >
            {/* Mock Video Feed */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a1a] pointer-events-none z-10" />
            <div className="flex-1 flex items-center justify-center">
              <Video size={48} className="text-white/20" />
            </div>
            {/* Telemetry Overlay */}
            <div className="absolute top-2 left-2 flex gap-2 z-20">
              <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest ${node.status === 'live' ? 'bg-[#FF2020] text-white' : 'bg-white/20 text-white/50'}`}>
                {node.status.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[9px] font-mono text-[#00FFFF]">
                {node.fps} FPS
              </span>
            </div>
            <div className="absolute bottom-2 left-2 z-20 text-xs font-bold tracking-wider text-white">
              {node.name}
            </div>
          </div>
        ))}
      </div>

      {/* Master Action Deck */}
      <div className="p-6 border-t border-white/5 bg-[#0a0a1a]">
        <div className="text-xs font-bold tracking-[0.2em] text-[#FFD700] mb-4">GLOBAL ACTIONS</div>
        <div className="flex gap-4">
          <ActionBtn icon={MonitorPlay} label="OPEN CURTAINS" color="#AA2DFF" />
          <ActionBtn icon={Zap} label="TRIGGER GIVEAWAY" color="#FFD700" />
          <ActionBtn icon={ShieldAlert} label="PANIC CUT" color="#FF2020" />
          <div className="flex-1" />
          <ActionBtn icon={Settings} label="PIPELINE SETUP" color="#00FFFF" />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, color }: any) {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center justify-center gap-2 w-32 h-24 rounded-xl border bg-black/50 transition-colors"
      style={{ borderColor: `${color}40` }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${color}15`)}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)')}
    >
      <Icon size={24} color={color} />
      <span className="text-[9px] font-black tracking-widest text-center px-2" style={{ color }}>
        {label}
      </span>
    </motion.button>
  );
}