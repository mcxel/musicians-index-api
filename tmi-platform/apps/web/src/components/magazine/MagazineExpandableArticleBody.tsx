"use client";

import Link from "next/link";
import ExpandableMotionPanel from "@/components/motion/ExpandableMotionPanel";
import { BOUNDED_PHYSICAL_PAGE_LAW } from "@/lib/magazine/MagazineIssueContract";
import { magazineReaderArticleUrl } from "@/lib/magazine/MagazineReaderRoutes";

/**
 * Bounded Physical Page Law — long article copy on a finite magazine page:
 * COMPACT → EXPANDED_IN_PLACE (same page geometry) → FULL_READER (explicit nav).
 * Expansion must not make the page indefinitely taller.
 */
export default function MagazineExpandableArticleBody({
  paragraphs,
  articleSlug,
  accentColor = "#00FFFF",
}: {
  paragraphs: string[];
  articleSlug?: string;
  accentColor?: string;
}) {
  const budget = BOUNDED_PHYSICAL_PAGE_LAW.compactParagraphBudget;
  if (paragraphs.length <= budget) {
    return (
      <>
        {paragraphs.map((p, idx) => (
          <p key={idx} style={{ fontSize: 12, lineHeight: 1.7, margin: 0 }}>
            {p}
          </p>
        ))}
      </>
    );
  }

  const compact = paragraphs.slice(0, budget);
  const remainder = paragraphs.slice(budget);
  const fullHref = articleSlug
    ? magazineReaderArticleUrl(articleSlug)
    : undefined;

  return (
    <ExpandableMotionPanel
      variant="monitor"
      title={
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: accentColor }}>
          ARTICLE BODY · COMPACT
        </span>
      }
      collapsedPreview={
        <div style={{ display: "grid", gap: 10 }}>
          {compact.map((p, idx) => (
            <p key={idx} style={{ fontSize: 12, lineHeight: 1.7, margin: 0, color: "rgba(234,227,210,0.95)" }}>
              {p}
            </p>
          ))}
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
            +{remainder.length} more · expand in place (does not load next page)
          </span>
        </div>
      }
    >
      <div style={{ display: "grid", gap: 10 }}>
        {remainder.map((p, idx) => (
          <p key={idx} style={{ fontSize: 12, lineHeight: 1.7, margin: 0, color: "rgba(234,227,210,0.95)" }}>
            {p}
          </p>
        ))}
        {fullHref && (
          <Link
            href={fullHref}
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: "#050510",
              background: accentColor,
              textDecoration: "none",
              borderRadius: 6,
              padding: "8px 12px",
              width: "fit-content",
            }}
          >
            OPEN FULL READER
          </Link>
        )}
      </div>
    </ExpandableMotionPanel>
  );
}
