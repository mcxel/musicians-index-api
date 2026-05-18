'use client';

import { motion, AnimatePresence } from 'framer-motion';

type CurtainState = 'closed' | 'opening' | 'open' | 'closing';

interface CurtainTransitionProps {
  state: CurtainState;
  color?: string;
  children?: React.ReactNode;
}

export default function CurtainTransition({
  state,
  color = '#050510',
  children,
}: CurtainTransitionProps) {
  const isVisible = state === 'closed' || state === 'opening' || state === 'closing';

  return (
    <div style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
      {children}

      <AnimatePresence>
        {isVisible && (
          <>
            {/* Left curtain panel */}
            <motion.div
              key="curtain-left"
              initial={{ x: state === 'closed' ? '0%' : '-100%' }}
              animate={{ x: state === 'opening' ? '-100%' : '0%' }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '50%', height: '100%',
                background: `linear-gradient(90deg, ${color} 70%, transparent)`,
                zIndex: 50,
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            />

            {/* Right curtain panel */}
            <motion.div
              key="curtain-right"
              initial={{ x: state === 'closed' ? '0%' : '100%' }}
              animate={{ x: state === 'opening' ? '100%' : '0%' }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'absolute',
                top: 0, right: 0,
                width: '50%', height: '100%',
                background: `linear-gradient(270deg, ${color} 70%, transparent)`,
                zIndex: 50,
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
