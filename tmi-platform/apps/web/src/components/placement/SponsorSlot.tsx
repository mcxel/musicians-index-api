"use client";
import Link from "next/link";
import AdSenseUnit from "@/components/placement/AdSenseUnit";

interface SponsorSlotProps {
  sponsorName?: string;
  sponsorSlug?: string;
  logoText?: string;
  tagline?: string;
  color?: string;
  zone?: string;
  compact?: boolean;
}

export default function SponsorSlot({ sponsorName = "Sponsor", sponsorSlug = "#", logoText, tagline, color = "#AA2DFF", zone, compact = false }: SponsorSlotProps) {
  const isPlaceholder = sponsorSlug === "#";

  if (compact) {
    if (isPlaceholder) {
      return <AdSenseUnit format="horizontal" style={{ minWidth: 120, height: 28 }} />;
    }
    return (
      <Link href={`/sponsors/${sponsorSlug}`} aria-label={`Sponsored by ${sponsorName}`}
        style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", background:`${color}10`, border:`1px solid ${color}20`, borderRadius:5, textDecoration:"none" }}>
        <span style={{ fontSize:7, letterSpacing:"0.15em", color:`${color}80`, fontWeight:700 }}>SPONSORED</span>
        <span style={{ fontSize:9, fontWeight:800, color }}>{sponsorName}</span>
      </Link>
    );
  }

  if (isPlaceholder) {
    return <AdSenseUnit format="rectangle" style={{ minHeight: 90, width: "100%" }} />;
  }
  return (
    <Link href={`/sponsors/${sponsorSlug}`} aria-label={`Sponsored by ${sponsorName}`}
      style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:`${color}08`, border:`1px solid ${color}18`, borderRadius:9, textDecoration:"none" }}>
      <div style={{ width:40, height:40, borderRadius:8, background:`${color}18`, border:`1px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color, flexShrink:0 }}>
        {logoText ?? sponsorName.slice(0,2).toUpperCase()}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:7, letterSpacing:"0.15em", color:`${color}70`, fontWeight:700, marginBottom:2 }}>SPONSORED BY</div>
        <div style={{ fontSize:12, fontWeight:900, color }}>{sponsorName}</div>
        {tagline && <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", marginTop:1 }}>{tagline}</div>}
      </div>
      <span style={{ fontSize:9, color, fontWeight:700 }}>VISIT →</span>
    </Link>
  );
}
