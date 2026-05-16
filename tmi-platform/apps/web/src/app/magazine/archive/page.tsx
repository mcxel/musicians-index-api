import { ImageSlotWrapper } from '@/components/visual-enforcement';
import Link from "next/link";

const archivedIssues = [
  { id: "1", title: "Issue 01 · Crown Systems", cover: "/tmi-curated/mag-66.jpg", accent: "#00FFFF" },
  { id: "2", title: "Issue 02 · Battle Season", cover: "/tmi-curated/mag-74.jpg", accent: "#FF2DAA" },
  { id: "3", title: "Issue 03 · Sponsor Takeover", cover: "/tmi-curated/mag-58.jpg", accent: "#FFD700" },
];

export const metadata = {
  title: "TMI Magazine Archive",
  description: "Browse archived issues and jump back into issue readers.",
  alternates: { canonical: "/magazine/archive" },
};

export default function MagazineArchivePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "72px clamp(12px, 4vw, 34px) 24px",
        background:
          "radial-gradient(circle at 15% 20%, rgba(0,255,255,0.18), transparent 40%), radial-gradient(circle at 85% 10%, rgba(255,45,170,0.2), transparent 40%), linear-gradient(170deg, #050510, #0d0620)",
        color: "#fff",
        display: "grid",
        gap: 14,
      }}
    >
      <header style={{ display: "grid", gap: 6 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 900 }}>MAGAZINE ARCHIVE</div>
        <h1 style={{ margin: 0, fontSize: "clamp(24px, 4vw, 42px)", lineHeight: 1.05 }}>PAST ISSUES</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/magazine" style={{ textDecoration: "none", color: "#050510", background: "#00FFFF", borderRadius: 8, padding: "8px 12px", fontSize: 11, fontWeight: 900 }}>
            MAGAZINE LOBBY
          </Link>
          <Link href="/magazine/issue/current" style={{ textDecoration: "none", color: "#fff", border: "1px solid rgba(255,255,255,0.28)", borderRadius: 8, padding: "8px 12px", fontSize: 11, fontWeight: 700 }}>
            CURRENT ISSUE
          </Link>
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {archivedIssues.map((issue) => (
          <Link
            key={issue.id}
            href={`/magazine/issue/${issue.id}`}
            style={{
              textDecoration: "none",
              color: "#fff",
              border: `1px solid ${issue.accent}99`,
              borderRadius: 12,
              overflow: "hidden",
              background: `linear-gradient(145deg, ${issue.accent}26, rgba(5,5,16,0.88))`,
            }}
          >
            <ImageSlotWrapper imageId="img-1ek1ic" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
            <div style={{ padding: 10, display: "grid", gap: 4 }}>
              <span style={{ fontSize: 9, letterSpacing: "0.13em", color: issue.accent, fontWeight: 900 }}>ISSUE {issue.id}</span>
              <span style={{ fontSize: 12, lineHeight: 1.4, fontWeight: 800 }}>{issue.title}</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
