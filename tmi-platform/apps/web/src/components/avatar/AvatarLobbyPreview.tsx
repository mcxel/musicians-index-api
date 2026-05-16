"use client";

import Link from "next/link";

interface LobbyPreviewCard {
  id: string;
  name: string;
  audience: number;
  state: "active" | "waiting" | "closed";
  nextShow?: string;
}

interface AvatarLobbyPreviewProps {
  lobbies?: LobbyPreviewCard[];
}

export default function AvatarLobbyPreview({ lobbies = [] }: AvatarLobbyPreviewProps) {
  const defaultLobbies: LobbyPreviewCard[] = [
    { id: "test", name: "Test Theater", audience: 42, state: "active", nextShow: "5m" },
    { id: "lab", name: "Lab Lounge", audience: 8, state: "waiting", nextShow: "12m" },
    { id: "arena", name: "Arena Hall", audience: 156, state: "active", nextShow: "2m" },
  ];

  const display_lobbies = lobbies.length > 0 ? lobbies : defaultLobbies;

  return (
    <div
      style={{
        borderRadius: 16,
        border: "2px solid #6a4b96",
        background: "#0f0818",
        padding: 16,
      }}
    >
      <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        Lobby Preview
      </div>
      <h3 style={{ margin: "0 0 12px", color: "#f3eaff", fontSize: 16, fontWeight: 700 }}>
        Available Theaters
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        {display_lobbies.map((lobby) => {
          const state_colors: Record<string, { border: string; bg: string; badge: string }> = {
            active: {
              border: "#5ad7ff",
              bg: "rgba(90, 215, 255, 0.05)",
              badge: "#5ad7ff",
            },
            waiting: {
              border: "#ffb347",
              bg: "rgba(255, 179, 71, 0.05)",
              badge: "#ffb347",
            },
            closed: {
              border: "#6a4b96",
              bg: "rgba(106, 75, 150, 0.05)",
              badge: "#9f7dd6",
            },
          };
          const colors = state_colors[lobby.state];

          return (
            <Link
              key={lobby.id}
              href={`/lobbies/${lobby.id}`}
              style={{
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                background: colors.bg,
                padding: 12,
                textDecoration: "none",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = `0 0 12px ${colors.border}`;
                el.style.borderColor = colors.badge;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = "none";
                el.style.borderColor = colors.border;
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                <div style={{ color: "#f3eaff", fontSize: 14, fontWeight: 700 }}>{lobby.name}</div>
                <div
                  style={{
                    borderRadius: 4,
                    background: colors.badge,
                    color: "#140c21",
                    fontSize: 8,
                    fontWeight: 700,
                    padding: "2px 6px",
                    textTransform: "uppercase",
                  }}
                >
                  {lobby.state}
                </div>
              </div>
              <div style={{ color: "#c8b5e5", fontSize: 12, marginBottom: 6 }}>
                👥 {lobby.audience} in lobby
              </div>
              {lobby.nextShow && (
                <div style={{ color: colors.badge, fontSize: 11, fontWeight: 600 }}>
                  Next: {lobby.nextShow}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
