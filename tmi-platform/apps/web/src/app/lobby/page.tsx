"use client";

import { useMemo, useState } from "react";
import {
  getPublicLobbies,
  checkLobbyAccess,
  type LobbyPrivacyType,
} from "@/lib/lobbies/lobbyPrivacyEngine";

export default function LobbyPage() {
  const [userId, setUserId] = useState("guest-user");
  const [age, setAge] = useState<number>(18);
  const [result, setResult] = useState<string>("");

  const lobbies = useMemo(() => getPublicLobbies(), []);

  function handleJoin(lobbyId: string, privacyType: LobbyPrivacyType) {
    const access = checkLobbyAccess(lobbyId, userId, age, false);
    setResult(`${privacyType.toUpperCase()} ${lobbyId}: ${access.allowed ? "ALLOWED" : "BLOCKED"} (${access.reason})`);
  }

  return (
    <main
      data-testid="lobby-page"
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "#e2e8f0",
        padding: 24,
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 8, color: "#38bdf8" }}>Lobby Directory</h1>
      <p style={{ color: "#94a3b8", marginBottom: 16 }}>
        Public lobbies are visible below. Private and invite-only rooms are protected by the lobby privacy engine.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          data-testid="lobby-user-id"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          style={{
            background: "#111827",
            border: "1px solid #334155",
            color: "#e2e8f0",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        />
        <input
          data-testid="lobby-user-age"
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          placeholder="Age"
          style={{
            background: "#111827",
            border: "1px solid #334155",
            color: "#e2e8f0",
            borderRadius: 8,
            padding: "8px 12px",
            width: 90,
          }}
        />
      </div>

      <section style={{ display: "grid", gap: 10, maxWidth: 700 }}>
        {lobbies.map((lobby) => (
          <div
            key={lobby.lobbyId}
            data-testid={`lobby-card-${lobby.lobbyId}`}
            style={{
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: 10,
              padding: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{lobby.lobbyId}</div>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>
                {lobby.privacyType.toUpperCase()} • capacity {lobby.maxCapacity}
              </div>
            </div>
            <button
              data-testid={`join-lobby-${lobby.lobbyId}`}
              onClick={() => handleJoin(lobby.lobbyId, lobby.privacyType)}
              style={{
                background: "#0ea5e9",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Join Lobby
            </button>
          </div>
        ))}
      </section>

      {result ? (
        <div
          data-testid="lobby-access-result"
          style={{
            marginTop: 16,
            background: "#111827",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: 10,
            color: "#cbd5e1",
            maxWidth: 700,
          }}
        >
          {result}
        </div>
      ) : null}
    </main>
  );
}
