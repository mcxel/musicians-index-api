import Link from "next/link";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";

export const metadata = { title: "Artist Interviews | TMI" };

const interviews = MAGAZINE_ISSUE_1.filter(a => a.category === "interview");

export default function InterviewsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", padding: "40px 20px 80px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ color: "#00FFFF", fontSize: 10, letterSpacing: 4, marginBottom: 8 }}>TMI MAGAZINE</div>
        <h1 style={{ fontSize: "clamp(24px,5vw,42px)", fontWeight: 900, letterSpacing: 2, margin: "0 0 32px" }}>
          INTERVIEWS
        </h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 20 }}>
          {interviews.map(a => (
            <Link key={a.slug} href={`/magazine/article/${a.slug}`} style={{ textDecoration: "none" }}>
              <div style={{ background: `linear-gradient(135deg, ${a.heroColor}18, rgba(6,4,16,0.97))`, border: `1px solid ${a.heroColor}40`, borderRadius: 12, padding: "24px 20px", cursor: "pointer" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
                <div style={{ color: a.heroColor, fontSize: 10, fontWeight: 700, letterSpacing: 3, marginBottom: 8 }}>INTERVIEW · {new Date(a.publishedAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 900, margin: "0 0 8px", lineHeight: 1.3 }}>{a.title}</h2>
                <p style={{ color: "#666", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{a.subtitle}</p>
                <div style={{ color: "#444", fontSize: 10, marginTop: 10 }}>{a.author}</div>
              </div>
            </Link>
          ))}
          {interviews.length === 0 && (
            <div style={{ color: "#333", fontSize: 13 }}>No interviews published yet — check back soon.</div>
          )}
        </div>
        <div style={{ marginTop: 40 }}>
          <Link href="/magazine" style={{ color: "#00FFFF", fontSize: 11, letterSpacing: 2, textDecoration: "none" }}>← BACK TO MAGAZINE</Link>
        </div>
      </div>
    </main>
  );
}
