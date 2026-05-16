"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { articleSnippetRotationEngine } from "@/lib/magazine/ArticleSnippetRotationEngine";
import { seedMagazineRotationEngines } from "@/lib/magazine/magazineRotationSeeder";
import type { ArticleSnippet, SnippetSurface } from "@/lib/magazine/ArticleSnippetRotationEngine";

interface Props {
  surface?: SnippetSurface;
  count?: number;
  autoRotate?: boolean;
  title?: string;
  compact?: boolean;
}

export default function MagazineArticleRotationRail({ surface = "sidebar", count = 3, autoRotate = true, title = "FROM THE MAGAZINE", compact = false }: Props) {
  const [snippets, setSnippets] = useState<ArticleSnippet[]>([]);
  const seeded = useRef(false);

  useEffect(() => {
    if (!seeded.current) {
      seedMagazineRotationEngines();
      seeded.current = true;
    }
    const initial = articleSnippetRotationEngine.getRotation(surface);
    setSnippets(initial?.snippets.slice(0, count) ?? []);

    const unsub = articleSnippetRotationEngine.onRotation((s, set) => {
      if (s === surface) setSnippets(set.snippets.slice(0, count));
    });

    if (autoRotate) articleSnippetRotationEngine.startAutoRotation(surface);

    return () => {
      unsub();
      if (autoRotate) articleSnippetRotationEngine.stopAutoRotation(surface);
    };
  }, [surface, count, autoRotate]);

  if (snippets.length === 0) return null;

  return (
    <div>
      {title && (
        <div style={{ fontSize: 8, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 12 }}>{title}</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 8 : 12 }}>
        {snippets.map((s) => (
          <Link key={s.articleId} href={s.href}
            onClick={() => articleSnippetRotationEngine.recordClick(s.articleId)}
            style={{ textDecoration: "none", display: "block", padding: compact ? "8px 10px" : "12px 14px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, background: "rgba(255,255,255,0.02)", transition: "border-color 0.2s" }}>
            <div style={{ fontSize: compact ? 10 : 12, fontWeight: 800, color: "#fff", lineHeight: 1.4, marginBottom: 4 }}>{s.title}</div>
            {!compact && s.subtitle && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 6 }}>{s.subtitle}</div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: "#FF2DAA", letterSpacing: "0.1em" }}>
                {s.category.toUpperCase()}
              </span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>·</span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{s.author}</span>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <Link href="/magazine" style={{ fontSize: 8, fontWeight: 800, color: "#FF2DAA", letterSpacing: "0.15em", textDecoration: "none" }}>
          VIEW ALL ARTICLES →
        </Link>
      </div>
    </div>
  );
}
