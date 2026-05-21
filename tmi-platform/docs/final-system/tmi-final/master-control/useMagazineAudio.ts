import { useCallback, useRef, useEffect } from 'react';

export const useMagazineAudio = () => {
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Preload assets to avoid interaction delay
    flipAudioRef.current = new Audio('/assets/audio/magazine/page-flip.mp3');
    ambientAudioRef.current = new Audio('/assets/audio/magazine/ambient-bed.mp3');
    ambientAudioRef.current.loop = true;
    ambientAudioRef.current.volume = 0.2;
  }, []);

  const playFlipSound = useCallback(() => {
    if (!flipAudioRef.current) return;
    flipAudioRef.current.currentTime = 0;
    flipAudioRef.current.play().catch((err) => console.warn('[Magazine Audio] Play blocked by browser:', err));
  }, []);

  const toggleAmbientMusic = useCallback((play: boolean) => {
    if (!ambientAudioRef.current) return;
    if (play) ambientAudioRef.current.play().catch(() => {});
    else ambientAudioRef.current.pause();
  }, []);

  return { playFlipSound, toggleAmbientMusic };
};