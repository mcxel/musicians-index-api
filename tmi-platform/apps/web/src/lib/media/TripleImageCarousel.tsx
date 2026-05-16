"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { nextRotationIndex } from "@/lib/media/SlotRotationEngine";

type TripleImageCarouselProps = {
  images: [string, string, string] | string[];
  intervalMs?: number;
  borderColor?: string;
  height?: number;
};

export default function TripleImageCarousel({
  images,
  intervalMs = 9000,
  borderColor = "#00ffff",
  height = 124,
}: TripleImageCarouselProps) {
  const safeImages = useMemo(() => {
    if (images.length >= 3) return [images[0]!, images[1]!, images[2]!];
    if (images.length === 2) return [images[0]!, images[1]!, images[0]!];
    if (images.length === 1) return [images[0]!, images[0]!, images[0]!];
    return ["/tmi-curated/home1.jpg", "/tmi-curated/home2.png", "/tmi-curated/home3.png"];
  }, [images]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => nextRotationIndex(prev, safeImages.length));
    }, Math.max(2500, intervalMs));
    return () => window.clearInterval(id);
  }, [intervalMs, safeImages.length]);

  return (
    <div
      style={{
        position: "relative",
        height,
        overflow: "hidden",
        borderRadius: 10,
        border: `1px solid ${borderColor}66`,
        background: "linear-gradient(150deg, rgba(8,8,16,0.95), rgba(3,3,8,0.95))",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${safeImages[index]}-${index}`}
          initial={{ opacity: 0.18, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.15, scale: 0.98 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              `linear-gradient(130deg, rgba(20,8,36,0.58), rgba(4,4,14,0.68)), url('${safeImages[index]}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </AnimatePresence>
      <div
        style={{
          position: "absolute",
          right: 8,
          bottom: 6,
          display: "flex",
          gap: 4,
        }}
      >
        {safeImages.map((_, i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: i === index ? borderColor : "rgba(255,255,255,0.3)",
              boxShadow: i === index ? `0 0 8px ${borderColor}` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
