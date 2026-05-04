// Editorial Page Frame — 5-template article renderer for System B.
// Templates: A=Feature, B=Split, C=Full Sponsor, D=News Stack, E=Interview
// Server component — no client hooks.

import Link from "next/link";
import type { NewsArticle } from "@/lib/editorial/NewsArticleModel";
import type { InjectedAds } from "@/lib/editorial/editorialAdInjector";
import { sliceBodyParagraphs, buildReadTime } from "@/lib/editorial/editorialPageEngine";
import type { ArticleTemplate } from "@/lib/editorial/NewsArticleModel";
import HeadlineShimmer from "./HeadlineShimmer";
import HeroColorBlock from "./HeroColorBlock";

// ─── AD BLOCKS ────────────────────────────────────────────────────────────────

function TopBanner({ placement, accentColor }: {
  placement: InjectedAds["topBanner"];
  accentColor: string;
}) {
  if (!placement) return null;
  return (
    <Link
      href={placement.ctaRoute}
      style={{ textDecoration: "none", display: "block", marginBottom: 20 }}
    >
      <div
        style={{
          padding: "10px 18px",
          borderRadius: 8,
          border: `1px solid ${accentColor}30`,
          background: `${accentColor}0a`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.2em", color: accentColor, textTransform: "uppercase" }}>
            {"sponsorName" in placement ? placement.sponsorName : placement.advertiserName} · Sponsored
          </span>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", margin: "2px 0 0" }}>
            {placement.headline}
          </p>
        </div>
        <span style={{ fontSize: 8, fontWeight: 800, color: accentColor, whiteSpace: "nowrap" as const }}>
          {placement.ctaLabel} →
        </span>
      </div>
    </Link>
  );
}

function MidArticleSponsor({ placement, accentColor }: {
  placement: InjectedAds["midArticle"];
  accentColor: string;
}) {
  if (!placement) return null;
  return (
    <Link href={placement.ctaRoute} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          margin: "28px 0",
          padding: "18px 22px",
          borderRadius: 12,
          border: `1px solid ${placement.accentColor}35`,
          background: `${placement.accentColor}08`,
          boxShadow: `0 0 30px ${placement.accentColor}0c`,
        }}
      >
        <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.3em", color: placement.accentColor, textTransform: "uppercase" as const }}>
          Sponsored · {placement.sponsorName}
        </span>
        <p style={{ fontSize: 15, fontWeight: 900, color: "#fff", margin: "6px 0 4px" }}>{placement.headline}</p>
        {placement.body && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", margin: "0 0 10px" }}>{placement.body}</p>
        )}
        <span style={{ fontSize: 9, fontWeight: 800, color: placement.accentColor }}>
          {placement.ctaLabel} →
        </span>
      </div>
    </Link>
  );
}

function SideRailSponsor({ placement }: { placement: InjectedAds["sideRail"] }) {
  if (!placement) return null;
  return (
    <Link href={placement.ctaRoute} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          padding: "14px 16px",
          borderRadius: 10,
          border: `1px solid ${placement.accentColor}30`,
          background: `${placement.accentColor}0a`,
        }}
      >
        <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.25em", color: placement.accentColor, textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>
          {placement.sponsorName} · Partner
        </span>
        <p style={{ fontSize: 12, fontWeight: 900, color: "#fff", margin: "0 0 6px" }}>{placement.headline}</p>
        {placement.body && (
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", margin: "0 0 10px" }}>{placement.body}</p>
        )}
        <span style={{ fontSize: 8, fontWeight: 800, color: placement.accentColor }}>{placement.ctaLabel} →</span>
      </div>
    </Link>
  );
}

function FooterStrip({ placement }: { placement: InjectedAds["footerStrip"] }) {
  if (!placement) return null;
  return (
    <Link href={placement.ctaRoute} style={{ textDecoration: "none", display: "block", marginTop: 32 }}>
      <div
        style={{
          padding: "10px 18px",
          borderRadius: 8,
          border: `1px solid ${placement.accentColor}22`,
          background: `${placement.accentColor}06`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span style={{ fontSize: 6, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase" as const }}>
            Advertisement · {placement.advertiserName}
          </span>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", margin: "1px 0 0" }}>{placement.headline}</p>
        </div>
        <span style={{ fontSize: 8, fontWeight: 800, color: placement.accentColor }}>{placement.ctaLabel} →</span>
      </div>
    </Link>
  );
}

// ─── ARTICLE HERO ─────────────────────────────────────────────────────────────

function ArticleHero({
  article,
  accentColor,
  profileRoute,
}: {
  article: NewsArticle;
  accentColor: string;
  profileRoute: string | null;
}) {
  return (
    <div style={{ paddingTop: 32, paddingBottom: 24, borderBottom: `1px solid ${accentColor}18` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.28em",
            color: accentColor,
            textTransform: "uppercase" as const,
            padding: "2px 8px",
            borderRadius: 4,
            border: `1px solid ${accentColor}40`,
            background: `${accentColor}10`,
          }}
        >
          {article.category}
        </span>
        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
          {buildReadTime(article.body)}
        </span>
      </div>

      {/* Motion C — hero color band pulse */}
      <HeroColorBlock heroColor={article.heroColor} accentColor={accentColor} />

      {/* Motion B — headline shimmer */}
      <HeadlineShimmer accentColor={accentColor}>
        <h1
          style={{
            fontSize: "clamp(22px, 4vw, 36px)",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            color: "#fff",
            margin: "0 0 10px",
          }}
        >
          {article.headline}
        </h1>
      </HeadlineShimmer>

      <p
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: "rgba(255,255,255,0.55)",
          margin: "0 0 16px",
          maxWidth: 680,
        }}
      >
        {article.snippet}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: `${accentColor}22`,
              border: `1px solid ${accentColor}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
            }}
          >
            ✍
          </div>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, color: "#fff", margin: 0 }}>{article.author}</p>
            <p style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", margin: 0 }}>
              {new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {profileRoute && (
          <Link
            href={profileRoute}
            style={{
              fontSize: 8,
              fontWeight: 800,
              color: accentColor,
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
              textDecoration: "none",
              padding: "4px 12px",
              borderRadius: 6,
              border: `1px solid ${accentColor}40`,
              background: `${accentColor}0c`,
            }}
          >
            View Profile →
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── BODY RENDERER ────────────────────────────────────────────────────────────

function BodyBlock({ paragraphs, accentColor }: { paragraphs: string[]; accentColor: string }) {
  return (
    <>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          style={{
            fontSize: 14,
            lineHeight: 1.75,
            color: i === 0 ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.62)",
            margin: "0 0 18px",
            borderLeft: i === 0 ? `3px solid ${accentColor}50` : "none",
            paddingLeft: i === 0 ? 14 : 0,
          }}
        >
          {p}
        </p>
      ))}
    </>
  );
}

// ─── TEMPLATE A — Standard Feature ────────────────────────────────────────────

function TemplateA({ article, accentColor, profileRoute, ads }: TemplateProps) {
  const { above, below } = sliceBodyParagraphs(article.body);
  return (
    <div style={{ paddingTop: 8 }}>
      <BodyBlock paragraphs={above} accentColor={accentColor} />
      <MidArticleSponsor placement={ads.midArticle} accentColor={accentColor} />
      <BodyBlock paragraphs={below} accentColor={accentColor} />
      <FooterStrip placement={ads.footerStrip} />
    </div>
  );
}

// ─── TEMPLATE B — Split Editorial Spread ──────────────────────────────────────

function TemplateB({ article, accentColor, ads }: TemplateProps) {
  const { above, below } = sliceBodyParagraphs(article.body, 3);
  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, alignItems: "start" }}>
        <div>
          <BodyBlock paragraphs={above} accentColor={accentColor} />
          <BodyBlock paragraphs={below} accentColor={accentColor} />
        </div>
        <div style={{ position: "sticky" as const, top: 72 }}>
          <SideRailSponsor placement={ads.sideRail} />
        </div>
      </div>
      <FooterStrip placement={ads.footerStrip} />
    </div>
  );
}

// ─── TEMPLATE C — Full Sponsor Ad Page ────────────────────────────────────────

function TemplateC({ article, accentColor, ads }: TemplateProps) {
  const fullPage = ads.fullPage;
  return (
    <div style={{ paddingTop: 32 }}>
      {fullPage ? (
        <div
          style={{
            borderRadius: 16,
            border: `2px solid ${fullPage.accentColor}40`,
            background: `linear-gradient(135deg, ${fullPage.accentColor}10, rgba(0,0,0,0.4))`,
            padding: "48px 40px",
            textAlign: "center" as const,
            marginBottom: 32,
            boxShadow: `0 0 60px ${fullPage.accentColor}12`,
          }}
        >
          <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.4em", color: fullPage.accentColor, textTransform: "uppercase" as const, marginBottom: 16 }}>
            {fullPage.sponsorName} · Exclusive Partner
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: "0 0 12px" }}>{fullPage.headline}</h2>
          {fullPage.body && (
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", margin: "0 auto 24px", maxWidth: 480 }}>{fullPage.body}</p>
          )}
          {fullPage.promoCode && (
            <div style={{
              display: "inline-block",
              padding: "8px 20px",
              borderRadius: 8,
              border: `1px solid ${fullPage.accentColor}50`,
              background: `${fullPage.accentColor}18`,
              marginBottom: 20,
            }}>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: fullPage.accentColor, textTransform: "uppercase" as const }}>
                PROMO: {fullPage.promoCode}
              </span>
            </div>
          )}
          <div>
            <Link
              href={fullPage.ctaRoute}
              style={{
                display: "inline-block",
                padding: "14px 36px",
                borderRadius: 10,
                border: `2px solid ${fullPage.accentColor}`,
                background: `${fullPage.accentColor}18`,
                color: fullPage.accentColor,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.18em",
                textTransform: "uppercase" as const,
                textDecoration: "none",
              }}
            >
              {fullPage.ctaLabel}
            </Link>
          </div>
        </div>
      ) : null}
      <BodyBlock paragraphs={article.body} accentColor={accentColor} />
    </div>
  );
}

// ─── TEMPLATE D — News Stack Feed ─────────────────────────────────────────────

function TemplateD({ article, accentColor, ads }: TemplateProps) {
  return (
    <div style={{ paddingTop: 8 }}>
      <TopBanner placement={ads.topBanner} accentColor={accentColor} />
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {article.body.map((para, i) => (
          <div
            key={i}
            style={{
              padding: "14px 0",
              borderBottom: `1px solid rgba(255,255,255,0.06)`,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 900, color: accentColor, minWidth: 20, flexShrink: 0 }}>
              {i + 1 < 10 ? `0${i + 1}` : i + 1}
            </span>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.72)", margin: 0 }}>{para}</p>
          </div>
        ))}
      </div>
      <FooterStrip placement={ads.footerStrip} />
    </div>
  );
}

// ─── TEMPLATE E — Interview Spread ────────────────────────────────────────────

function TemplateE({ article, accentColor, ads }: TemplateProps) {
  const { above, below } = sliceBodyParagraphs(article.body, 2);
  return (
    <div style={{ paddingTop: 8 }}>
      <div
        style={{
          padding: "18px 20px",
          borderRadius: 10,
          border: `1px solid ${accentColor}28`,
          background: `${accentColor}06`,
          marginBottom: 24,
        }}
      >
        <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.3em", color: accentColor, textTransform: "uppercase" as const }}>
          TMI Interview
        </span>
        <BodyBlock paragraphs={above} accentColor={accentColor} />
      </div>
      <MidArticleSponsor placement={ads.midArticle} accentColor={accentColor} />
      <BodyBlock paragraphs={below} accentColor={accentColor} />
      <FooterStrip placement={ads.footerStrip} />
    </div>
  );
}

// ─── MAIN FRAME ───────────────────────────────────────────────────────────────

interface TemplateProps {
  article: NewsArticle;
  accentColor: string;
  profileRoute: string | null;
  ads: InjectedAds;
}

interface EditorialPageFrameProps extends TemplateProps {
  templateType: ArticleTemplate;
}

export default function EditorialPageFrame({
  article,
  templateType,
  accentColor,
  profileRoute,
  ads,
}: EditorialPageFrameProps) {
  return (
    <>
      <TopBanner placement={ads.topBanner} accentColor={accentColor} />
      <ArticleHero article={article} accentColor={accentColor} profileRoute={profileRoute} />

      {templateType === "A" && (
        <TemplateA article={article} accentColor={accentColor} profileRoute={profileRoute} ads={ads} />
      )}
      {templateType === "B" && (
        <TemplateB article={article} accentColor={accentColor} profileRoute={profileRoute} ads={ads} />
      )}
      {templateType === "C" && (
        <TemplateC article={article} accentColor={accentColor} profileRoute={profileRoute} ads={ads} />
      )}
      {templateType === "D" && (
        <TemplateD article={article} accentColor={accentColor} profileRoute={profileRoute} ads={ads} />
      )}
      {templateType === "E" && (
        <TemplateE article={article} accentColor={accentColor} profileRoute={profileRoute} ads={ads} />
      )}
    </>
  );
}
