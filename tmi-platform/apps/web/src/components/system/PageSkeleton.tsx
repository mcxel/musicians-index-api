"use client";
import { motion } from "framer-motion";

const pulse = {
  animate: { opacity: [0.4, 0.7, 0.4] },
  transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
};

export function SkeletonBox({ w = "100%", h = 20, radius = 4, style = {} }: { w?: string | number; h?: number; radius?: number; style?: React.CSSProperties }) {
  return (
    <motion.div {...pulse}
      style={{ width:w, height:h, borderRadius:radius, background:"rgba(255,255,255,0.08)", flexShrink:0, ...style }} />
  );
}

export function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding: compact ? 12 : 18, display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <SkeletonBox w={40} h={40} radius={8} />
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
          <SkeletonBox w="70%" h={12} />
          <SkeletonBox w="45%" h={9} />
        </div>
      </div>
      {!compact && <SkeletonBox h={10} />}
      {!compact && <SkeletonBox w="80%" h={10} />}
    </div>
  );
}

export function SkeletonList({ count = 4, compact = false }: { count?: number; compact?: boolean }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {Array.from({ length:count }).map((_, i) => <SkeletonCard key={i} compact={compact} />)}
    </div>
  );
}

export function SkeletonGrid({ cols = 3, count = 6 }: { cols?: number; count?: number }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:12 }}>
      {Array.from({ length:count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export default function PageSkeleton({ title = true, grid = false, listCount = 4 }: { title?: boolean; grid?: boolean; listCount?: number }) {
  return (
    <div style={{ padding:"40px 20px", maxWidth:800, margin:"0 auto" }}>
      {title && (
        <div style={{ marginBottom:28 }}>
          <SkeletonBox w="50%" h={28} radius={6} style={{ marginBottom:10 }} />
          <SkeletonBox w="35%" h={14} />
        </div>
      )}
      {grid ? <SkeletonGrid /> : <SkeletonList count={listCount} />}
    </div>
  );
}
