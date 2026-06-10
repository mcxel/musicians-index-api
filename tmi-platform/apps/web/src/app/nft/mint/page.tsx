"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TYPE_MAP: Record<string, string> = {
  beat: "COLLECTIBLE",
  artwork: "COLLECTIBLE",
  moment: "COLLECTIBLE",
  exclusive: "SEASON_PASS",
};

const TEMPLATES = [
  { id: "beat",      label: "Beat NFT",        emoji: "🎵", desc: "Mint your original beat as a collectible",   price: "0.05 ETH" },
  { id: "artwork",   label: "Cover Art NFT",    emoji: "🎨", desc: "Turn your artwork into a tradeable asset",   price: "0.03 ETH" },
  { id: "moment",    label: "Live Moment NFT",  emoji: "🔴", desc: "Mint a clip from your live performance",    price: "0.08 ETH" },
  { id: "exclusive", label: "Exclusive Access", emoji: "💎", desc: "Fan-pass NFT with backstage perks",         price: "0.15 ETH" },
];

export default function NftMintPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [authed, setAuthed] = useState(false);
  const [template, setTemplate] = useState("beat");
  const [name, setName]       = useState("");
  const [desc, setDesc]       = useState("");
  const [edition, setEdition] = useState("10");
  const [file, setFile]       = useState<File | null>(null);
  const [phase, setPhase]     = useState<"idle" | "minting" | "done" | "error">("idle");
  const [errMsg, setErrMsg]   = useState("");
  const [mintedId, setMintedId] = useState("");

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then(r => r.json())
      .then((d: { authenticated?: boolean }) => {
        if (!d.authenticated) { router.replace("/auth"); return; }
        setAuthed(true);
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  if (!authed) return null;

  const chosen = TEMPLATES.find((t) => t.id === template)!;

  const handleMint = async () => {
    if (!name.trim()) { setErrMsg("NFT name is required."); return; }
    setErrMsg("");
    setPhase("minting");
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("type", TYPE_MAP[template] ?? "COLLECTIBLE");
      fd.append("description", desc);
      fd.append("royaltyPct", "5");
      if (file) fd.append("file", file);

      const res = await fetch("/api/nft/mint", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json() as { ok?: boolean; id?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Mint failed");
      setMintedId(data.id ?? "");
      setPhase("done");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Mint failed — try again.");
      setPhase("error");
    }
  };

  if (phase === "done") {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: "#FFD700" }}>NFT Minted!</h2>
          <p style={{ margin: "0 0 8px", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>&ldquo;{name}&rdquo; is now in your vault.</p>
          {mintedId && <p style={{ margin: "0 0 8px", color: "rgba(255,255,255,0.3)", fontSize: 11 }}>ID: {mintedId}</p>}
          <p style={{ margin: "0 0 24px", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Edition of {edition} · {chosen.price} each</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/nft" style={{ padding: "11px 24px", borderRadius: 8, background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.35)", color: "#FFD700", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>VIEW NFT VAULT</Link>
            <button onClick={() => { setName(""); setDesc(""); setFile(null); setMintedId(""); setPhase("idle"); }} style={{ padding: "11px 24px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>MINT ANOTHER</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(255,215,0,0.18)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#FFD700", textDecoration: "none", letterSpacing: "0.12em" }}>TMI</Link>
        <Link href="/nft" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>NFT Studio</Link>
        <span style={{ fontSize: 11, color: "#FFD700", fontWeight: 700 }}>Mint</span>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 6 }}>NFT STUDIO · BLOCKCHAIN</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Mint Your NFT</h1>
        </div>

        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 12 }}>NFT TYPE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                padding: "14px", borderRadius: 10, cursor: "pointer", border: "none", textAlign: "left",
                background: template === t.id ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.03)",
                outline: template === t.id ? "1.5px solid rgba(255,215,0,0.45)" : "1px solid rgba(255,255,255,0.07)",
                color: "#fff",
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 2 }}>{t.label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{t.desc}</div>
                <div style={{ fontSize: 10, color: "#FFD700", fontWeight: 700 }}>{t.price}</div>
              </button>
            ))}
          </div>
        </section>

        <div
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
          style={{ width: "100%", height: 110, borderRadius: 12, background: file ? "rgba(0,255,136,0.05)" : "rgba(255,215,0,0.04)", border: `2px dashed ${file ? "rgba(0,255,136,0.5)" : "rgba(255,215,0,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, cursor: "pointer", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 28 }}>{file ? "✅" : chosen.emoji}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>{file ? file.name : "CLICK TO UPLOAD · DRAG & DROP"}</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>MP3, WAV, JPG, PNG, MP4 accepted</span>
          <input ref={fileRef} type="file" accept="audio/*,image/*,video/*" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 6 }}>NFT NAME</label>
          <input type="text" placeholder={`My ${chosen.label}...`} value={name} onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "11px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 6 }}>DESCRIPTION</label>
          <textarea rows={3} placeholder="Describe this NFT..." value={desc} onChange={(e) => setDesc(e.target.value)}
            style={{ width: "100%", padding: "11px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 6 }}>EDITION SIZE</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["1","5","10","25","100"].map((n) => (
              <button key={n} onClick={() => setEdition(n)} style={{
                padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 800, cursor: "pointer", border: "none",
                background: edition === n ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.04)",
                outline: edition === n ? "1.5px solid rgba(255,215,0,0.45)" : "1px solid rgba(255,255,255,0.08)",
                color: edition === n ? "#FFD700" : "rgba(255,255,255,0.5)",
              }}>{n === "1" ? "1/1" : `${n} pcs`}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", marginBottom: 20, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Mint price per NFT</span>
            <span style={{ color: "#FFD700", fontWeight: 700 }}>{chosen.price}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Edition size</span>
            <span style={{ fontWeight: 700 }}>{edition}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontWeight: 800 }}>Platform fee</span>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>2.5%</span>
          </div>
        </div>

        {errMsg && <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 8, color: "#FF4444", fontSize: 12 }}>{errMsg}</div>}

        <button onClick={handleMint} disabled={phase === "minting" || !name.trim()} style={{
          width: "100%", padding: "15px", borderRadius: 12, fontSize: 14, fontWeight: 900, letterSpacing: "0.1em", border: "none",
          cursor: phase === "minting" || !name.trim() ? "not-allowed" : "pointer",
          background: name.trim() && phase !== "minting" ? "linear-gradient(135deg, #FFD700, #FF2DAA)" : "rgba(255,255,255,0.06)",
          color: name.trim() && phase !== "minting" ? "#050510" : "rgba(255,255,255,0.2)",
        }}>
          {phase === "minting" ? "🔄 MINTING..." : "🎨 MINT TO BLOCKCHAIN"}
        </button>
      </div>
    </main>
  );
}
