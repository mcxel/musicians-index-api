import Link from "next/link";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";

export const metadata = { title: "News | TMI" };

const ACCENT: Record<string, string> = { news:"#00FF88", feature:"#FF2DAA", editorial:"#FFD700", interview:"#00FFFF", review:"#AA2DFF" };

export default function NewsPage() {
  const articles = MAGAZINE_ISSUE_1.filter(a => ["news","feature","editorial"].includes(a.category));
  return (
    <main style={{ minHeight:"100vh", background:"#060410", color:"#fff", padding:"40px 20px 80px" }}>
      <div style={{ maxWidth:860, margin:"0 auto" }}>
        <div style={{ color:"#00FF88", fontSize:10, letterSpacing:4, marginBottom:8 }}>TMI PLATFORM</div>
        <h1 style={{ fontSize:"clamp(24px,5vw,42px)", fontWeight:900, letterSpacing:2, margin:"0 0 32px" }}>NEWS & UPDATES</h1>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {articles.map(a => {
            const accent = ACCENT[a.category] ?? "#00FFFF";
            return (
              <Link key={a.slug} href={`/magazine/article/${a.slug}`} style={{ textDecoration:"none" }}>
                <div style={{ display:"flex", gap:16, padding:"20px", background:`${accent}0a`, border:`1px solid ${accent}25`, borderRadius:10, cursor:"pointer" }}>
                  <div style={{ fontSize:32, flexShrink:0 }}>{a.icon}</div>
                  <div>
                    <div style={{ color:accent, fontSize:9, fontWeight:700, letterSpacing:3, marginBottom:6 }}>{a.category.toUpperCase()} · {new Date(a.publishedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
                    <h2 style={{ color:"#fff", fontSize:"clamp(14px,2.5vw,18px)", fontWeight:900, margin:"0 0 6px", lineHeight:1.3 }}>{a.title}</h2>
                    <p style={{ color:"#666", fontSize:12, margin:"0 0 8px", lineHeight:1.6 }}>{a.subtitle}</p>
                    <div style={{ color:"#444", fontSize:10 }}>{a.author}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div style={{ marginTop:40 }}>
          <Link href="/magazine" style={{ color:"#00FFFF", fontSize:11, letterSpacing:2, textDecoration:"none" }}>← FULL MAGAZINE</Link>
        </div>
      </div>
    </main>
  );
}
