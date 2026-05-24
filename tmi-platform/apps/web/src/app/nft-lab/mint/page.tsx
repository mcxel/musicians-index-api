"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { NFTMintEngine, type NFTType } from "@/lib/nft/NFTMintEngine";

const mintEngine = new NFTMintEngine();

const NFT_TYPES: { type: NFTType; label: string; icon: string; color: string; fee: string }[] = [
  { type: "COLLECTIBLE",  label: "Collectible",  icon: "🖼️", color: "#AA2DFF", fee: "$2.99" },
  { type: "AVATAR_SKIN",  label: "Avatar Skin",  icon: "👤", color: "#00FFFF", fee: "$1.99" },
  { type: "WINNER_BADGE", label: "Winner Badge", icon: "🏆", color: "#FFD700", fee: "$4.99" },
  { type: "VENUE_PASS",   label: "Venue Pass",   icon: "🎟️", color: "#00FF88", fee: "$9.99" },
  { type: "SEASON_PASS",  label: "Season Pass",  icon: "👑", color: "#FF2DAA", fee: "$12.99" },
];

type FileKind = "image" | "audio";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NftMintPage() {
  const [selectedType, setSelectedType] = useState<NFTType>("COLLECTIBLE");
  const [name, setName]             = useState("");
  const [description, setDescription] = useState("");
  const [royaltyPct, setRoyaltyPct] = useState("5");
  const [minted, setMinted]         = useState<string | null>(null);
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [audioFile, setAudioFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading]   = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(kind: FileKind, file: File | null) {
    if (!file) return;
    if (kind === "image") {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setAudioFile(file);
    }
  }

  async function handleMint() {
    if (!name.trim()) return;
    setUploading(true);
    try {
      // Build FormData for file uploads
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description);
      formData.append("type", selectedType);
      formData.append("royaltyPct", royaltyPct);
      if (imageFile) formData.append("image", imageFile);
      if (audioFile) formData.append("audio", audioFile);

      // Try real API; fall back to client-side engine
      let nftId: string;
      try {
        const res = await fetch("/api/nft/mint", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json() as { id?: string; nftId?: string };
          nftId = data.id ?? data.nftId ?? "";
        } else {
          throw new Error("API unavailable");
        }
      } catch {
        const nft = mintEngine.mint({
          type: selectedType,
          name: name.trim(),
          ownerId: "demo-user",
          metadata: {
            platform: "TMI",
            season: "S2",
            description,
            royaltyPct: Number(royaltyPct),
            hasImage: imageFile ? 1 : 0,
            hasAudio: audioFile ? 1 : 0,
          },
          transferable: true,
        });
        nftId = nft.id;
      }
      setMinted(nftId);
    } finally {
      setUploading(false);
    }
  }

  const selected = NFT_TYPES.find(t => t.type === selectedType)!;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/nft-lab" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← NFT Lab</Link>
        <div style={{ marginTop: 20, fontSize: 9, letterSpacing: "0.4em", color: "#00FF88", fontWeight: 800, marginBottom: 8 }}>DIRECT MINT</div>
        <h1 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 900, marginBottom: 6 }}>Mint an NFT</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>Verified creators can mint directly. Platform fee applies.</p>

        {minted ? (
          <div style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 14, padding: "32px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#00FF88", marginBottom: 8 }}>NFT Minted</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>ID: {minted}</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href="/nft-lab/my-nfts" style={{ padding: "10px 20px", fontSize: 10, fontWeight: 800, color: "#050510", background: "#00FF88", borderRadius: 8, textDecoration: "none" }}>VIEW MY NFTS</Link>
              <button onClick={() => { setMinted(null); setName(""); }} style={{ padding: "10px 20px", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, cursor: "pointer" }}>MINT ANOTHER</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 12 }}>NFT TYPE</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                {NFT_TYPES.map(t => (
                  <button key={t.type} onClick={() => setSelectedType(t.type)} style={{ padding: "12px 8px", background: selectedType === t.type ? `${t.color}15` : "rgba(255,255,255,0.02)", border: `1px solid ${selectedType === t.type ? t.color : "rgba(255,255,255,0.08)"}`, borderRadius: 10, cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{t.icon}</div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: selectedType === t.type ? t.color : "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>{t.label.toUpperCase()}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 8 }}>NFT NAME</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={`My ${selected.label}...`}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", padding: "12px 14px", fontSize: 13, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 8 }}>DESCRIPTION</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe this NFT..."
                rows={3}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", padding: "12px 14px", fontSize: 12, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 8 }}>ROYALTY % (ON RESALE)</label>
              <input
                type="number"
                min="0"
                max="25"
                value={royaltyPct}
                onChange={e => setRoyaltyPct(e.target.value)}
                style={{ width: 120, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", padding: "10px 14px", fontSize: 13, boxSizing: "border-box" }}
              />
              <span style={{ marginLeft: 10, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>You earn this % each time your NFT is resold (max 25%)</span>
            </div>

            {/* Image upload */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 8 }}>NFT IMAGE (OPTIONAL)</div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                style={{ display: "none" }}
                onChange={e => handleFileChange("image", e.target.files?.[0] ?? null)}
              />
              {imagePreview ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="NFT preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 10, border: `2px solid ${selected.color}44` }} />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); if (imageInputRef.current) imageInputRef.current.value = ""; }}
                    style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#FF2DAA", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >✕</button>
                </div>
              ) : (
                <button
                  onClick={() => imageInputRef.current?.click()}
                  style={{ padding: "10px 20px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer" }}
                >
                  + Upload Image (PNG, JPG, GIF, WEBP)
                </button>
              )}
            </div>

            {/* Audio upload */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 8 }}>AUDIO FILE (OPTIONAL)</div>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/ogg,audio/flac,audio/*"
                style={{ display: "none" }}
                onChange={e => handleFileChange("audio", e.target.files?.[0] ?? null)}
              />
              {audioFile ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8 }}>
                  <span style={{ fontSize: 16 }}>🎵</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#00FF88" }}>{audioFile.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{formatFileSize(audioFile.size)}</div>
                  </div>
                  <button
                    onClick={() => { setAudioFile(null); if (audioInputRef.current) audioInputRef.current.value = ""; }}
                    style={{ background: "none", border: "none", color: "#FF2DAA", cursor: "pointer", fontSize: 14 }}
                  >✕</button>
                </div>
              ) : (
                <button
                  onClick={() => audioInputRef.current?.click()}
                  style={{ padding: "10px 20px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 10, color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer" }}
                >
                  + Upload Audio (MP3, WAV, FLAC)
                </button>
              )}
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Type</span>
                <span style={{ fontSize: 10, fontWeight: 700 }}>{selected.label}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Royalty on resale</span>
                <span style={{ fontSize: 10, fontWeight: 700 }}>{royaltyPct}%</span>
              </div>
              {imageFile && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Image</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#00FF88" }}>{imageFile.name.slice(0, 24)}</span>
                </div>
              )}
              {audioFile && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Audio</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#00FF88" }}>{audioFile.name.slice(0, 24)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8, marginTop: 6 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Mint fee</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: selected.color }}>{selected.fee}</span>
              </div>
            </div>

            <button
              onClick={() => void handleMint()}
              disabled={!name.trim() || uploading}
              style={{ width: "100%", padding: "13px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: name.trim() && !uploading ? `linear-gradient(135deg, ${selected.color}, ${selected.color}99)` : "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, cursor: name.trim() && !uploading ? "pointer" : "not-allowed" }}
            >
              {uploading ? "MINTING…" : `MINT NFT — ${selected.fee}`}
            </button>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 12 }}>Requires Artist Pro or higher subscription.</p>
          </>
        )}
      </div>
    </main>
  );
}
