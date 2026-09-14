"use client";

/**
 * HubCommunicationsRail — desktop-persistent messaging/community rail.
 * Reuses MessagingCanister + RoomChatPanel (no second chat engine).
 * Mobile: same authorities via TopNav Messages → DRAWER.
 */

import { useEffect, useState, type CSSProperties } from "react";
import MessagingCanister from "@/components/canisters/MessagingCanister";
import RoomChatPanel from "@/components/messaging/RoomChatPanel";
import CommunityFeedPanel from "@/components/messaging/CommunityFeedPanel";

export type HubCommunicationsTab = "messages" | "room" | "community" | "people";

type Member = {
  userId?: string;
  displayName?: string;
  role?: string;
  active?: boolean;
};

export type HubCommunicationsRailProps = {
  role: "fan" | "performer";
  userId: string;
  displayName: string;
  roomId?: string | null;
  accentColor?: string;
  /** Controlled tab (mobile drawer). */
  tab?: HubCommunicationsTab;
  onTabChange?: (tab: HubCommunicationsTab) => void;
  /** drawer = full-width mobile sheet; rail = desktop aside. */
  variant?: "rail" | "drawer";
};

export default function HubCommunicationsRail({
  role,
  userId,
  displayName,
  roomId,
  accentColor = role === "performer" ? "#FFD700" : "#00FF88",
  tab: controlledTab,
  onTabChange,
  variant = "rail",
}: HubCommunicationsRailProps) {
  const [internalTab, setInternalTab] = useState<HubCommunicationsTab>("messages");
  const tab = controlledTab ?? internalTab;
  const setTab = (next: HubCommunicationsTab) => {
    if (onTabChange) onTabChange(next);
    else setInternalTab(next);
  };
  const [people, setPeople] = useState<Member[]>([]);
  const [peopleState, setPeopleState] = useState<"idle" | "loading" | "ready" | "empty" | "error">("idle");

  useEffect(() => {
    if (tab !== "people") return;
    if (!roomId) {
      setPeople([]);
      setPeopleState("empty");
      return;
    }
    let cancelled = false;
    setPeopleState("loading");
    void (async () => {
      try {
        const res = await fetch(`/api/live/audience?venue=${encodeURIComponent(roomId)}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`audience ${res.status}`);
        const data = (await res.json()) as { activeMembers?: Member[] };
        const members = Array.isArray(data.activeMembers) ? data.activeMembers : [];
        if (cancelled) return;
        setPeople(members);
        setPeopleState(members.length ? "ready" : "empty");
      } catch {
        if (!cancelled) {
          setPeople([]);
          setPeopleState("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, roomId]);

  const tabs: { id: HubCommunicationsTab; label: string }[] = [
    { id: "messages", label: "MESSAGES" },
    { id: "room", label: "ROOM" },
    { id: "community", label: "COMMUNITY" },
    { id: "people", label: "PEOPLE" },
  ];

  const shellStyle: CSSProperties =
    variant === "drawer"
      ? {
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          background: "transparent",
        }
      : {
          width: 300,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          alignSelf: "stretch",
          borderLeft: `1px solid ${accentColor}33`,
          background: "rgba(4,6,14,0.96)",
        };

  return (
    <aside
      data-hub-communications-rail="1"
      data-hub-communications-variant={variant}
      data-hub-communications-tab={tab}
      data-hub-role={role}
      aria-label="Communications and community"
      style={shellStyle}
    >
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "8px 8px 6px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              data-hub-comms-tab={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.1em",
                padding: "6px 4px",
                borderRadius: 6,
                border: active ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.1)",
                background: active ? `${accentColor}22` : "transparent",
                color: active ? accentColor : "rgba(255,255,255,0.55)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {tab === "messages" ? (
          <div style={{ flex: 1, minHeight: 420, padding: 8 }}>
            <MessagingCanister height={420} />
          </div>
        ) : null}

        {tab === "room" ? (
          roomId ? (
            <RoomChatPanel
              roomId={roomId}
              userId={userId}
              userName={displayName}
              userRole={role === "performer" ? "artist" : "fan"}
              height={420}
            />
          ) : (
            <div
              data-hub-comms-empty="room"
              style={{ padding: 16, fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}
            >
              No active room chat yet. GO LIVE or WATCH a room to open room messaging for that exact session.
            </div>
          )
        ) : null}

        {tab === "community" ? (
          <div style={{ flex: 1, minHeight: 420, padding: 8, overflow: "hidden" }}>
            <CommunityFeedPanel />
          </div>
        ) : null}

        {tab === "people" ? (
          <div data-hub-comms-people="1" style={{ padding: 12, overflowY: "auto" }}>
            {!roomId ? (
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                People appear when a real live room/session is active. No fabricated audience.
              </p>
            ) : peopleState === "loading" ? (
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0 }}>Loading participants…</p>
            ) : peopleState === "error" ? (
              <p style={{ fontSize: 11, color: "#FF6B6B", margin: 0 }}>
                Unable to load participants. Retry by switching tabs.
              </p>
            ) : peopleState === "empty" ? (
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0 }}>No participants yet.</p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {people.map((m, i) => (
                  <li
                    key={m.userId || `${m.displayName}-${i}`}
                    style={{
                      fontSize: 11,
                      color: "#fff",
                      padding: "6px 8px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{m.displayName || "Member"}</div>
                    <div style={{ fontSize: 9, color: accentColor, letterSpacing: "0.08em" }}>
                      {(m.role || "MEMBER").toUpperCase()}
                      {m.active === false ? " · IDLE" : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
