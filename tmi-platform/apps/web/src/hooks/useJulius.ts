import { useState, useCallback } from 'react';

export type JuliusMode = 'hidden' | 'poll' | 'celebrate' | 'nudge';

export interface JuliusState {
  mode: JuliusMode;
  visible: boolean;
  pollPrompt?: string;
  nudgeText?: string;
}

export function useJulius() {
  const [juliusState, setJuliusState] = useState<JuliusState>({
    mode: 'hidden',
    visible: false,
  });

  const triggerJulius = useCallback(
    (mode: JuliusMode, options?: { pollPrompt?: string; nudgeText?: string }) => {
      setJuliusState({
        mode,
        visible: true,
        pollPrompt: options?.pollPrompt,
        nudgeText: options?.nudgeText,
      });

      // Auto-dismiss for transient modes so he doesn't block the screen
      if (mode === 'celebrate' || mode === 'nudge') {
        setTimeout(() => {
          setJuliusState((prev) => (prev.mode === mode ? { ...prev, visible: false } : prev));
        }, mode === 'celebrate' ? 2500 : 4500);
      }
    },
    []
  );

  const dismissJulius = useCallback(() => {
    setJuliusState((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    juliusState,
    triggerJulius,
    dismissJulius,
  };
}