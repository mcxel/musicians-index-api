// ArticleCard — Slice 0 placeholder
// Magazine article card component, dark theme, PDF-style layout
// Non-obstructive sponsor/ad slot at bottom edge only
// Wired to real article data in Slice 4 (Editorial)

import type { CSSProperties } from "react";
import Link from "next/link";

export interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt?: string;
  author?: string;
  category?: string;
  imageUrl?: string;
  publishedAt?: string;
  rank?: number;
  sponsorLabel?: string;
  className?: string;
  variant?: "featured" | "standard" | "compact";
}

export default function ArticleCard({
  slug,
  title,
  excerpt,
  author,
  category,
  imageUrl,
  publishedAt,
  rank,
  sponsorLabel,
  className,
  variant = "standard",
}: ArticleCardProps) {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  return (
    <article
      className={className}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        flexDirection: isFeatured ? "row" : "column",
        gap: 0,
        transition: "border-color 0.2s",
        position: "relative",
      }}
      data-article-slug={slug}
      data-article-variant={variant}
    >
      {/* Image area */}
      {imageUrl && !isCompact && (
        <div
          style={{
            width: isFeatured ? 220 : "100%",
            minWidth: isFeatured ? 220 : undefined,
            aspectRatio: isFeatured ? "4/3" : "16/9",
            background: "rgba(255,107,53,0.08)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        </div>
      )}

      {/* Content area */}
      <div style={{ padding: isCompact ? "10px 12px" : "14px 16px", flex: 1, minWidth: 0 }}>
        {/* Category + rank row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          {category && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#ff6b35",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {category}
            </span>
          )}
          {rank !== undefined && (
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.35)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              #{rank}
            </span>
          )}
        </div>

        {/* Title */}
        <Link
          href={`/articles/${slug}`}
          style={{
            display: "-webkit-box",
            fontSize: isFeatured ? 18 : isCompact ? 13 : 15,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.3,
            marginBottom: excerpt && !isCompact ? 8 : 0,
            textDecoration: "none",
            overflow: "hidden",
            WebkitLineClamp: isFeatured ? 3 : 2,
            WebkitBoxOrient: "vertical",
          } as CSSProperties}
        >
          {title}
        </Link>

        {/* Excerpt */}
        {excerpt && !isCompact && (
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.5,
              margin: "0 0 10px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            } as CSSProperties}
          >
            {excerpt}
          </p>
        )}

        {/* Meta row */}
        {(author || publishedAt) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              marginTop: "auto",
              paddingTop: 6,
            }}
          >
            {author && <span>{author}</span>}
            {author && publishedAt && (
              <span style={{ opacity: 0.4 }}>·</span>
            )}
            {publishedAt && <time dateTime={publishedAt}>{publishedAt}</time>}
          </div>
        )}
      </div>

      {/* Sponsor label — bottom edge only, non-obstructive */}
      {sponsorLabel && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            fontSize: 9,
            color: "rgba(255,107,53,0.45)",
            padding: "2px 6px",
            background: "rgba(0,0,0,0.4)",
            borderTopLeftRadius: 4,
            letterSpacing: "0.06em",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          {sponsorLabel}
        </div>
      )}
    </article>
  );
}
