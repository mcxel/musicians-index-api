"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { generateFromFace, saveAvatar } from "@/lib/avatar/avatarEngine";
import AvatarCustomizer from "@/components/avatar/AvatarCustomizer";
import type { AvatarConfig } from "@/lib/avatar/avatarEngine";

export default function AvatarScanBuildPage() {
  const searchParams = useSearchParams() ?? undefined;
  const scanId = searchParams?.get("scanId") || `scan_demo_${Date.now().toString(36)}`;

  const [avatar, setAvatar] = useState<AvatarConfig>(() => generateFromFace(scanId, "current-user"));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await saveAvatar(avatar);
    setSaving(false);
    setSaved(true);
  }

  const skinColors: Record<string, string> = {
    fair: "#FDDBB4", light: "#F5C89A", medium: "#D4956A", olive: "#C68642",
    tan: "#A0694A", brown: "#7B3F2D", dark: "#4A2010", deep: "#2C0F05",
  };

  const hairColors: Record<string, string> = {
    "#00FFFF": "#00FFFF", "#FF2DAA": "#FF2DAA", "#AA2DFF": "#AA2DFF",
    "#FFD700": "#FFD700", "#FF9500": "#FF9500", "#222222": "#222222",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: "0 0 60px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(2,6,23,0.96)", borderBottom: "1px solid rgba(255,45,170,0.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href={`/avatar/scan/verify?scanId=${scanId}`} style={{ color: "#f9a8d4", fontSize: 10, textDecoration: "none", border: "1px solid rgba(255,45,170,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← VERIFY</Link>
        <strong style={{ color: "#f9a8d4", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>BUILD AVATAR</strong>
        {saved && <span style={{ marginLeft: "auto", color: "#22c55e", fontSize: 10, fontWeight: 700 }}>✓ SAVED</span>}
      </header>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["SCAN", "VERIFY", "BUILD", "WARDROBE"] as const).map((step, i) => {
            const routes = ["/avatar/scan", "/avatar/scan/verify", "/avatar/scan/build", "/avatar/scan/wardrobe"];
            const active = i === 2;
            return (
              <Link key={step} href={routes[i] + (scanId ? `?scanId=${scanId}` : "")} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 6, border: `1px solid ${active ? "#FF2DAA" : "#334155"}`, background: active ? "rgba(255,45,170,0.12)" : "transparent", color: active ? "#f9a8d4" : "#475569", fontSize: 9, fontWeight: 700, textDecoration: "none", letterSpacing: "0.1em" }}>
                {i + 1}. {step}
              </Link>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e293b", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em" }}>AVATAR PREVIEW</div>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${skinColors[avatar.skinTone] || "#D4956A"}, ${skinColors[avatar.skinTone] || "#D4956A"}88)`, border: `3px solid ${avatar.hairColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                👤
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#e2e8f0", fontSize: 11, fontWeight: 600 }}>{avatar.skinTone} · {avatar.hairStyle}</div>
                <div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>{avatar.clothesStyle} · {avatar.animation}</div>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ color: "#475569", fontSize: 9, letterSpacing: "0.1em", marginBottom: 6 }}>SEED INFO</div>
              <div style={{ fontFamily: "monospace", color: "#64748b", fontSize: 9, wordBreak: "break-all" }}>{scanId}</div>
              <div style={{ color: "#334155", fontSize: 9, marginTop: 4 }}>generatedFromFace: true</div>
            </div>
          </div>

          <div>
            <AvatarCustomizer avatar={avatar} onChange={setAvatar} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, background: saving ? "rgba(34,197,94,0.08)" : "rgba(34,197,94,0.15)", border: `1px solid ${saving ? "#1e293b" : "rgba(34,197,94,0.4)"}`, borderRadius: 8, color: saving ? "#475569" : "#22c55e", fontSize: 12, padding: "11px 0", cursor: saving ? "default" : "pointer", fontWeight: 700, letterSpacing: "0.1em" }}>
            {saving ? "SAVING..." : saved ? "✓ SAVED" : "SAVE AVATAR"}
          </button>
          <Link href={`/avatar/scan/wardrobe?scanId=${scanId}`} style={{ flex: 1, textAlign: "center", background: "rgba(170,45,255,0.12)", border: "1px solid rgba(170,45,255,0.35)", borderRadius: 8, color: "#c4b5fd", fontSize: 12, padding: "11px 0", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
            WARDROBE →
          </Link>
        </div>
      </div>
    </main>
  );
}
