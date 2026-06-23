"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import HighFidelityAvatar from "@/components/avatar/HighFidelityAvatar";
import ImageUploader from "@/components/media/ImageUploader";

type Section = "profile" | "notifications" | "privacy" | "password" | "linked" | "danger";

const NAV_ITEMS: { id: Section; label: string; icon: string; color: string }[] = [
  { id: "profile",       label: "Profile",          icon: "🎤", color: "#00FFFF"  },
  { id: "notifications", label: "Notifications",    icon: "🔔", color: "#FFD700"  },
  { id: "privacy",       label: "Privacy",          icon: "🔒", color: "#AA2DFF"  },
  { id: "password",      label: "Password",         icon: "🛡️", color: "#00FF88"  },
  { id: "linked",        label: "Linked Accounts",  icon: "🔗", color: "#FF9500"  },
  { id: "danger",        label: "Danger Zone",      icon: "⚠️", color: "#FF2DAA"  },
];

const SOCIAL_PLATFORMS = [
  { id: "twitter",   label: "Twitter / X",  icon: "🐦", linked: false, handle: "" },
  { id: "instagram", label: "Instagram",    icon: "📸", linked: false, handle: "" },
  { id: "spotify",   label: "Spotify",      icon: "🎵", linked: false, handle: "" },
  { id: "youtube",   label: "YouTube",      icon: "▶️", linked: false, handle: "" },
  { id: "tiktok",    label: "TikTok",       icon: "🎬", linked: false, handle: "" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [saved, setSaved] = useState<Section | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPhotoUploader, setShowPhotoUploader] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [exportMsg, setExportMsg] = useState("");
  const [platforms, setPlatforms] = useState(SOCIAL_PLATFORMS);

  // Profile state
  const [profile, setProfile] = useState({ name: "", email: "", bio: "", website: "", role: "artist", avatarUrl: "" });

  // Notification state
  const [notifs, setNotifs] = useState({ newFollowers: true, comments: true, likes: false, liveEvents: true, bookingRequests: true, payouts: true, tips: true, newsletter: false, marketingEmails: false });

  // Privacy state
  const [privacy, setPrivacy] = useState({ profileVisibility: "public", showLocation: false, showOnlineStatus: true, allowDirectMessages: "followers", showInSearch: true, allowCollabs: true });

  // Password state
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then((d: { user?: { id?: string; name?: string; email?: string; role?: string } }) => {
        if (d?.user) {
          setProfile(prev => ({
            ...prev,
            name:  d.user!.name  ?? d.user!.email?.split("@")[0] ?? "",
            email: d.user!.email ?? "",
            role:  d.user!.role  ?? "artist",
          }));
        }
      })
      .catch(() => {});

    const storedAvatar = typeof window !== "undefined" ? localStorage.getItem("tmi_profile_avatar_url") : null;
    if (storedAvatar) {
      setProfile((prev) => ({ ...prev, avatarUrl: storedAvatar }));
    }
  }, []);

  async function save(section: Section) {
    setSaveError(null);
    if (section === "profile") {
      try {
        await fetch("/api/profile/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ displayName: profile.name, bio: profile.bio, website: profile.website, avatarUrl: profile.avatarUrl || undefined }),
        });
      } catch { /* non-blocking */ }
    }
    if (section === "notifications") {
      try {
        await fetch("/api/settings/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ preferences: notifs }),
        });
      } catch { /* non-blocking */ }
    }
    if (section === "privacy") {
      try {
        await fetch("/api/settings/privacy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ privacy }),
        });
      } catch { /* non-blocking */ }
    }
    setSaved(section);
    setTimeout(() => setSaved(null), 2500);
  }

  async function handleAvatarUpload(url: string) {
    setProfile((prev) => ({ ...prev, avatarUrl: url }));
    if (typeof window !== "undefined") {
      localStorage.setItem("tmi_profile_avatar_url", url);
    }
    fetch("/api/profile/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ avatarUrl: url }),
    }).catch(() => {});
    setUploadNotice("Photo uploaded and linked to your profile.");
    setShowPhotoUploader(false);
    setTimeout(() => setUploadNotice(null), 3500);
  }

  function requestExport() {
    setExportMsg("Export requested — you'll receive an email within 24 hours.");
    setTimeout(() => setExportMsg(""), 5000);
  }

  function togglePlatform(id: string) {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, linked: !p.linked, handle: !p.linked ? "@connected" : "" } : p));
  }

  async function confirmDeleteAccount() {
    if (deleteConfirm !== "DELETE MY ACCOUNT") return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/auth/deactivate", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setShowDeleteModal(false);
        router.replace("/home/1?notice=account-deactivated");
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setDeleteError(data?.error ?? "Deactivation failed. Please try again.");
        setDeleteBusy(false);
      }
    } catch {
      setDeleteError("Network error. Please try again.");
      setDeleteBusy(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { setPwError("Passwords don't match"); return; }
    if (pwForm.newPw.length < 8) { setPwError("Password must be at least 8 characters"); return; }
    setPwError("");
    setPwBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setPwError(data.error ?? "Password change failed. Check your current password.");
      } else {
        setSaved("password");
        setPwForm({ current: "", newPw: "", confirm: "" });
        setTimeout(() => setSaved(null), 2500);
      }
    } catch {
      setPwError("Network error. Please try again.");
    } finally {
      setPwBusy(false);
    }
  }

  const SaveButton = ({ section, busy }: { section: Section; busy?: boolean }) => (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={busy}
      style={{ padding: "11px 24px", background: saved === section ? "rgba(0,255,136,0.2)" : "linear-gradient(135deg,#00FFFF,#00FF88)", color: saved === section ? "#00FF88" : "#050510", fontSize: 12, fontWeight: 800, letterSpacing: "0.06em", borderRadius: 8, border: saved === section ? "1px solid rgba(0,255,136,0.4)" : "none", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1 }}>
      {busy ? "Saving…" : saved === section ? "✓ Saved" : "Save Changes"}
    </motion.button>
  );

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(160deg,#040412,#06041a)", color: "#fff", fontFamily: "'Inter',sans-serif", paddingBottom: 80 }}>
      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { if (!deleteBusy) setShowDeleteModal(false); }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#0a0010", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 18, padding: "32px 28px", maxWidth: 420, width: "100%" }}>
              <div style={{ fontSize: 40, textAlign: "center", marginBottom: 14 }}>💀</div>
              <div style={{ fontSize: 18, fontWeight: 900, textAlign: "center", color: "#FF2DAA", marginBottom: 10 }}>Deactivate Account</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textAlign: "center", marginBottom: 20, lineHeight: 1.7 }}>
                This will deactivate your account and end your session. Your data is preserved — contact support to restore access.
              </div>
              <label style={{ ...labelStyle, marginBottom: 8 }}>TYPE &quot;DELETE MY ACCOUNT&quot; TO CONFIRM</label>
              <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                disabled={deleteBusy}
                style={{ ...inputStyle, marginBottom: 16 }} />
              {deleteError && (
                <div style={{ marginBottom: 12, fontSize: 12, color: "#ff8888", background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.3)", borderRadius: 8, padding: "8px 12px" }}>
                  {deleteError}
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { if (!deleteBusy) setShowDeleteModal(false); }}
                  disabled={deleteBusy}
                  style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 12, cursor: deleteBusy ? "not-allowed" : "pointer" }}>
                  Cancel
                </button>
                <button disabled={deleteConfirm !== "DELETE MY ACCOUNT" || deleteBusy}
                  onClick={() => void confirmDeleteAccount()}
                  style={{ flex: 1, padding: "11px", background: deleteConfirm === "DELETE MY ACCOUNT" && !deleteBusy ? "rgba(255,45,170,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${deleteConfirm === "DELETE MY ACCOUNT" ? "rgba(255,45,170,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, color: deleteConfirm === "DELETE MY ACCOUNT" && !deleteBusy ? "#FF2DAA" : "rgba(255,255,255,0.2)", fontWeight: 800, fontSize: 12, cursor: deleteConfirm === "DELETE MY ACCOUNT" && !deleteBusy ? "pointer" : "not-allowed" }}>
                  {deleteBusy ? "Deactivating…" : "Deactivate"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "18px 28px", display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/account" style={{ fontSize: 11, color: "rgba(0,255,255,0.7)", textDecoration: "none" }}>← My Account</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Settings</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "200px 1fr", gap: 28, alignItems: "start" }}>
        {/* Nav */}
        <div style={{ position: "sticky", top: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", marginBottom: 12 }}>SETTINGS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", borderRadius: 8, background: activeSection === item.id ? item.color + "12" : "transparent", border: `1px solid ${activeSection === item.id ? item.color + "40" : "transparent"}`, cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: activeSection === item.id ? item.color : "rgba(255,255,255,0.55)" }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "28px 24px" }}>

            {/* PROFILE */}
            {activeSection === "profile" && (
              <form onSubmit={e => { e.preventDefault(); void save("profile"); }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.2em", marginBottom: 24 }}>PROFILE</div>
                {/* Avatar */}
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
                  <HighFidelityAvatar imageUrl={profile.avatarUrl || undefined} name={profile.name} size={72} tierColor="#00FFFF" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Profile Photo</div>
                    <button
                      type="button"
                      onClick={() => setShowPhotoUploader((v) => !v)}
                      style={{ padding: "7px 14px", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 6, color: "#00FFFF", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                    >
                      {showPhotoUploader ? "Hide Uploader" : "Upload Photo"}
                    </button>
                    {uploadNotice && <div style={{ marginTop: 6, fontSize: 10, color: "#00FF88", fontWeight: 700 }}>{uploadNotice}</div>}
                  </div>
                </div>
                {showPhotoUploader && (
                  <div style={{ marginBottom: 20 }}>
                    <ImageUploader context="profile" onUploadComplete={handleAvatarUpload} accentColor="#00FFFF" />
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>DISPLAY NAME</label>
                    <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>EMAIL</label>
                    <input type="email" value={profile.email} readOnly style={{ ...inputStyle, opacity: 0.6, cursor: "default" }} title="Email cannot be changed here" />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>BIO</label>
                  <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>WEBSITE</label>
                  <input value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} placeholder="https://yoursite.com" style={inputStyle} />
                </div>
                {saveError && <div style={{ color: "#ff8888", fontSize: 12, marginBottom: 12 }}>{saveError}</div>}
                <SaveButton section="profile" />
              </form>
            )}

            {/* NOTIFICATIONS */}
            {activeSection === "notifications" && (
              <form onSubmit={e => { e.preventDefault(); void save("notifications"); }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.2em", marginBottom: 24 }}>NOTIFICATIONS</div>
                {[
                  { key: "newFollowers",     label: "New followers",          sub: "When someone follows you" },
                  { key: "comments",         label: "Comments & replies",     sub: "On your posts and tracks" },
                  { key: "likes",            label: "Likes",                  sub: "When someone likes your content" },
                  { key: "liveEvents",       label: "Live event alerts",      sub: "Events from artists you follow" },
                  { key: "bookingRequests",  label: "Booking requests",       sub: "New offers from venues" },
                  { key: "payouts",          label: "Payouts & earnings",     sub: "Payment confirmations" },
                  { key: "tips",             label: "Tips received",          sub: "Fan tip notifications" },
                  { key: "newsletter",       label: "TMI Newsletter",         sub: "Weekly platform news" },
                  { key: "marketingEmails",  label: "Marketing emails",       sub: "Promotions and offers" },
                ].map(item => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{item.sub}</div>
                    </div>
                    <div onClick={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                      style={{ width: 44, height: 24, borderRadius: 12, background: notifs[item.key as keyof typeof notifs] ? "rgba(0,255,136,0.9)" : "rgba(255,255,255,0.12)", border: `1px solid ${notifs[item.key as keyof typeof notifs] ? "rgba(0,255,136,0.5)" : "rgba(255,255,255,0.2)"}`, cursor: "pointer", position: "relative", transition: "all 200ms" }}>
                      <div style={{ position: "absolute", top: 3, left: notifs[item.key as keyof typeof notifs] ? 22 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 200ms" }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 20 }}><SaveButton section="notifications" /></div>
              </form>
            )}

            {/* PRIVACY */}
            {activeSection === "privacy" && (
              <form onSubmit={e => { e.preventDefault(); void save("privacy"); }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#AA2DFF", letterSpacing: "0.2em", marginBottom: 24 }}>PRIVACY</div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>PROFILE VISIBILITY</label>
                  <select value={privacy.profileVisibility} onChange={e => setPrivacy(p => ({ ...p, profileVisibility: e.target.value }))} style={inputStyle}>
                    <option value="public">Public — anyone can view</option>
                    <option value="followers">Followers only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>WHO CAN DM YOU</label>
                  <select value={privacy.allowDirectMessages} onChange={e => setPrivacy(p => ({ ...p, allowDirectMessages: e.target.value }))} style={inputStyle}>
                    <option value="everyone">Everyone</option>
                    <option value="followers">Followers only</option>
                    <option value="none">Nobody</option>
                  </select>
                </div>
                {[
                  { key: "showLocation",     label: "Show location on profile"    },
                  { key: "showOnlineStatus", label: "Show online status"          },
                  { key: "showInSearch",     label: "Appear in search results"    },
                  { key: "allowCollabs",     label: "Allow collab requests"       },
                ].map(item => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                    <div onClick={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                      style={{ width: 44, height: 24, borderRadius: 12, background: privacy[item.key as keyof typeof privacy] ? "rgba(170,45,255,0.8)" : "rgba(255,255,255,0.12)", cursor: "pointer", position: "relative", transition: "all 200ms" }}>
                      <div style={{ position: "absolute", top: 3, left: privacy[item.key as keyof typeof privacy] ? 22 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 200ms" }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 20 }}><SaveButton section="privacy" /></div>
              </form>
            )}

            {/* PASSWORD */}
            {activeSection === "password" && (
              <form onSubmit={e => void handlePasswordSave(e)}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#00FF88", letterSpacing: "0.2em", marginBottom: 24 }}>CHANGE PASSWORD</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                  <div>
                    <label style={labelStyle}>CURRENT PASSWORD</label>
                    <input required type="password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>NEW PASSWORD</label>
                    <input required type="password" value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>CONFIRM NEW PASSWORD</label>
                    <input required type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} style={inputStyle} />
                  </div>
                </div>
                {pwError && <div style={{ color: "#FF2DAA", fontSize: 12, marginBottom: 12 }}>{pwError}</div>}
                {saved === "password" && <div style={{ color: "#00FF88", fontSize: 12, marginBottom: 12 }}>Password updated successfully.</div>}
                <SaveButton section="password" busy={pwBusy} />
              </form>
            )}

            {/* LINKED ACCOUNTS */}
            {activeSection === "linked" && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#FF9500", letterSpacing: "0.2em", marginBottom: 24 }}>LINKED ACCOUNTS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {platforms.map(platform => (
                    <div key={platform.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span style={{ fontSize: 22 }}>{platform.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{platform.label}</div>
                          {platform.linked && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{platform.handle}</div>}
                        </div>
                      </div>
                      <button onClick={() => togglePlatform(platform.id)} style={{ padding: "7px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
                        background: platform.linked ? "rgba(255,45,170,0.08)" : "rgba(255,149,0,0.1)",
                        border: `1px solid ${platform.linked ? "rgba(255,45,170,0.25)" : "rgba(255,149,0,0.3)"}`,
                        color: platform.linked ? "#FF2DAA" : "#FF9500" }}>
                        {platform.linked ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  OAuth social account linking coming soon.
                </div>
              </div>
            )}

            {/* DANGER ZONE */}
            {activeSection === "danger" && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#FF2DAA", letterSpacing: "0.2em", marginBottom: 24 }}>DANGER ZONE</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ padding: "18px 16px", background: "rgba(255,45,170,0.05)", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>Export Account Data</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>Download a copy of all your TMI data including profile, content, and earnings history.</div>
                    {exportMsg && <div style={{ fontSize: 11, color: "#00FF88", marginBottom: 10 }}>{exportMsg}</div>}
                    <button onClick={requestExport} style={{ padding: "9px 18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 7, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      Request Data Export
                    </button>
                  </div>
                  <div style={{ padding: "18px 16px", background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#FF2DAA", marginBottom: 4 }}>Deactivate Account</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>Deactivate your account and end your session. Your data is preserved. Contact support to restore access.</div>
                    <Link href="/account/deactivate"
                      style={{ display: "inline-block", padding: "9px 18px", background: "rgba(255,45,170,0.15)", border: "1px solid rgba(255,45,170,0.4)", borderRadius: 7, color: "#FF2DAA", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>
                      Deactivate My Account
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" };
