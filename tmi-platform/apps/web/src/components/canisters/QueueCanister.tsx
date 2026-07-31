"use client";

import { useState } from "react";

export interface QueueEntry {
  id: string;
  type: "BATTLE" | "CYPHER" | "CHALLENGE" | "PERFORMANCE" | "OPEN_MIC";
  title: string;
  position: number;
  estimatedWaitMinutes: number;
  status: "WAITING" | "READY" | "IN_PROGRESS";
}

interface QueueCanisterProps {
  accentColor?: string;
  onLeaveQueue?: (id: string) => void;
}

export function QueueCanister({
  accentColor = "#00FFFF",
  onLeaveQueue,
}: QueueCanisterProps) {
  const [queues, setQueues] = useState<QueueEntry[]>([
    {
      id: "q-1",
      type: "BATTLE",
      title: "Vocal Improv Arena #4",
      position: 2,
      estimatedWaitMinutes: 3,
      status: "WAITING",
    },
    {
      id: "q-2",
      type: "CYPHER",
      title: "Late Night Cypher Circle",
      position: 1,
      estimatedWaitMinutes: 1,
      status: "READY",
    },
  ]);

  const handleLeave = (id: string) => {
    setQueues((prev) => prev.filter((q) => q.id !== id));
    onLeaveQueue?.(id);
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.015)",
        border: `1px solid ${accentColor}22`,
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 18px",
          borderBottom: `1px solid ${accentColor}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12 }}>📋</span>
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.25em",
              color: accentColor,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            UNIVERSAL QUEUE RUNTIME
          </span>
        </div>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>
          {queues.length} ACTIVE QUEUES
        </span>
      </div>

      {/* Queue List */}
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {queues.length === 0 ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11, padding: "24px 0" }}>
            You are not in any active queues.
          </div>
        ) : (
          queues.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "12px 14px",
                borderRadius: 8,
                background: item.status === "READY" ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)",
                border: item.status === "READY" ? "1px solid #00FF88" : "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 900,
                      color: accentColor,
                      border: `1px solid ${accentColor}44`,
                      borderRadius: 3,
                      padding: "1px 5px",
                    }}
                  >
                    {item.type}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{item.title}</span>
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                  Position: #{item.position} · Est. Wait: ~{item.estimatedWaitMinutes} min
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {item.status === "READY" ? (
                  <button
                    type="button"
                    style={{
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: "none",
                      background: "#00FF88",
                      color: "#050310",
                      fontSize: 9,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    JOIN STAGE NOW
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLeave(item.id)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 6,
                      border: "1px solid rgba(255,68,68,0.4)",
                      background: "rgba(255,68,68,0.1)",
                      color: "#FF4444",
                      fontSize: 9,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    LEAVE
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default QueueCanister;
