"use client";

import { useState } from "react";
import { useTmiSession } from "@/hooks/SessionContext";
import { PlaylistCanister } from "@/components/canisters/PlaylistCanister";
import MemoryWallCanister from "@/components/canisters/MemoryWallCanister";
import MessagingCanister from "@/components/canisters/MessagingCanister";
import dynamic from "next/dynamic";

const TMIVideoRoom = dynamic(
  () => import("@/components/media/TMIVideoRoom"),
  { ssr: false, loading: () => <VideoShell state="loading" /> },
);

// ─── Tiny shell shown before video is ready ────────────────────────────────────

function VideoShell({ state }: { state: "idle" | "loading" | "active" }) {
  if (state === "active") return null;
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid rgba(0,255,136,0.2)",
        background: "rgba(5,5,16,0.8)",
        padding: 24,
        textAlign: "center",
        minHeight: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      {state === "loading" ? (
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          Connecting video session…
        </span>
      ) : null}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function RehearsalRoomShell() {
  const { userId, userName } = useTmiSession();
  const [videoActive, setVideoActive] = useState(false);

  const id = userId ?? "guest";
  const name = userName ?? "Rehearsing";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* ── Identity bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          borderRadius: 12,
          background: "rgba(0,255,136,0.06)",
          border: "1px solid rgba(0,255,136,0.15)",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#00FF88",
            boxShadow: "0 0 10px #00FF88",
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "0.06em",
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontSize: 9,
            color: "rgba(255,255,255,0.35)",
            marginLeft: "auto",
          }}
        >
          Private rehearsal · no live audience · no ticketing
        </span>
      </div>

      {/* ── Main grid: Playlist + Video Call ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {/* Playlist */}
        <div>
          <div
            style={{
              fontSize: 8,
              fontWeight: 900,
              color: "#AA2DFF",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Rehearsal Playlist
          </div>
          <PlaylistCanister entityId={id} entityName={name} accentColor="#AA2DFF" isOwner />
        </div>

        {/* Video Calls */}
        <div>
          <div
            style={{
              fontSize: 8,
              fontWeight: 900,
              color: "#00FF88",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Video Session
          </div>
          {videoActive ? (
            <TMIVideoRoom
              roomId={`rehearsal-${id}`}
              roomType="backstage"
              userId={id}
              userName={name}
              role="participant"
              showControls
              onLeft={() => setVideoActive(false)}
              onError={() => setVideoActive(false)}
            />
          ) : (
            <div
              style={{
                borderRadius: 14,
                border: "1px solid rgba(0,255,136,0.2)",
                background: "rgba(5,5,16,0.8)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                minHeight: 200,
              }}
            >
              <div style={{ fontSize: 28 }}>🎥</div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  textAlign: "center",
                }}
              >
                Start a private video session with your band or collaborators.
                <br />
                No stream · no recording · no audience.
              </div>
              <button
                onClick={() => setVideoActive(true)}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  background: "linear-gradient(90deg, #00FF88, #00C8FF)",
                  border: "none",
                  fontSize: 10,
                  fontWeight: 900,
                  color: "#050510",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  boxShadow: "0 0 16px rgba(0,255,136,0.35)",
                }}
              >
                START VIDEO SESSION
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Second row: Messaging + Memory Wall ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {/* Collaboration / Messaging */}
        <div>
          <div
            style={{
              fontSize: 8,
              fontWeight: 900,
              color: "#FF2DAA",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Collaboration Chat
          </div>
          <MessagingCanister height={320} />
        </div>

        {/* Memory Wall */}
        <div>
          <div
            style={{
              fontSize: 8,
              fontWeight: 900,
              color: "#FFD700",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Session Memories
          </div>
          <MemoryWallCanister
            entityId={id}
            entityType="performer"
            title="Rehearsal Moments"
            accentColor="#FFD700"
          />
        </div>
      </div>
    </div>
  );
}
