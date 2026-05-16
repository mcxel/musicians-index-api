import { ImageSlotWrapper } from '@/components/visual-enforcement';
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type TmiReferenceZoneProps = {
  title: string;
  subtitle: string;
  imageSrc: string;
  ctaLabel: string;
  ctaHref: string;
};

export default function TmiReferenceZone({
  title,
  subtitle,
  imageSrc,
  ctaLabel,
  ctaHref,
}: TmiReferenceZoneProps) {
  return (
    <div className="group relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-all duration-500 shadow-2xl">
      {/* Primary background media */}
      <ImageSlotWrapper imageId="img-d4h81" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />

      {/* Artifact canvas layers (keeps image alive, avoids static poster look) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.24),transparent_45%),radial-gradient(circle_at_75%_80%,rgba(217,70,239,0.2),transparent_45%)] mix-blend-screen opacity-80" />
      <div className="tmi-artifact-grid absolute inset-0 opacity-35" />
      <div className="tmi-artifact-orb tmi-artifact-orb--a" />
      <div className="tmi-artifact-orb tmi-artifact-orb--b" />

      {/* Widget cards over the scene */}
      <div className="absolute left-4 top-4 z-10 flex gap-2">
        <div className="rounded-md border border-cyan-300/35 bg-black/45 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100 backdrop-blur-sm">
          Live Artifact
        </div>
        <div className="rounded-md border border-fuchsia-300/35 bg-black/45 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-100 backdrop-blur-sm">
          Zone Surface
        </div>
      </div>

      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-95 group-hover:opacity-82 transition-opacity duration-500" />

      {/* Content payload */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end z-10">
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg mb-2">
          {title}
        </h2>
        <p className="text-sm md:text-base text-zinc-300 font-medium mb-6 max-w-lg drop-shadow-md">
          {subtitle}
        </p>
        
        <Link 
          href={ctaHref}
          className="inline-flex items-center gap-2 bg-cyan-500 text-black px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-cyan-400 hover:scale-105 transition-all w-max"
        >
          {ctaLabel} <ArrowRight size={16} className="animate-pulse" />
        </Link>
      </div>
    </div>
  );
}