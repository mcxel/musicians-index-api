/**
 * TMI — LIVE PHOTO HOOK
 * Simulates Apple/iPhone "Live Photo" 3-second motion on hover.
 * The image subtly animates: turns slightly, glances at viewer,
 * looks at artwork, then returns to rest pose.
 * NFL-style "alive" portrait effect.
 */

import { useState, useRef, useCallback } from 'react';

export function useLivePhoto({
  duration = 3000,
  triggerOn = 'hover', // 'hover' | 'auto' | 'click'
} = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const timerRef = useRef(null);
  const frameRef = useRef(null);

  // Keyframes: [0-100] represents % through the animation
  const KEYFRAMES = [
    { t: 0,   tx:  0,   ty:  0,   rot:  0,    scale: 1.00, blink: false },
    { t: 0.1, tx: -2,   ty: -3,   rot: -0.8,  scale: 1.02, blink: false },  // subtle turn left
    { t: 0.25,tx:  1,   ty: -5,   rot:  0.3,  scale: 1.03, blink: false },  // glances up at art
    { t: 0.4, tx:  3,   ty: -2,   rot:  1.2,  scale: 1.04, blink: true  },  // looks at viewer
    { t: 0.55,tx:  1,   ty:  0,   rot:  0.5,  scale: 1.03, blink: false },
    { t: 0.7, tx: -1,   ty:  2,   rot: -0.4,  scale: 1.02, blink: false },  // looks away slightly
    { t: 0.85,tx:  0,   ty:  1,   rot:  0.2,  scale: 1.01, blink: true  },
    { t: 1.0, tx:  0,   ty:  0,   rot:  0,    scale: 1.00, blink: false },  // return to rest
  ];

  const lerp = (a, b, t) => a + (b - a) * t;

  const getTransformAtTime = useCallback((progress) => {
    let prev = KEYFRAMES[0];
    let next = KEYFRAMES[KEYFRAMES.length - 1];

    for (let i = 0; i < KEYFRAMES.length - 1; i++) {
      if (progress >= KEYFRAMES[i].t && progress <= KEYFRAMES[i + 1].t) {
        prev = KEYFRAMES[i];
        next = KEYFRAMES[i + 1];
        break;
      }
    }

    const localT = prev.t === next.t ? 0 : (progress - prev.t) / (next.t - prev.t);

    return {
      tx:    lerp(prev.tx,    next.tx,    localT),
      ty:    lerp(prev.ty,    next.ty,    localT),
      rot:   lerp(prev.rot,   next.rot,   localT),
      scale: lerp(prev.scale, next.scale, localT),
      blink: localT > 0.4 && localT < 0.6 ? next.blink : false,
    };
  }, []);

  const play = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setFrame(progress);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setIsPlaying(false);
        setFrame(0);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [duration, isPlaying]);

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    clearTimeout(timerRef.current);
    setIsPlaying(false);
    setFrame(0);
  }, []);

  const transform = getTransformAtTime(frame);

  const getStyle = () => ({
    transform: [
      `translate(${transform.tx}px, ${transform.ty}px)`,
      `rotate(${transform.rot}deg)`,
      `scale(${transform.scale})`,
    ].join(' '),
    transition: isPlaying ? 'none' : `transform 0.5s ease`,
    filter: transform.blink ? 'brightness(1.05)' : 'brightness(1)',
  });

  const handlers = triggerOn === 'hover'
    ? { onMouseEnter: play, onMouseLeave: stop }
    : triggerOn === 'click'
    ? { onClick: isPlaying ? stop : play }
    : {};

  return {
    isPlaying,
    frame,
    style: getStyle(),
    handlers,
    play,
    stop,
  };
}

/**
 * LivePhotoImage component
 * Drop-in replacement for <img> with 3-second live photo effect
 *
 * Usage:
 *   <LivePhotoImage src="..." alt="..." className="..." />
 */
export function LivePhotoImage({ src, alt, className = '', width, height, style: extStyle }) {
  const { style, handlers } = useLivePhoto({ duration: 3000, triggerOn: 'hover' });

  return (
    <div className={`live-photo-wrapper ${className}`}
      style={{ overflow: 'hidden', display: 'inline-block', borderRadius: 'inherit', ...extStyle }}
      {...handlers}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          willChange: 'transform',
          ...style,
        }}
        loading="lazy"
      />
    </div>
  );
}

export default useLivePhoto;
