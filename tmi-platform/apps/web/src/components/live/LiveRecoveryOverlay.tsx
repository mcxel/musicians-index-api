'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type RecoveryState = 'CONNECTED' | 'RECONNECTING' | 'SYNCING_AUDIO' | 'RESTORED' | 'HOST_OFFLINE';

interface Props {
  status: RecoveryState;
}

export default function LiveRecoveryOverlay({ status }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== 'CONNECTED') {
      setVisible(true);
    }
    if (status === 'RESTORED') {
      const t = setTimeout(() => setVisible(false), 3000); // Hide "Restored" message after 3 seconds
      return () => clearTimeout(t);
    }
  }, [status]);

  const getStatusConfig = () => {
    switch (status) {
      case 'RECONNECTING': return { text: 'RECONNECTING TO LIVE SESSION...', color: '#FF2DAA', icon: '📡' };
      case 'SYNCING_AUDIO': return { text: 'SYNCING AUDIO & METADATA...', color: '#FFD700', icon: '🔊' };
      case 'RESTORED': return { text: 'LIVE CONNECTION RESTORED', color: '#00FF88', icon: '✅' };
      case 'HOST_OFFLINE': return { text: 'PERFORMER TEMPORARILY OFFLINE', color: '#FF4444', icon: '⚠️' };
      default: return { text: '', color: '#fff', icon: '' };
    }
  };

  const config = getStatusConfig();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${config.color}50`
          }}
        >
          <motion.div 
            animate={status === 'RECONNECTING' || status === 'SYNCING_AUDIO' ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ fontSize: 48, marginBottom: 16 }}
          >
            {config.icon}
          </motion.div>
          <div style={{ fontSize: 14, fontWeight: 900, color: config.color, letterSpacing: '0.2em', textTransform: 'uppercase', textShadow: `0 0 20px ${config.color}80` }}>
            {config.text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}