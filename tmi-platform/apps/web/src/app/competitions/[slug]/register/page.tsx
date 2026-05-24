'use client';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function CompetitionRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === 'string' ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : '';
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const [artistName, setArtistName] = useState("");
  const [entryLink, setEntryLink] = useState("");
  const [bio, setBio] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function submit() {
    if (!artistName.trim() || !entryLink.trim()) {
      setError("Artist name and entry link are required.");
      return;
    }
    setError("");
    setSubmitted(true);
    setTimeout(() => router.push(`/competitions/${slug}`), 2000);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href={`/competitions/${slug}`} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← {title}</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>ENTER COMPETITION</div>
        <h1 style={{ fontSize: "clamp(20px,4vw,32px)", fontWeight: 900, margin: "0 0 28px" }}>{title}</h1>
        {submitted ? (
          <div style={{ padding: "20px", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 10, textAlign: "center", color: "#FFD700", fontWeight: 700 }}>
            Entry submitted! Redirecting...
          </div>
        ) : (
          <>
            {error && <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, fontSize: 12, color: "#FF2DAA" }}>{error}</div>}
            <div style={{ display: "grid", gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6, display: "block" }}>Artist Name</label>
                <input type="text" value={artistName} onChange={e => setArtistName(e.target.value)} placeholder="Your stage name" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6, display: "block" }}>Entry Link (audio/video)</label>
                <input type="url" value={entryLink} onChange={e => setEntryLink(e.target.value)} placeholder="https://..." style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6, display: "block" }}>Artist Bio (optional)</label>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the judges about yourself..." style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <button onClick={submit} style={{ width: "100%", padding: "14px", borderRadius: 10, background: "#FFD700", color: "#05060c", fontWeight: 900, fontSize: 14, cursor: "pointer", border: "none" }}>Submit Entry</button>
          </>
        )}
      </div>
    </main>
  );
}
