"use client";

// Canon source: Adminisratation Hub.jpg — Staff Meeting rail in overseer bar
// Structure: staff list with status dots + schedule next meeting CTA + active meeting indicator

import React, { useState } from "react";

type StaffStatus = "online" | "meeting" | "away" | "offline";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: StaffStatus;
  taskCount?: number;
}

const STATUS_DOT: Record<StaffStatus, string> = {
  online:  "#00FF88",
  meeting: "#FFD700",
  away:    "#FF6B00",
  offline: "rgba(255,255,255,0.2)",
};

const STAFF: StaffMember[] = [
  { id: "big-ace",   name: "Big Ace",   role: "Owner",     status: "online",  taskCount: 18 },
  { id: "marcel",    name: "Marcel",    role: "Director",  status: "online",  taskCount: 12 },
  { id: "jay-paul",  name: "Jay Paul",  role: "Builder",   status: "meeting", taskCount: 9  },
  { id: "micah",     name: "Micah",     role: "Reporter",  status: "away",    taskCount: 4  },
  { id: "admin-ai",  name: "Admin AI",  role: "Overseer",  status: "online",  taskCount: 22 },
  { id: "sec-bot",   name: "Sec Bot",   role: "Sentinel",  status: "online",  taskCount: 5  },
];

export default function StaffMeetingRail() {
  const [meetingActive, setMeetingActive] = useState(false);

  const onlineCount = STAFF.filter((s) => s.status === "online" || s.status === "meeting").length;

  return (
    <div
      data-staff-meeting-rail
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 4px #00FF88" }} />
          <span style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em" }}>
            STAFF ONLINE · {onlineCount}/{STAFF.length}
          </span>
        </div>
        <button
          onClick={() => setMeetingActive((v) => !v)}
          style={{
            padding: "2px 10px",
            borderRadius: 20,
            background: meetingActive ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${meetingActive ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.1)"}`,
            color: meetingActive ? "#FFD700" : "rgba(255,255,255,0.5)",
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.12em",
            cursor: "pointer",
            boxShadow: meetingActive ? "0 0 8px rgba(255,215,0,0.3)" : "none",
          }}
        >
          {meetingActive ? "IN MEETING" : "CALL MEETING"}
        </button>
      </div>

      {/* Staff list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {STAFF.map((member) => (
          <div
            key={member.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 8px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: STATUS_DOT[member.status],
                boxShadow: member.status !== "offline" ? `0 0 4px ${STATUS_DOT[member.status]}` : "none",
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>
              {member.name}
            </span>
            <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
              {member.role}
            </span>
            {member.taskCount !== undefined && (
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 900,
                  color: "#00FFFF",
                  background: "rgba(0,255,255,0.08)",
                  borderRadius: 4,
                  padding: "1px 5px",
                }}
              >
                {member.taskCount}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
