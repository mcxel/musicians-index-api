"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SocialProfile {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isOnline?: boolean;
  isFollowing?: boolean;
}

interface SocialDockProps {
  profile: SocialProfile;
  /** The currently-logged-in user's ID — used to hide "send DM to yourself" */
  viewerId?: string;
  accentColor?: string;
  onFollow?: (profileId: string, following: boolean) => void;
  onInvite?: (profileId: string) => void;
}

// ── In-memory DM store (per session) ─────────────────────────────────────────

type DMMessage = { id: string; fromMe: boolean; text: string; ts: number };
const dmStores = new Map<string, DMMessage[]>();
function getDMs(profileId: string): DMMessage[] {
  if (!dmStores.has(profileId)) dmStores.set(profileId, []);
  return dmStores.get(profileId)!;
}

// ── In-memory friends list ────────────────────────────────────────────────────

const friendIds = new Set<string>();
const followIds = new Set<string>();

// ── Video/voice call modal ────────────────────────────────────────────────────

function CallModal({ profile, mode, onClose }: {
  profile: SocialProfile;
  mode: "video" | "voice";
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"connecting" | "live" | "denied">("connecting");

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: mode === "video", audio: true })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setStatus("live");
      })
      .catch(() => setStatus("denied"));
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [mode]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 420, borderRadius: 16,
        background: "#0a0a14", border: "1px solid rgba(255,255,255,0.12)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 18 }}>{mode === "video" ? "📹" : "🎙"}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{mode === "video" ? "Video Call" : "Voice Call"}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>with {profile.name}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer" }}>×</button>
        </div>

        {/* Video area */}
        {mode === "video" ? (
          <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#050510" }}>
            {status === "connecting" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
                Requesting camera…
              </div>
            )}
            {status === "denied" && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fca5a5", fontSize: 12 }}>
                Camera access denied
              </div>
            )}
            <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", opacity: status === "live" ? 1 : 0 }} />
            {status === "live" && (
              <div style={{ position: "absolute", bottom: 8, left: 8, fontSize: 9, fontWeight: 800, color: "#22c55e", background: "rgba(0,0,0,0.6)", padding: "2px 8px", borderRadius: 8, letterSpacing: "0.1em" }}>
                ● LIVE
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
              style={{ fontSize: 40 }}>🎙</motion.div>
            <div style={{ fontSize: 12, color: status === "live" ? "#22c55e" : "rgba(255,255,255,0.4)" }}>
              {status === "connecting" ? "Connecting…" : status === "live" ? "Voice call active" : "Microphone denied"}
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ padding: 16, display: "flex", justifyContent: "center", gap: 12 }}>
          <button
            onClick={onClose}
            style={{ padding: "10px 24px", borderRadius: 8, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", fontSize: 11, fontWeight: 800, cursor: "pointer", letterSpacing: "0.08em" }}
          >
            END CALL
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DM Panel ──────────────────────────────────────────────────────────────────

function DMPanel({ profile, accentColor, onClose }: {
  profile: SocialProfile;
  accentColor: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<DMMessage[]>(() => getDMs(profile.id));
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const msg: DMMessage = { id: Date.now().toString(), fromMe: true, text: input.trim(), ts: Date.now() };
    getDMs(profile.id).push(msg);
    setMessages([...getDMs(profile.id)]);
    setInput("");
  };

  return (
    <div style={{
      position: "fixed", bottom: 80, right: 20, zIndex: 9000,
      width: 320, height: 420, borderRadius: 14,
      background: "#0a0a18", border: `1px solid ${accentColor}44`,
      display: "flex", flexDirection: "column",
      boxShadow: `0 8px 40px ${accentColor}22`,
    }}>
      <div style={{ padding: "12px 14px", borderBottom: `1px solid ${accentColor}22`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: profile.isOnline ? "#22c55e" : "#6b7280" }} />
        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", flex: 1 }}>{profile.name}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 16, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, textAlign: "center", marginTop: 20 }}>
            Start the conversation with {profile.name}
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.fromMe ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "75%", padding: "7px 12px", borderRadius: m.fromMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: m.fromMe ? `${accentColor}33` : "rgba(255,255,255,0.07)",
              border: `1px solid ${m.fromMe ? accentColor + "44" : "rgba(255,255,255,0.1)"}`,
              fontSize: 12, color: "#e2e8f0",
            }}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${accentColor}22`, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message…"
          style={{
            flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${accentColor}33`,
            borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, outline: "none",
          }}
        />
        <button onClick={send} style={{ padding: "7px 14px", borderRadius: 8, background: `${accentColor}33`, border: `1px solid ${accentColor}55`, color: accentColor, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
          SEND
        </button>
      </div>
    </div>
  );
}

// ── Friends + Search Panel ────────────────────────────────────────────────────

function FriendsPanel({ accentColor, onClose }: { accentColor: string; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SocialProfile[]>([]);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    // Wire to real API when available — mock results for now
    await new Promise((r) => setTimeout(r, 400));
    setResults([
      { id: "p1", name: "DJ Nova", role: "Performer", isOnline: true },
      { id: "p2", name: "Aria Bloom", role: "Artist", isOnline: false },
      { id: "p3", name: query.trim(), role: "Fan", isOnline: true },
    ]);
    setSearching(false);
  };

  return (
    <div style={{
      position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
      zIndex: 9000, width: 360, borderRadius: 14,
      background: "#0a0a18", border: `1px solid ${accentColor}44`,
      boxShadow: `0 8px 40px ${accentColor}22`,
    }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${accentColor}22`, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>Find Friends & Performers</span>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer" }}>×</button>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search by name, role, or genre…"
            style={{
              flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${accentColor}33`,
              borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 12, outline: "none",
            }}
          />
          <button onClick={search} style={{ padding: "8px 14px", borderRadius: 8, background: `${accentColor}22`, border: `1px solid ${accentColor}44`, color: accentColor, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
            {searching ? "…" : "SEARCH"}
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {results.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.isOnline ? "#22c55e" : "#6b7280" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{r.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{r.role}</div>
              </div>
              <button
                onClick={() => { friendIds.add(r.id); }}
                style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: 9, fontWeight: 800, cursor: "pointer", letterSpacing: "0.08em" }}
              >
                + ADD
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main SocialDock ───────────────────────────────────────────────────────────

export default function SocialDock({
  profile,
  viewerId,
  accentColor = "#00FFFF",
  onFollow,
  onInvite,
}: SocialDockProps) {
  const [following, setFollowing] = useState(() => followIds.has(profile.id));
  const [dmOpen, setDmOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [callMode, setCallMode] = useState<"video" | "voice" | null>(null);
  const [inviteSent, setInviteSent] = useState(false);

  const isSelf = viewerId === profile.id;

  const handleFollow = () => {
    const next = !following;
    setFollowing(next);
    if (next) followIds.add(profile.id); else followIds.delete(profile.id);
    onFollow?.(profile.id, next);
  };

  const handleInvite = () => {
    setInviteSent(true);
    onInvite?.(profile.id);
    setTimeout(() => setInviteSent(false), 3000);
  };

  return (
    <>
      {/* Dock bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
        padding: "10px 14px",
        borderRadius: 12,
        background: "rgba(10,10,24,0.85)",
        border: `1px solid ${accentColor}22`,
        backdropFilter: "blur(8px)",
      }}>
        {/* Follow */}
        {!isSelf && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleFollow}
            style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 10, fontWeight: 800,
              cursor: "pointer", letterSpacing: "0.08em",
              background: following ? `${accentColor}22` : "rgba(255,255,255,0.06)",
              border: `1px solid ${following ? accentColor + "55" : "rgba(255,255,255,0.12)"}`,
              color: following ? accentColor : "rgba(255,255,255,0.6)",
              transition: "all 0.15s",
            }}
          >
            {following ? "✓ FOLLOWING" : "+ FOLLOW"}
          </motion.button>
        )}

        {/* DM */}
        {!isSelf && (
          <button
            onClick={() => setDmOpen(true)}
            style={{ padding: "7px 12px", borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: "pointer", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
          >
            ✉ MESSAGE
          </button>
        )}

        {/* Voice call */}
        {!isSelf && (
          <button
            onClick={() => setCallMode("voice")}
            style={{ padding: "7px 12px", borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: "pointer", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
          >
            🎙 VOICE
          </button>
        )}

        {/* Video call */}
        {!isSelf && (
          <button
            onClick={() => setCallMode("video")}
            style={{ padding: "7px 12px", borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: "pointer", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
          >
            📹 VIDEO CALL
          </button>
        )}

        {/* Invite */}
        {!isSelf && (
          <button
            onClick={handleInvite}
            style={{ padding: "7px 12px", borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: "pointer", background: inviteSent ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)", border: `1px solid ${inviteSent ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.1)"}`, color: inviteSent ? "#86efac" : "rgba(255,255,255,0.7)" }}
          >
            {inviteSent ? "✓ INVITED" : "🔗 INVITE"}
          </button>
        )}

        {/* Friends / Search */}
        <button
          onClick={() => setFriendsOpen(true)}
          style={{ padding: "7px 12px", borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: "pointer", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
        >
          🔍 FIND FRIENDS
        </button>
      </div>

      {/* DM panel */}
      <AnimatePresence>
        {dmOpen && (
          <motion.div key="dm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <DMPanel profile={profile} accentColor={accentColor} onClose={() => setDmOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friends panel */}
      <AnimatePresence>
        {friendsOpen && (
          <motion.div key="friends" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <FriendsPanel accentColor={accentColor} onClose={() => setFriendsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call modal */}
      <AnimatePresence>
        {callMode && (
          <motion.div key="call" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CallModal profile={profile} mode={callMode} onClose={() => setCallMode(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
