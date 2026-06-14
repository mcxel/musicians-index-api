"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PerformerMediaLibrary from "@/components/media/PerformerMediaLibrary";
import MemoryWall from "@/components/media/MemoryWall";
import OmniPresenceEngine from "@/components/presence/OmniPresenceEngine";

const ACCENT = "#AA2DFF";
const BG = "#050510";

interface MeUser { id: string; email: string; name?: string; role: string; tier?: string; }

export default function PerformerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [genres, setGenres] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then(r => r.json())
      .then((d: { authenticated?: boolean; user?: MeUser }) => {
        if (!d.authenticated || !d.user) { router.replace("/auth"); return; }
        setUser(d.user);
        setDisplayName(d.user.name ?? d.user.email.split("@")[0] ?? "");
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      const fd = new FormData(e.currentTarget);
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: fd.get("displayName"),
          bio: fd.get("bio"),
          genres: fd.get("genres"),
          instagram: fd.get("instagram"),
          youtube: fd.get("youtube"),
          soundcloud: fd.get("soundcloud"),
          contactEmail: fd.get("contactEmail"),
        }),
        credentials: "include",
      });
      setSaveMsg("Saved!");
      setEditing(false);
    } catch {
      setSaveMsg("Save failed — try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  const stats = [
    { label: "Rank",          value: "—",  color: "#FFD700" },
    { label: "XP",            value: "0",  color: ACCENT    },
    { label: "Battle Record", value: "0–0",color: "#00FFFF" },
    { label: "Monthly Fans",  value: "0",  color: "#FF2DAA" },
    { label: "Earnings",      value: "$0", color: "#00FF88" },
    { label: "Streams",       value: "0",  color: "#FFD700" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.8)", borderBottom: `1px solid ${ACCENT}22`, padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <Link href="/hub/performer" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Hub</Link>
        <Link href="/performer/studio" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Studio</Link>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>My Profile</span>
        <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginLeft: "auto" }}>Settings</Link>
      </nav>

      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(circle at 70% 20%, ${ACCENT}0B, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {/* Profile hero */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: "28px 28px", background: `linear-gradient(135deg, ${ACCENT}10, rgba(5,5,16,0.95))`, border: `1px solid ${ACCENT}28`, borderRadius: 20, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #FF2DAA)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0, boxShadow: `0 0 28px ${ACCENT}40` }}>🎤</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.25em", color: ACCENT, fontWeight: 800, marginBottom: 4 }}>PERFORMER · {(user.tier ?? "FREE").toUpperCase()}</div>
            <h1 style={{ margin: "0 0 6px", fontSize: "clamp(22px,4vw,34px)", fontWeight: 900 }}>{displayName}</h1>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, maxWidth: 480 }}>{bio || "Edit your profile to add a bio."}</p>
            {genres && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {genres.split(",").map((g) => g.trim()).filter(Boolean).map((g) => (
                  <span key={g} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 9, fontWeight: 700, background: `${ACCENT}18`, border: `1px solid ${ACCENT}35`, color: ACCENT }}>{g}</span>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setEditing(!editing)} style={{ padding: "9px 20px", borderRadius: 9, background: editing ? `${ACCENT}25` : `${ACCENT}14`, border: `1px solid ${ACCENT}45`, color: ACCENT, fontSize: 10, fontWeight: 800, cursor: "pointer", letterSpacing: "0.08em", flexShrink: 0 }}>
            {editing ? "CANCEL EDIT" : "EDIT PROFILE"}
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div style={{ padding: "24px 28px", background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}22`, borderRadius: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", color: ACCENT, fontWeight: 800, marginBottom: 18 }}>EDIT PROFILE</div>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Display Name", name: "displayName", val: displayName, setter: setDisplayName },
                { label: "Genre Tags (comma-separated)", name: "genres", val: genres, setter: setGenres },
              ].map((f) => (
                <div key={f.name}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input type="text" name={f.name} value={f.val} onChange={(e) => f.setter(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}22`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>BIO</label>
                <textarea name="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}22`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              {[
                { label: "Instagram", name: "instagram", placeholder: "https://instagram.com/..." },
                { label: "YouTube",   name: "youtube",   placeholder: "https://youtube.com/..."   },
                { label: "SoundCloud",name: "soundcloud",placeholder: "https://soundcloud.com/..." },
                { label: "Booking Email", name: "contactEmail", placeholder: "booking@..." },
              ].map((f) => (
                <div key={f.name}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input type="text" name={f.name} placeholder={f.placeholder}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button type="submit" disabled={saving} style={{ padding: "11px 28px", borderRadius: 9, background: ACCENT, color: "#fff", border: "none", fontSize: 12, fontWeight: 900, cursor: saving ? "not-allowed" : "pointer", letterSpacing: "0.08em", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "SAVING…" : "SAVE CHANGES"}
                  </button>
                  {saveMsg && <span style={{ fontSize: 11, color: saveMsg === "Saved!" ? "#00FF88" : "#FF4444" }}>{saveMsg}</span>}
                </div>
                <Link href="/account/deactivate" style={{ color: "#ff4444", fontSize: 11, textDecoration: "none" }}>Deactivate Account</Link>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 24 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ padding: "16px", background: `${s.color}08`, border: `1px solid ${s.color}22`, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 9, fontWeight: 800, marginTop: 5, letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Battle record */}
          <div style={{ padding: "20px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", color: ACCENT, fontWeight: 800, marginBottom: 14 }}>RECENT BATTLES</div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "16px 0" }}>No battles yet — <Link href="/battles" style={{ color: ACCENT, textDecoration: "none" }}>join a battle</Link></p>
          </div>

          {/* Upcoming shows */}
          <div style={{ padding: "20px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", color: ACCENT, fontWeight: 800, marginBottom: 14 }}>UPCOMING SHOWS</div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "16px 0" }}>No shows booked yet.</p>
            <Link href="/booking" style={{ display: "block", marginTop: 14, padding: "9px 0", textAlign: "center", borderRadius: 8, background: `${ACCENT}10`, border: `1px solid ${ACCENT}28`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none" }}>
              + BOOK A SHOW
            </Link>
          </div>
        </div>

        {/* Action grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {[
            { href: "/hub/performer",    label: "Control Room",    color: ACCENT    },
            { href: "/battles/new",      label: "New Challenge",   color: "#FFD700" },
            { href: "/beat-vault",       label: "Beat Vault",      color: "#00FFFF" },
            { href: "/nft/mint",         label: "Mint NFT",        color: "#FF2DAA" },
            { href: "/performer/studio", label: "Go Live Studio",  color: "#00FF88" },
            { href: "/settings",         label: "Account Settings",color: "#AA2DFF" },
          ].map((a) => (
            <Link key={a.href} href={a.href} style={{ display: "block", padding: "12px 14px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", letterSpacing: "0.05em", textAlign: "center" }}>
              {a.label}
            </Link>
          ))}
        </div>

        {/* Media library */}
        <PerformerMediaLibrary ownerId={user.id} ownerName={displayName} accentColor={ACCENT} showUpload />
        <MemoryWall accentColor={ACCENT} title="Performer Memory Wall" />
        <OmniPresenceEngine displayName={displayName || "Performer"} defaultTab="messages" />
      </div>
    </main>
  );
}
