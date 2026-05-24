import Link from "next/link";
import type { Metadata } from "next";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";
import { getEditorialArticlesByCategory, getLatestEditorialArticles } from "@/lib/editorial/NewsArticleModel";
import { LOCAL_ARTICLE_CATALOG } from "@/lib/editorial/localArticleCatalog";

export const metadata: Metadata = { title: "Article Health | TMI Admin" };

const CAT_COLOR: Record<string, string> = {
  news: "#FFD700", artist: "#00FFFF", performer: "#FF2DAA",
  feature: "#AA2DFF", interview: "#00FF88", review: "#FF9500",
  editorial: "#64C8FF",
};

export default function AdminArticlesPage() {
  const newsArticles   = getEditorialArticlesByCategory("news");
  const artistArticles = getEditorialArticlesByCategory("artist");
  const perfArticles   = getEditorialArticlesByCategory("performer");
  const latest         = getLatestEditorialArticles(5);

  const localSlugs = new Set(LOCAL_ARTICLE_CATALOG.map((a) => a.slug));
  const editorialSlugs = new Set([...newsArticles, ...artistArticles, ...perfArticles].map((a) => a.slug));

  const allEditorial = [...newsArticles, ...artistArticles, ...perfArticles]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  const magazineTotal  = MAGAZINE_ISSUE_1.length;
  const editorialTotal = allEditorial.length;
  const localTotal     = LOCAL_ARTICLE_CATALOG.length;

  const missingInLocal = allEditorial.filter((a) => !localSlugs.has(a.slug));
  const missingInEditorial = LOCAL_ARTICLE_CATALOG.filter((a) => !editorialSlugs.has(a.slug) && a.category === "news");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/admin" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← ADMIN
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 20, marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Article Health</h1>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Coverage check across magazine, editorial, and local catalog.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/articles" style={{ padding: "8px 16px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>
              /ARTICLES →
            </Link>
            <Link href="/magazine" style={{ padding: "8px 16px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, textDecoration: "none" }}>
              MAGAZINE →
            </Link>
          </div>
        </div>

        {/* Coverage stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Magazine Articles",  value: magazineTotal,  color: "#AA2DFF", href: "/magazine" },
            { label: "Editorial Articles", value: editorialTotal, color: "#00FFFF", href: "/articles/news" },
            { label: "Local Catalog",      value: localTotal,     color: "#00FF88", href: "/articles" },
            { label: "Missing in Local",   value: missingInLocal.length,     color: missingInLocal.length > 0 ? "#FF4444" : "#00FF88", href: "#missing-local" },
            { label: "Missing in Editorial", value: missingInEditorial.length, color: missingInEditorial.length > 0 ? "#FFD700" : "#00FF88", href: "#missing-editorial" },
          ].map((s) => (
            <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}20`, borderRadius: 12, padding: "16px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
                <div style={{ fontSize: 26, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 8, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>{s.label.toUpperCase()}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Sync warnings */}
        {missingInLocal.length > 0 && (
          <div id="missing-local" style={{ marginBottom: 20, padding: "14px 18px", background: "rgba(255,68,68,0.05)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#FF4444", letterSpacing: "0.15em", marginBottom: 8 }}>⚠ EDITORIAL ARTICLES MISSING FROM LOCAL CATALOG</div>
            {missingInLocal.map((a) => (
              <div key={a.slug} style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", padding: "2px 0" }}>
                {a.slug} <span style={{ color: "#FF4444" }}>({a.category})</span>
              </div>
            ))}
          </div>
        )}
        {missingInEditorial.length > 0 && (
          <div id="missing-editorial" style={{ marginBottom: 20, padding: "14px 18px", background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", letterSpacing: "0.15em", marginBottom: 8 }}>⚠ LOCAL CATALOG ARTICLES MISSING FROM EDITORIAL</div>
            {missingInEditorial.map((a) => (
              <div key={a.slug} style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", padding: "2px 0" }}>
                {a.slug}
              </div>
            ))}
          </div>
        )}
        {missingInLocal.length === 0 && missingInEditorial.length === 0 && (
          <div style={{ marginBottom: 20, padding: "12px 16px", background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 10, fontSize: 11, color: "#00FF88" }}>
            ✓ All article sources are in sync
          </div>
        )}

        {/* Latest editorial articles */}
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 14 }}>
          LATEST EDITORIAL ({latest.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 36 }}>
          {latest.map((a) => {
            const inLocal = localSlugs.has(a.slug);
            const href = a.category === "artist" ? `/articles/artist/${a.slug}` : a.category === "performer" ? `/articles/performer/${a.slug}` : `/articles/news/${a.slug}`;
            return (
              <div key={a.slug} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{a.author} · {a.publishedAt}</div>
                </div>
                <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: CAT_COLOR[a.category] ?? "#fff", flexShrink: 0 }}>
                  {a.category.toUpperCase()}
                </span>
                <span style={{ fontSize: 8, fontWeight: 800, color: inLocal ? "#00FF88" : "#FF4444", flexShrink: 0 }}>
                  {inLocal ? "LOCAL ✓" : "LOCAL ✗"}
                </span>
                <Link href={href} style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: "0.1em", flexShrink: 0 }}>
                  VIEW →
                </Link>
              </div>
            );
          })}
        </div>

        {/* All editorial articles */}
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 14 }}>
          ALL EDITORIAL ARTICLES ({allEditorial.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 36 }}>
          {allEditorial.map((a, i) => {
            const inLocal = localSlugs.has(a.slug);
            const href = a.category === "artist" ? `/articles/artist/${a.slug}` : a.category === "performer" ? `/articles/performer/${a.slug}` : `/articles/news/${a.slug}`;
            return (
              <div key={a.slug} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.2)", minWidth: 22 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{a.author} · {a.publishedAt}</div>
                </div>
                <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: CAT_COLOR[a.category] ?? "#fff", flexShrink: 0 }}>
                  {a.category.toUpperCase()}
                </span>
                <span style={{ fontSize: 8, fontWeight: 800, color: inLocal ? "#00FF88" : "#FF4444", flexShrink: 0 }}>
                  {inLocal ? "LOCAL ✓" : "LOCAL ✗"}
                </span>
                <Link href={href} style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: "0.1em", flexShrink: 0 }}>
                  VIEW →
                </Link>
              </div>
            );
          })}
        </div>

        {/* Magazine issue 1 */}
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 14 }}>
          MAGAZINE ISSUE 1 ({MAGAZINE_ISSUE_1.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {MAGAZINE_ISSUE_1.map((a, i) => (
            <div key={a.slug} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.2)", minWidth: 22 }}>{i + 1}</span>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{a.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{a.author} · {a.publishedAt}</div>
              </div>
              <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: a.heroColor, flexShrink: 0, textTransform: "uppercase" }}>
                {a.category}
              </span>
              <Link href={`/magazine/article/${a.slug}`} style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: "0.1em", flexShrink: 0 }}>
                VIEW →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
