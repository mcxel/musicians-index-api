"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export interface DashboardEscapeButtonProps {
  href?: string;
  label?: string;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
}

export default function DashboardEscapeButton({
  href = "/",
  label = "EXIT",
  position = "bottom-right",
}: DashboardEscapeButtonProps) {
  const positionStyle: React.CSSProperties =
    position === "bottom-right"
      ? { bottom: 28, right: 28 }
      : position === "bottom-left"
      ? { bottom: 28, left: 28 }
      : { bottom: 28, left: "50%", transform: "translateX(-50%)" };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      style={{ position: "fixed", zIndex: 999, ...positionStyle }}
    >
      <Link
        href={href}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "9px 18px",
          borderRadius: 30,
          background: "rgba(5,5,20,0.88)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.6)",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textDecoration: "none",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          transition: "border-color 0.2s, color 0.2s",
        }}
      >
        <span style={{ fontSize: 12 }}>⬡</span>
        {label}
      </Link>
    </motion.div>
  );
}
