"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getPitchesByWriter,
  seedPitches,
  type Pitch,
  type PitchStatus,
} from "@/lib/writer/EditorialQueueEngine";

const WRITER_ID = "current-writer";

const STATUS_META: Record<PitchStatus, { label: string; color: string; icon: string }> = {
  submitted:             { label: "Submitted",        color: "#94a3b8", icon: "📬" },
  "under-review":        { label: "Under Review",     color: "#FFD700", icon: "🔍" },
  approved:              { label: "Approved",          color: "#00FF88", icon: "✅" },
  assigned:              { label: "Assigned",          color: "#00FFFF", icon: "📋" },
  "submitted-for-review":{ label: "In Final Review",  color: "#AA2DFF", icon: "✏️" },
  published:             { label: "Published",         color: "#FF2DAA", icon: "📰" },
  rejected:              { label: "Rejected",          color: "#FF4444", icon: "❌" },
};

export default function WriterSubmissionsPage() {
  const [pitches, setPitches] = useState<Pitch[]>([]);

  useEffect(() => {
    seedPitches(WRITER_ID);
    setPitches(getPitchesByWriter(WRITER_ID));
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "36px 20px 80px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 8 }}>HUB — WRITER</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900 }}>My Submissions</h1>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Track the status of every article and pitch you've submitted.</p>
          </div>
          <Link href="/hub/writer/pitches" style={{ padding: "10px 18px", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", border: "none", borderRadius: 9, color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textDecoration: "none" }}>
            + NEW PITCH
          </Link>
        </div>

        {pitches.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
            No submissions yet. <Link href="/hub/writer/pitches" style={{ color: "#FF2DAA" }}>Submit your first pitch →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pitches.map((p) => {
              const meta = STATUS_META[p.status];
              return (
                <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${meta.color}22`, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{p.summary}</div>
                      <div style={{ marginTop: 8, fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
                        {p.category.replace("-", " ").toUpperCase()} · Submitted {new Date(p.submittedAt).toLocaleDateString()}
                        {p.budget != null && <span style={{ color: "#00FF88", marginLeft: 8 }}>💵 ${p.budget} budget</span>}
                      </div>
                      {p.editorNotes && (
                        <div style={{ marginTop: 8, padding: "6px 10px", background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 6, fontSize: 11, color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}>
                          Editor: {p.editorNotes}
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}44`, borderRadius: 20, padding: "4px 12px", fontSize: 9, color: meta.color, fontWeight: 900, letterSpacing: "0.15em", textAlign: "center" }}>
                        {meta.icon} {meta.label.toUpperCase()}
                      </div>
                      {p.articleSlug && (
                        <Link href={`/magazine/article/${p.articleSlug}`} style={{ display: "block", marginTop: 6, fontSize: 9, color: "#FF2DAA", textDecoration: "none", textAlign: "center", letterSpacing: "0.08em" }}>
                          READ →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
