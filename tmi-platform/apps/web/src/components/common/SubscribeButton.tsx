"use client";
import { motion } from "framer-motion";
import Link from "next/link";

interface SubscribeButtonProps {
  tier?: "PRO" | "VIP";
  compact?: boolean;
  label?: string;
}

export default function SubscribeButton({ tier = "PRO", compact = false, label }: SubscribeButtonProps) {
  const isPro = tier === "PRO";
  const color  = isPro ? "#00FFFF" : "#AA2DFF";
  const price  = isPro ? "$9.99/mo" : "$19.99/mo";
  const product = isPro ? "MEMBER_PRO_MONTHLY" : "MEMBER_VIP_MONTHLY";
  const displayLabel = label ?? (compact ? "SUBSCRIBE" : `GET ${tier} — ${price}`);

  return (
    <Link
      href={`/api/stripe/checkout?product=${product}`}
      aria-label={`Subscribe to ${tier} membership`}
      style={{ display:"inline-flex", alignItems:"center", gap:6, padding: compact ? "6px 14px" : "10px 20px", fontSize: compact ? 9 : 11, fontWeight:800, letterSpacing:"0.15em", color:"#050510", background:`linear-gradient(135deg,${color},${color}AA)`, borderRadius: compact ? 20 : 8, textDecoration:"none" }}>
      <motion.span whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} style={{ display:"contents" }}>
        ⭐ {displayLabel}
      </motion.span>
    </Link>
  );
}
