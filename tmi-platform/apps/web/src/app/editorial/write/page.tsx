"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ slug: string; status: string } | null>(null);

  async function submit(publish: boolean) {
    if (saving) return;
    if (!title.trim()) { setError("Title is required."); return; }
    if (!content.trim()) { setError("Content is required."); return; }
    setSaving(true);
    setError(null);

    try {
      const r = await fetch("/api/magazine/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: title.trim(), subtitle: subtitle.trim() || undefined, content: content.trim(), publish }),
      });
      const d = await r.json() as { ok?: boolean; error?: string; slug?: string; status?: string };
      if (!r.ok || !d.ok) { setError(d.error ?? "Save failed."); setSaving(false); return; }
      setSuccess({ slug: d.slug!, status: d.status! });
      if (publish) {
        setTimeout(() => router.push(`/editorial/${d.slug}`), 1200);
      }
    } catch {
      setError("Network error. Please retry.");
    }
    setSaving(false);
  }

  if (success) {
    return (
      <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>{success.status === "PUBLISHED" ? "🎉" : "💾"}</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
            {success.status === "PUBLISHED" ? "Article Published!" : "Draft Saved"}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
            {success.status === "PUBLISHED" ? "Your article is now live." : "Your draft was saved. Publish it from My Drafts."}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {success.status === "PUBLISHED" && (
              <Link href={`/editorial/${success.slug}`} style={{ padding: "10px 20px", background: "#00FFFF", color: "#05060c", borderRadius: 8, fontWeight: 800, fontSize: 12, textDecoration: "none" }}>
                VIEW ARTICLE →
              </Link>
            )}
            <button onClick={() => { setSuccess(null); setTitle(""); setSubtitle(""); setContent(""); }} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
              WRITE ANOTHER
            </button>
            <Link href="/hub/writer" style={{ padding: "10px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", borderRadius: 8, fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
              MY DRAFTS
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 20px 80px" }}>

        <div style={{ marginBottom: 20 }}>
          <Link href="/hub/writer" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Writer Hub</Link>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: 5, color: "#FF00FF", fontWeight: 800, marginBottom: 6 }}>EDITORIAL · NEW ARTICLE</div>
          <h1 style={{ fontSize: "clamp(24px,5vw,40px)", fontWeight: 900, margin: 0, lineHeight: 1.1 }}>Write an Article</h1>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 8, fontSize: 12, color: "#FF6B6B" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <label style={labelStyle}>
            TITLE *
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ray Journey Drops New Album..."
              style={{ ...inputStyle, fontSize: 18, fontWeight: 700, padding: "12px 16px" }}
            />
          </label>

          <label style={labelStyle}>
            SUBTITLE (optional)
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="A short descriptive line below the title"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            ARTICLE BODY *
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article here..."
              rows={20}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
            />
          </label>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => submit(true)}
            disabled={saving}
            style={{ padding: "12px 28px", background: saving ? "rgba(255,255,255,0.1)" : "#FF00FF", color: saving ? "rgba(255,255,255,0.4)" : "#fff", fontWeight: 900, fontSize: 13, borderRadius: 10, border: "none", cursor: saving ? "not-allowed" : "pointer", letterSpacing: "0.05em" }}
          >
            {saving ? "Saving…" : "PUBLISH NOW"}
          </button>
          <button
            onClick={() => submit(false)}
            disabled={saving}
            style={{ padding: "12px 28px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: 13, borderRadius: 10, cursor: saving ? "not-allowed" : "pointer" }}
          >
            SAVE DRAFT
          </button>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginLeft: 8 }}>
            {content.length > 0 ? `${content.split(/\s+/).filter(Boolean).length} words` : ""}
          </span>
        </div>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 10,
  color: "rgba(255,255,255,0.4)",
  fontWeight: 800,
  letterSpacing: "0.12em",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#fff",
  fontSize: 14,
  padding: "10px 14px",
  outline: "none",
  width: "100%",
  fontFamily: "inherit",
};
