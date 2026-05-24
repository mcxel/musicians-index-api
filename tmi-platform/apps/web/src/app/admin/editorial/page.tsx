import Link from "next/link";
import { EDITORIAL_ARTICLES } from "@/lib/editorial/NewsArticleModel";
import { LOCAL_ARTICLE_CATALOG } from "@/lib/editorial/localArticleCatalog";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";

const STATUS_COLOR: Record<string, string> = {
  live: "#00FF88",
  magazine: "#00FFFF",
  "listing-only": "#FFD700",
  orphaned: "#FF4444",
};

function resolveArticleHealth() {
  const editorialSlugs = new Set(EDITORIAL_ARTICLES.map((a) => a.slug));
  const localSlugs = new Set(LOCAL_ARTICLE_CATALOG.map((a) => a.slug));
  const magazineSlugs = new Set(MAGAZINE_ISSUE_1.map((a) => a.slug));

  const allSlugs = new Set([...editorialSlugs, ...localSlugs, ...magazineSlugs]);

  return Array.from(allSlugs).map((slug) => {
    const inEditorial = editorialSlugs.has(slug);
    const inLocal = localSlugs.has(slug);
    const inMagazine = magazineSlugs.has(slug);

    const editorial = EDITORIAL_ARTICLES.find((a) => a.slug === slug);
    const local = LOCAL_ARTICLE_CATALOG.find((a) => a.slug === slug);
    const mag = MAGAZINE_ISSUE_1.find((a) => a.slug === slug);

    const title = editorial?.title ?? local?.title ?? mag?.title ?? slug;
    const category = editorial?.category ?? local?.category ?? mag?.category ?? "—";
    const author = editorial?.author ?? local?.author ?? mag?.author ?? "—";
    const publishedAt = editorial?.publishedAt ?? local?.publishedAt ?? mag?.publishedAt ?? "—";

    let status: string;
    if (inMagazine) status = "magazine";
    else if (inEditorial && inLocal) status = "live";
    else if (inEditorial && !inLocal) status = "orphaned";
    else status = "listing-only";

    const detailRoute = inMagazine
      ? `/magazine/article/${slug}`
      : category === "artist"
      ? `/articles/artist/${slug}`
      : category === "performer"
      ? `/articles/performer/${slug}`
      : `/articles/news/${slug}`;

    return { slug, title, category, author, publishedAt, status, inEditorial, inLocal, inMagazine, detailRoute };
  }).sort((a, b) => (a.publishedAt > b.publishedAt ? -1 : 1));
}

export default function AdminEditorialPage() {
  const articles = resolveArticleHealth();
  const counts = {
    total: articles.length,
    live: articles.filter((a) => a.status === "live").length,
    magazine: articles.filter((a) => a.status === "magazine").length,
    orphaned: articles.filter((a) => a.status === "orphaned").length,
    listingOnly: articles.filter((a) => a.status === "listing-only").length,
  };

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" as const }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>ADMIN · EDITORIAL</div>
            <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: 0 }}>Article Health</h1>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 6 }}>
              Coverage across NewsArticleModel, localArticleCatalog, and Magazine Issue 1
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/articles" style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>View Articles</Link>
            <Link href="/magazine" style={{ padding: "9px 18px", borderRadius: 8, background: "#00FFFF", color: "#05060c", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>View Magazine</Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "TOTAL ARTICLES", value: counts.total, color: "#00FFFF" },
            { label: "FULLY LIVE", value: counts.live, color: "#00FF88" },
            { label: "IN MAGAZINE", value: counts.magazine, color: "#00FFFF" },
            { label: "LISTING ONLY", value: counts.listingOnly, color: "#FFD700" },
            { label: "ORPHANED", value: counts.orphaned, color: "#FF4444" },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}20`, borderRadius: 10, padding: "16px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const, marginBottom: 16, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          {Object.entries(STATUS_COLOR).map(([s, c]) => (
            <span key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
              {s === "live" ? "live (editorial + listing)" : s === "magazine" ? "magazine issue" : s === "listing-only" ? "listing only (no detail page data)" : "orphaned (detail only, no listing)"}
            </span>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 120px 80px 100px 70px", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
            <span>Title / Slug</span><span>Category</span><span>Author</span><span>Status</span><span>Published</span><span>View</span>
          </div>
          {articles.map((a) => (
            <div key={a.slug} style={{ display: "grid", gridTemplateColumns: "1fr 90px 120px 80px 100px 70px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", fontSize: 12 }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{a.slug}</div>
              </div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "capitalize" as const }}>{a.category}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{a.author}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_COLOR[a.status] ?? "#fff", display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: 9, fontWeight: 800, color: STATUS_COLOR[a.status] ?? "#fff", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>{a.status}</span>
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{a.publishedAt}</span>
              <Link href={a.detailRoute} style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>View →</Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
