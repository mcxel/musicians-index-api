/**
 * GlobalMotionHooks
 * Core kinetic animations for cards, badges, belts, and monitors.
 */
import { useAnimation } from "framer-motion";
import { useEffect } from "react";

export function usePulse(duration = 2, minOpacity = 0.6) {
  const controls = useAnimation();
  useEffect(() => {
    controls.start({
      opacity: [minOpacity, 1, minOpacity],
      scale: [0.98, 1.02, 0.98],
      transition: { duration, repeat: Infinity, ease: "easeInOut" },
    });
  }, [controls, duration, minOpacity]);
  return controls;
}

export function useGlow(color = "#00FFFF", duration = 3) {
  const controls = useAnimation();
  useEffect(() => {
    controls.start({
      boxShadow: [`0 0 10px ${color}40`, `0 0 30px ${color}80`, `0 0 10px ${color}40`],
      transition: { duration, repeat: Infinity, ease: "easeInOut" },
    });
  }, [controls, color, duration]);
  return controls;
}

export function useRotate(duration = 10) {
  const controls = useAnimation();
  useEffect(() => {
    controls.start({
      rotate: [0, 360],
      transition: { duration, repeat: Infinity, ease: "linear" },
    });
  }, [controls, duration]);
  return controls;
}