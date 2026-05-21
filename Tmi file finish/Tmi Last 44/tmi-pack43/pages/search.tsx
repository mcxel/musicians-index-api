// apps/web/src/app/search/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { searchAPI } from "../../lib/api/api-client";
import { useSearchParams } from "next/navigation";

const T = { void:"#0D0520", deep:"#150830", card:"#1E0D3E", raised:"#2A1452", gold:"#FFB800", cyan:"#00E5FF", pink:"#FF2D78", text:"#fff", text2:"#C8A8E8", text3:"#7A5F9A", display:"'Bebas Neue',Impact,sans-serif", heading:"'Oswald',sans-serif" };

export default function SearchPage() {
  const params = useSearchParams();
  const initialQ = params.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<any[]>([]);
  const [activeType, setActiveType] = useState("all");
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (q: string, type: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await searchAPI.search(q, type === "all" ? undefined : type) as any[];
      setResults(res || []);
    } catch { setResults([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (initialQ) doSearch(initialQ, activeType); }, [initialQ]);

  const types = ["all","artist","article","event","venue","item"];

  return (
    <div style={{ background:T.void, minHeight:"100vh", color:T.text, fontFamily:"Inter,sans-serif" }}>
      <div style={{ background:T.deep, padding:"32px", borderBottom:`1px solid rgba(0,229,255,0.2)` }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <div style={{ display:"flex", gap:12, marginBottom:16 }}>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if(e.key==="Enter") doSearch(query,activeType); }}
              placeholder="Search artists, articles, events, venues..." style={{ flex:1, padding:"12px 16px", background:T.raised, border:`2px solid ${T.cyan}66`, borderRadius:8, color:T.text, fontSize:16, outline:"none" }} />
            <button onClick={() => doSearch(query,activeType)} style={{ padding:"12px 24px", background:T.cyan, color:T.void, border:"none", borderRadius:8, fontFamily:T.heading, fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:1 }}>SEARCH</button>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {types.map(t => (
              <button key={t} onClick={() => { setActiveType(t); if(query) doSearch(query,t); }} style={{ padding:"5px 12px", background:activeType===t ? T.cyan : T.raised, color:activeType===t ? T.void : T.text2, border:`1px solid ${activeType===t ? T.cyan : "rgba(255,255,255,0.1)"}`, borderRadius:99, fontFamily:T.heading, fontSize:10, cursor:"pointer", letterSpacing:1, textTransform:"uppercase" as const }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth:800, margin:"0 auto", padding:"32px" }}>
        {loading ? <div style={{ textAlign:"center", color:T.text3, padding:"48px" }}>Searching...</div>
        : results.length === 0 && query ? <div style={{ textAlign:"center", color:T.text3, padding:"48px" }}>No results for &ldquo;{query}&rdquo;</div>
        : results.map((r,i) => (
          <Link key={i} href={r.url || "#"} style={{ textDecoration:"none" }}>
            <div style={{ background:T.card, border:`1px solid rgba(0,229,255,0.15)`, borderRadius:10, padding:16, marginBottom:10, display:"flex", gap:14, alignItems:"center" }}>
              {r.imageUrl && <div style={{ width:56, height:56, borderRadius:8, background:T.raised, overflow:"hidden", flexShrink:0 }}><img src={r.imageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /></div>}
              <div>
                <div style={{ fontFamily:T.heading, fontSize:14, color:T.text, marginBottom:4 }}>{r.title || r.name}</div>
                <div style={{ fontSize:12, color:T.text3 }}>{r.type} {r.subtitle ? `— ${r.subtitle}` : ""}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
