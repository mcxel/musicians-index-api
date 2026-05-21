"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateArtistProfile() {
  const router = useRouter();
  const [form, setForm] = useState({ displayName: "", bio: "", genre: "", city: "", instagram: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST /api/profiles with form data
    router.push(`/artists/${form.displayName.toLowerCase().replace(/\s+/g, "-") || "my-profile"}`);
  };

  const S = {
    page: { minHeight: "100vh", background: "#0D0520", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
    card: { background: "#1E0D3E", border: "1px solid rgba(0,229,255,0.25)", borderRadius: 12, padding: 40, width: "100%", maxWidth: 520 },
    h1: { fontFamily: "'Bebas Neue',Impact,sans-serif", fontSize: 28, color: "#FFB800", letterSpacing: 2, marginBottom: 4 },
    sub: { color: "#00E5FF", fontSize: 11, fontFamily: "'Oswald',sans-serif", letterSpacing: 2, marginBottom: 28 },
    label: { display: "block", color: "#C8A8E8", fontSize: 11, fontFamily: "'Oswald',sans-serif", letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" as const },
    input: { width: "100%", padding: "10px 14px", background: "#150830", border: "1px solid rgba(0,229,255,0.25)", borderRadius: 8, color: "#fff", fontSize: 14, marginBottom: 20, boxSizing: "border-box" as const },
    btn: { width: "100%", padding: 14, background: "#00E5FF", color: "#0D0520", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Oswald',sans-serif", letterSpacing: 1 },
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.h1}>CREATE ARTIST PROFILE</h1>
        <p style={S.sub}>THIS IS YOUR STAGE, BE ORIGINAL.</p>
        <form onSubmit={handleSubmit}>
          <label style={S.label}>Stage Name *</label>
          <input style={S.input} placeholder="Your artist name" value={form.displayName} onChange={set("displayName")} required />
          <label style={S.label}>Bio</label>
          <textarea style={{ ...S.input, minHeight: 80, resize: "vertical" as const }} placeholder="Tell the world who you are..." value={form.bio} onChange={set("bio")} />
          <label style={S.label}>Primary Genre</label>
          <input style={S.input} placeholder="Hip Hop, R&B, Pop..." value={form.genre} onChange={set("genre")} />
          <label style={S.label}>City / Region</label>
          <input style={S.input} placeholder="Where you&apos;re based" value={form.city} onChange={set("city")} />
          <button type="submit" style={S.btn}>PUBLISH MY PROFILE</button>
        </form>
      </div>
    </div>
  );
}
