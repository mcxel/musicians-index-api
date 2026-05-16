import Link from "next/link";
import type { MagazineArticle } from "@/lib/magazine/magazineIssueData";

type ArticleFeatureTileProps = {
  article: MagazineArticle;
  accent: string;
};

export default function ArticleFeatureTile({ article, accent }: ArticleFeatureTileProps) {
  return (
    <article
      style={{
        borderRadius: 18,
        border: `1px solid ${accent}66`,
        background: `linear-gradient(140deg, ${accent}34, rgba(255,255,255,0.1) 36%, ${accent}14 100%)`,
        padding: "20px 20px 18px",
        minHeight: 260,
        position: "relative",
        overflow: "hidden",
      }}
      className="tile-pulse"
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.14), transparent 56%)", transform: "translateX(-130%)", animation: "headlineFlicker 6s linear infinite" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", color: accent, textTransform: "uppercase" }}>Feature Tile</span>
          <span style={{ fontSize: 34 }}>{article.icon}</span>
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: "clamp(1.4rem, 3.3vw, 2.4rem)", lineHeight: 1.07, fontWeight: 900 }}>
          {article.title}
        </h1>
        <p style={{ margin: "0 0 14px", color: "rgba(255,255,255,0.82)", lineHeight: 1.5, fontSize: 13 }}>{article.subtitle}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link
            href={`/magazine/article/${article.slug}`}
            style={{ textDecoration: "none", color: "#0a0a12", background: accent, padding: "8px 14px", borderRadius: 8, fontSize: 10, letterSpacing: "0.12em", fontWeight: 800 }}
            className="video-button"
          >
            OPEN STORY
          </Link>
          <span style={{ fontSize: 10, letterSpacing: "0.11em", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "8px 12px" }}>
            ▶ WATCH CLIP
          </span>
        </div>
      </div>
    </article>
  );
}
