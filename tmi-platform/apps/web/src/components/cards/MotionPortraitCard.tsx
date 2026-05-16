"use client";

import { ImageSlotWrapper } from '@/components/visual-enforcement';
import { motion } from "framer-motion";
import Link from "next/link";

export type MotionPortraitCardProps = {
  name: string;
  image?: string;
  accent?: string;
  size?: number;
  rank?: number;
  genre?: string;
  isLive?: boolean;
  showLabel?: boolean;
  href?: string;
  onClick?: () => void;
};

export default function MotionPortraitCard({
  name,
  image,
  accent = "#00FFFF",
  size = 72,
  rank,
  genre,
  isLive = false,
  showLabel = true,
  href,
  onClick,
}: MotionPortraitCardProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const showImage = !!image;

  const portrait = (
    <motion.div
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        border: `2px solid ${accent}55`,
        background: `radial-gradient(circle at 38% 36%, ${accent}44, ${accent}14)`,
        cursor: href || onClick ? "pointer" : "default",
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ opacity: [0.28, 0.6, 0.28] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          boxShadow: `0 0 ${Math.round(size * 0.45)}px ${accent}44 inset`,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {showImage ? (
        <ImageSlotWrapper
          imageId={`motion-portrait-${name.replace(/\s+/g, '-').toLowerCase()}`}
          roomId="motion-portrait-card"
          priority="normal"
          fallbackUrl={image}
          altText={`${name} portrait`}
          className="w-full h-full object-cover"
          containerStyle={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.88,
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: Math.round(size * 0.28),
              fontWeight: 900,
              color: accent,
              letterSpacing: "0.04em",
            }}
          >
            {initials}
          </span>
        </div>
      )}

      {rank !== undefined && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: `${Math.round(size * 0.14)}px ${Math.round(size * 0.06)}px ${Math.round(size * 0.07)}px`,
            background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.82))",
            textAlign: "center",
            zIndex: 3,
          }}
        >
          <span style={{ fontSize: Math.round(size * 0.15), fontWeight: 900, color: accent }}>
            #{rank}
          </span>
        </div>
      )}

      {isLive && (
        <motion.div
          animate={{ opacity: [1, 0.28, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: Math.round(size * 0.06),
            right: Math.round(size * 0.06),
            width: Math.round(size * 0.14),
            height: Math.round(size * 0.14),
            borderRadius: "50%",
            background: "#FF2DAA",
            boxShadow: "0 0 6px #FF2DAA",
            zIndex: 4,
          }}
        />
      )}
    </motion.div>
  );

  const label = showLabel && (
    <div style={{ marginTop: 6, textAlign: "center", maxWidth: size }}>
      <div
        style={{
          fontSize: Math.max(9, Math.round(size * 0.14)),
          fontWeight: 900,
          color: "#fff",
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </div>
      {genre && (
        <div
          style={{
            fontSize: Math.max(7, Math.round(size * 0.10)),
            color: accent,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {genre}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
        {portrait}
        {label}
      </Link>
    );
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      {portrait}
      {label}
    </div>
  );
}
