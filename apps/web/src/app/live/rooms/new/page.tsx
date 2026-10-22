"use client";

/**
 * /live/rooms/new — CREATE ROOM entry (BillboardLiveWall target).
 *
 * Two canonical creation authorities exist in this platform and this page
 * routes to the correct one per category rather than duplicating either:
 *   - Battle / Challenge / World Dance Party -> their own dedicated
 *     EventOrchestrator/LobbyEvent routes (api/battles/mini,
 *     api/challenges/create, api/dance-parties/create) — the real,
 *     structured, DB-backed authority for these "Mini" experience types.
 *   - Live / Session / Cypher / Lounge / Concert / Game -> POST /api/live/go
 *     + GlobalLiveSessionRegistry, unchanged.
 * All are gated Silver+ via the same Rule 38 canonical policy
 * (isRule38Experience/canCreateRule38Experience for the /api/live/go path;
 * the dedicated routes reuse the equivalent per-type gate directly).
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const DEDICATED_ROUTE: Record<string, string> = {
  battle: "/api/battles/mini",
  challenge: "/api/challenges/create",
  "dj-world-dance-party": "/api/dance-parties/create",
};

export default function CreateLiveRoomPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("live");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const dedicatedRoute = DEDICATED_ROUTE[category];
      const roomId = `room-${Date.now()}`;
      const res = await fetch(dedicatedRoute ?? "/api/live/go", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: dedicatedRoute
          ? JSON.stringify({ title: title.trim() || undefined })
          : JSON.stringify({
              title: title.trim() || "Live Room",
              category,
              roomId,
              intent: "create-room",
              createRoom: true,
            }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
        reason?: string;
        href?: string;
        roomId?: string;
        joinUrl?: string;
        session?: { roomId?: string };
      };
      if (!res.ok) {
        setError(data.reason ?? data.error ?? `Create failed (${res.status})`);
        setBusy(false);
        return;
      }
      const id = data.roomId ?? data.session?.roomId ?? roomId;
      const href = data.joinUrl ?? data.href ?? `/live/rooms/${encodeURIComponent(id)}?from=live-lobby`;
      router.push(href);
    } catch {
      setError("Network error creating room.");
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050510",
        color: "#fff",
        padding: "24px 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.14em", color: "#FF2DAA", fontWeight: 800 }}>
          CREATE ROOM
        </p>
        <h1 style={{ fontSize: 22, margin: "8px 0 16px" }}>Open a live venue</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 20 }}>
          Battle, Cypher, Challenge, Lounge, and World Dance Party require SILVER or above —
          any performer type. Live/Session/Concert/Game member venues require PLATINUM or
          DIAMOND. Every room appears in Live Discovery.
        </p>
        <form onSubmit={onCreate} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
            Room title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Lounge"
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "#0c0c14",
                color: "#fff",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 12 }}>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "#0c0c14",
                color: "#fff",
              }}
            >
              <option value="live">Live</option>
              <option value="session">Session</option>
              <option value="battle">Battle (Silver+)</option>
              <option value="cypher">Cypher (Silver+)</option>
              <option value="challenge">Challenge (Silver+)</option>
              <option value="lounge">Lounge (Silver+)</option>
              <option value="dj-world-dance-party">World Dance Party (Silver+)</option>
              <option value="concert">Concert</option>
              <option value="game">Game</option>
            </select>
          </label>
          {error ? (
            <p style={{ color: "#FF6B6B", fontSize: 13, margin: 0 }} role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: 8,
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              background: busy ? "#444" : "#FF2DAA",
              color: "#fff",
              fontWeight: 800,
              letterSpacing: "0.06em",
              cursor: busy ? "wait" : "pointer",
            }}
          >
            {busy ? "CREATING…" : "CREATE & ENTER"}
          </button>
        </form>
        <p style={{ marginTop: 20, fontSize: 12 }}>
          <Link href="/live/lobby" style={{ color: "#00FFFF" }}>
            ← Live Lobby
          </Link>
        </p>
      </div>
    </main>
  );
}
