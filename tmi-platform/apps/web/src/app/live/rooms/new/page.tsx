"use client";

/**
 * /live/rooms/new — CREATE ROOM entry (BillboardLiveWall target).
 * Converges onto POST /api/live/go + GlobalLiveSessionRegistry (Targets 2–3).
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

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
      const roomId = `room-${Date.now()}`;
      const res = await fetch("/api/live/go", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        href?: string;
        roomId?: string;
        session?: { roomId?: string };
      };
      if (!res.ok) {
        setError(data.error ?? `Create failed (${res.status})`);
        setBusy(false);
        return;
      }
      const id = data.roomId ?? data.session?.roomId ?? roomId;
      const href = data.href ?? `/live/rooms/${encodeURIComponent(id)}?from=live-lobby`;
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
          Requires PLATINUM or DIAMOND. Registers into GlobalLiveSessionRegistry and appears in Live
          Discovery.
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
              <option value="session">Session / Lounge</option>
              <option value="battle">Battle</option>
              <option value="cypher">Cypher</option>
              <option value="challenge">Challenge</option>
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
