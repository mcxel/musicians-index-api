import React, { useState } from 'react';
import TMIOverlaySystem from '../foundation-visual/TMIOverlaySystem';
import { useVisualRouting } from '@/lib/hooks/useVisualAuthority';

interface CinematicNewsArticleProps {
  headline: string;
  content: string;
  videoPreviewUrl?: string;
  author: string;
}

/**
 * CinematicNewsArticle: Mapped from "The Musicians Index Magazine Images" PDF.
 * Supports static reading mode that transitions into motion/video features organically.
 */
export default function CinematicNewsArticle({ headline, content, videoPreviewUrl, author }: CinematicNewsArticleProps) {
  const [isCinematic, setIsCinematic] = useState(false);
  const { assetId: governedPreviewAsset } = useVisualRouting(
    `cinematic-article-${headline.toLowerCase().replace(/\s+/g, '-')}`,
    'magazine-cinematic-video',
    'magazine',
    {
      displayName: headline,
      sourceRoute: '/magazine',
      targetSlot: 'cinematic-news-hero',
      telemetry: 'visual_authority_applied',
      lineage: 'lineage_registered',
      recovery: 'degraded',
      overlay: 'arbitrated',
    }
  );
  const resolvedPreviewUrl = governedPreviewAsset || videoPreviewUrl;

  return (
    <article 
      className="relative w-full max-w-5xl mx-auto my-12 bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden transition-all duration-700 hover:border-cyan-500/50"
      onMouseEnter={() => setIsCinematic(true)}
      onMouseLeave={() => setIsCinematic(false)}
    >
      {isCinematic && <TMIOverlaySystem shape="magazine-feather" opacity={100} />}
      
      {/* Hero Media Block */}
      <div className="relative h-96 w-full bg-black overflow-hidden">
        {resolvedPreviewUrl && isCinematic ? (
          <video className="h-full w-full object-cover" src={resolvedPreviewUrl} autoPlay muted loop playsInline />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 to-black" />
        )}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-8 pt-32">
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight font-serif">
            {headline}
          </h1>
          <p className="text-cyan-400 font-bold tracking-widest uppercase text-xs mt-4">By {author}</p>
        </div>
      </div>

      {/* Article Content */}
      <div className="p-8 md:p-12 text-zinc-300 text-lg leading-relaxed font-serif relative z-10 bg-zinc-950">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </article>
  );
}