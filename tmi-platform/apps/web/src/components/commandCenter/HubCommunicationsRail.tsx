"use client";

/**
 * HubCommunicationsRail — desktop-persistent messaging/community rail.
 * Reuses MessagingCanister + RoomChatPanel (no second chat engine).
 * Mobile: same authorities via TopNav Messages → DRAWER.
 *
 * People tab: REPORT via ModerationEngine (/api/reports).
 * VOTE TO KICK / KICK NOW → POST /api/rooms/[id]/moderation → RoomModerationAuthority.
 * Capability map hides UNAUTHORIZED actions (no disabled-after-click KICK for ordinary users).
 */

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import MessagingCanister from "@/components/canisters/MessagingCanister";
import RoomChatPanel from "@/components/messaging/RoomChatPanel";
import CommunityFeedPanel from "@/components/messaging/CommunityFeedPanel";
import {
  resolveRoomModerationControls,
  type RoomModerationRoomClass,
} from "@/lib/moderation/RoomModerationCapabilityMap";
import type { RoomParticipantKind } from "@/lib/moderation/RoomModerationAuthority";

export type HubCommunicationsTab = "messages" | "room" | "community" | "people" | "living-os";

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
  /**
   * Room class for moderation capability map.
   * Defaults PERSONAL_OWNED when role is room owner context; callers should pass
   * AUTOMATED_PUBLIC for system rooms when known.
   */
  roomClass?: RoomModerationRoomClass;
  /** Server-derived — never trust client alone for kick authority. */
  isAuthorizedHost?: boolean;
  isOfficialModerator?: boolean;
  /** Shared dock content replaces only the rail workspace, never the media players. */
  companionDock?: ReactNode;
  /** Stable desktop profile summary rendered above the changing rail workspace. */
  identityHeader?: ReactNode;
};

function roomKindFromClass(
  roomClass: RoomModerationRoomClass,
): "public_automated" | "personal" | "official_event" {
  if (roomClass === "AUTOMATED_PUBLIC") return "public_automated";
  if (roomClass === "OFFICIAL_MODERATED") return "official_event";
  return "personal";
}

export default function HubCommunicationsRail({
  role,
  userId,
  displayName,
  roomId,
  accentColor = role === "performer" ? "#FFD700" : "#00FF88",
  tab: controlledTab,
  onTabChange,
  variant = "rail",
  roomClass = "PERSONAL_OWNED",
  isAuthorizedHost = false,
  isOfficialModerator = false,
  companionDock,
  identityHeader,
}: HubCommunicationsRailProps) {
  const [internalTab, setInternalTab] = useState<HubCommunicationsTab>("messages");
  const tab = controlledTab ?? internalTab;
  const setTab = (next: HubCommunicationsTab) => {
    if (onTabChange) onTabChange(next);
    else setInternalTab(next);
  };
  const [people, setPeople] = useState<Member[]>([]);
  const [peopleState, setPeopleState] = useState<"idle" | "loading" | "ready" | "empty" | "error">("idle");
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (companionDock) setTab("living-os");
    else if (tab === "living-os") setTab("messages");
  }, [companionDock]);

  const moderationControls = resolveRoomModerationControls({
    roomClass,
    isAuthorizedHost,
    isOfficialModerator,
  });

  const actorKind: RoomParticipantKind = isOfficialModerator
    ? "moderator"
    : isAuthorizedHost
      ? "host"
      : "ordinary";

  const refreshPeople = async () => {
    if (!roomId) {
      setPeople([]);
      setPeopleState("empty");
      return;
    }
    setPeopleState("loading");
    try {
      const res = await fetch(`/api/live/audience?venue=${encodeURIComponent(roomId)}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`audience ${res.status}`);
      const data = (await res.json()) as { activeMembers?: Member[] };
      const members = Array.isArray(data.activeMembers) ? data.activeMembers : [];
      setPeople(members);
      setPeopleState(members.length ? "ready" : "empty");
    } catch {
      setPeople([]);
      setPeopleState("error");
    }
  };

  const submitMemberReport = async (target: Member) => {
    const targetId = target.userId?.trim();
    if (!targetId || targetId === userId) {
      setActionMsg("Cannot report this member.");
      return;
    }
    setActionBusyId(targetId);
    setActionMsg(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          targetType: "user",
          targetId,
          category: "harassment",
          detail: roomId ? `Hub People report · room ${roomId}` : "Hub People report",
        }),
      });
      if (res.status === 401) {
        setActionMsg("Sign in to report.");
        return;
      }
      if (!res.ok) {
        setActionMsg("Report failed. Try again.");
        return;
      }
      setActionMsg(`Report submitted for ${target.displayName || "member"}.`);
    } catch {
      setActionMsg("Report failed. Try again.");
    } finally {
      setActionBusyId(null);
    }
  };

  const submitModerationAction = async (
    target: Member,
    action: "VOTE_TO_KICK" | "KICK_NOW",
  ) => {
    const targetId = target.userId?.trim();
    if (!roomId || !targetId || targetId === userId) {
      setActionMsg("Cannot moderate this member.");
      return;
    }
    if (targetId.startsWith("bot-") || target.role === "bot") {
      setActionMsg("Automated participants are not moderated as humans.");
      return;
    }
    setActionBusyId(targetId);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/moderation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action,
          targetUserId: targetId,
          actorKind,
          roomKind: roomKindFromClass(roomClass),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        vote?: { votes: number; required: number; thresholdMet: boolean };
        kickPlan?: { removedUserId: string } | null;
        removed?: boolean;
      };
      if (res.status === 401) {
        setActionMsg("Sign in to moderate.");
        return;
      }
      if (res.status === 403) {
        setActionMsg(data.error ?? "Not authorized for this action.");
        return;
      }
      if (!res.ok || !data.ok) {
        setActionMsg(data.error ?? "Moderation action failed.");
        return;
      }
      if (action === "VOTE_TO_KICK" && data.vote) {
        if (data.vote.thresholdMet && data.kickPlan) {
          setActionMsg(`Vote threshold met — ${target.displayName || "member"} removed from room.`);
          setPeople((prev) => prev.filter((m) => m.userId !== targetId));
        } else {
          setActionMsg(
            `Vote recorded (${data.vote.votes}/${data.vote.required}). Room continues.`,
          );
        }
      } else if (action === "KICK_NOW") {
        setActionMsg(`${target.displayName || "Member"} kicked from this room.`);
        setPeople((prev) => prev.filter((m) => m.userId !== targetId));
      }
      void refreshPeople();
    } catch {
      setActionMsg("Moderation action failed. Try again.");
    } finally {
      setActionBusyId(null);
    }
  };

  useEffect(() => {
    if (tab !== "people") return;
    let cancelled = false;
    void (async () => {
      if (!roomId) {
        if (!cancelled) {
          setPeople([]);
          setPeopleState("empty");
        }
        return;
      }
      if (!cancelled) setPeopleState("loading");
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
    ...(companionDock ? [{ id: "living-os" as const, label: "LIVING OS" }] : []),
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

  const actionBtn = (
    label: string,
    busy: boolean,
    onClick: () => void,
    color: string,
  ) => (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      style={{
        flexShrink: 0,
        fontSize: 7,
        fontWeight: 800,
        letterSpacing: "0.05em",
        padding: "3px 6px",
        borderRadius: 4,
        border: `1px solid ${color}73`,
        background: `${color}1f`,
        color,
        cursor: busy ? "wait" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {busy ? "…" : label}
    </button>
  );

  return (
    <aside
      data-hub-communications-rail="1"
      data-hub-communications-variant={variant}
      data-hub-communications-tab={tab}
      data-hub-role={role}
      data-room-moderation-wired="1"
      aria-label="Communications and community"
      style={shellStyle}
    >
      {identityHeader ? (
        <div
          data-hub-identity-header
          style={{
            flexShrink: 0,
            padding: "10px 10px 8px",
            borderBottom: `1px solid ${accentColor}33`,
            background: "rgba(4,6,14,0.98)",
          }}
        >
          {identityHeader}
        </div>
      ) : null}
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
        {tab === "living-os" && companionDock ? companionDock : null}

        <div style={{ flex: 1, minHeight: 420, padding: 8, display: tab === "messages" ? "block" : "none" }}>
            <MessagingCanister height={420} />
        </div>

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
              <>
                {actionMsg ? (
                  <p style={{ fontSize: 10, color: accentColor, margin: "0 0 8px" }}>{actionMsg}</p>
                ) : null}
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {people.map((m, i) => {
                    const isSelf = Boolean(m.userId) && m.userId === userId;
                    const isBot = m.role === "bot" || Boolean(m.userId?.startsWith("bot-"));
                    const canReport =
                      moderationControls.report === "AVAILABLE" &&
                      Boolean(m.userId) &&
                      !isSelf &&
                      !isBot;
                    const canVote =
                      moderationControls.voteToKick === "AVAILABLE" &&
                      Boolean(m.userId) &&
                      !isSelf &&
                      !isBot;
                    const canKick =
                      moderationControls.kickNow === "AVAILABLE" &&
                      Boolean(m.userId) &&
                      !isSelf &&
                      !isBot;
                    const busy = actionBusyId === m.userId;
                    const displayLabel = (m.displayName || "Member").split("|")[0];
                    return (
                      <li
                        key={m.userId || `${m.displayName}-${i}`}
                        data-hub-participant-card="1"
                        data-participant-kind={isBot ? "automated" : "human"}
                        style={{
                          fontSize: 11,
                          color: "#fff",
                          padding: "6px 8px",
                          borderRadius: 6,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700 }}>{displayLabel}</div>
                            <div style={{ fontSize: 9, color: accentColor, letterSpacing: "0.08em" }}>
                              {isBot ? "TMI HOST / AUTOMATED" : (m.role || "MEMBER").toUpperCase()}
                              {m.active === false ? " · IDLE" : ""}
                            </div>
                          </div>
                        </div>
                        {(canReport || canVote || canKick) && (
                          <div
                            data-hub-participant-actions="1"
                            style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
                          >
                            {canReport
                              ? actionBtn("REPORT", busy, () => void submitMemberReport(m), "#FF2DAA")
                              : null}
                            {canVote
                              ? actionBtn(
                                  "VOTE REMOVE",
                                  busy,
                                  () => void submitModerationAction(m, "VOTE_TO_KICK"),
                                  "#FFD700",
                                )
                              : null}
                            {canKick
                              ? actionBtn(
                                  "KICK NOW",
                                  busy,
                                  () => void submitModerationAction(m, "KICK_NOW"),
                                  "#FF6B35",
                                )
                              : null}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
