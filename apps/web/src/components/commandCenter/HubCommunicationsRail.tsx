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
import Link from "next/link";
import HappyDaysPromptCard from "@/components/happydays/HappyDaysPromptCard";
import InviteRewardPanel from "@/components/referral/InviteRewardPanel";
import ProfileQuickPanel from "@/components/profile/ProfileQuickPanel";
import MessagingCanister from "@/components/canisters/MessagingCanister";
import RoomChatPanel from "@/components/messaging/RoomChatPanel";
import CommunityFeedPanel from "@/components/messaging/CommunityFeedPanel";

import BroadcastAnnouncementTicker from "@/components/broadcast/BroadcastAnnouncementTicker";
import {
  resolveRoomModerationControls,
  type RoomModerationRoomClass,
} from "@/lib/moderation/RoomModerationCapabilityMap";
import type { RoomParticipantKind } from "@/lib/moderation/RoomModerationAuthority";
import { gpsDestinationById, gpsDestinationState } from "@/lib/commandCenter/gpsReleaseAllowlist";

export type HubCommunicationsTab = "messages" | "room" | "community" | "people" | "living-os";

function ReleaseHeldNote({ id }: { id: "messages" | "community" }) {
  const item = gpsDestinationById(id);
  return (
    <div data-testid={`hub-comms-${id}-soon`} style={{ padding: 16, fontSize: 12, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>
      <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.12em", color: "#fff" }}>COMING SOON</div>
      <p style={{ margin: "8px 0 0" }}>{item?.building ?? "This is not active yet."}</p>
    </div>
  );
}

type Member = {
  userId?: string;
  displayName?: string;
  role?: string;
  active?: boolean;
};

type PublicPerson = { id: string; name: string; role: string };

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


function resolveCanonicalPublicProfilePath(userId: string): string {
  if (!userId) return "/p/member";
  return `/p/${userId.startsWith("usr_") ? userId : `usr_${userId.slice(0, 8)}`}`;
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
  const [friends, setFriends] = useState<PublicPerson[]>([]);
  const [friendsLoad, setFriendsLoad] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const [peopleQuery, setPeopleQuery] = useState("");
  const [peopleResults, setPeopleResults] = useState<PublicPerson[]>([]);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [contextChip, setContextChip] = useState<"happydays" | "friends" | "profile">("happydays");
  const [profileQuickPanelOpen, setProfileQuickPanelOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== "people") return;
    // Held friends do not query the accepted-list authority.
    if (gpsDestinationState("friends") !== "LIVE") {
      setFriends([]);
      setFriendsLoad("ready");
      return;
    }
    const controller = new AbortController();
    setFriendsLoad("loading");
    void fetch("/api/users/search?scope=friends", { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return { ok: false as const, users: [] as PublicPerson[] };
        const data = await response.json() as { users?: PublicPerson[] };
        return { ok: true as const, users: data.users ?? [] };
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setFriends(data.ok ? data.users : []);
        setFriendsLoad(data.ok ? "ready" : "unavailable");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setFriends([]);
        setFriendsLoad("unavailable");
      });
    return () => controller.abort();
  }, [tab]);

  useEffect(() => {
    if (tab !== "people" || peopleQuery.trim().length < 2) {
      setPeopleResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch(`/api/users/search?q=${encodeURIComponent(peopleQuery.trim())}`, {
        credentials: "include", signal: controller.signal,
      }).then((response) => response.ok ? response.json() as Promise<{ users?: PublicPerson[] }> : null)
        .then((data) => { if (!controller.signal.aborted) setPeopleResults(data?.users ?? []); })
        .catch(() => { if (!controller.signal.aborted) setPeopleResults([]); });
    }, 280);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [tab, peopleQuery]);

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
    { id: "messages", label: "CHAT" },
    { id: "room", label: "ROOM" },
    { id: "people", label: "PEOPLE" },
    { id: "community", label: "COMMUNITY" },
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
        data-hub-broadcast-announcement-ticker="1"
        style={{
          flexShrink: 0,
          padding: "8px 8px 6px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <BroadcastAnnouncementTicker />
      </div>
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

        {tab === "messages" ? (
          <div style={{ flex: 1, minHeight: 420, padding: 8 }}>
            {gpsDestinationState("messages") === "LIVE" ? (
              <MessagingCanister height={420} />
            ) : (
              <ReleaseHeldNote id="messages" />
            )}
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
            {gpsDestinationState("community") === "LIVE" ? (
              <CommunityFeedPanel />
            ) : (
              <ReleaseHeldNote id="community" />
            )}
          </div>
        ) : null}

        {tab === "people" ? (
          <div data-hub-comms-people="1" style={{ padding: 12, overflowY: "auto" }}>
            <label htmlFor="hub-people-search" style={{ fontSize: 10, color: accentColor }}>FIND PEOPLE</label>
            <input id="hub-people-search" type="search" value={peopleQuery} onChange={(event) => setPeopleQuery(event.target.value)}
              placeholder="Search public names" style={{ width: "100%", margin: "6px 0 12px", padding: 8, color: "#fff", background: "#101625", border: "1px solid #42516b", borderRadius: 4, boxSizing: "border-box" }} />
            {peopleQuery.trim().length >= 2 ? (
              <div data-hub-people-results="1">
                {peopleResults.length === 0 ? <p style={{ fontSize: 11 }}>No public people found.</p> : peopleResults.map((person) => (
                  <Link key={person.id} href={`/p/${encodeURIComponent(person.id)}`} style={{ display: "block", padding: "6px 0", color: "#fff" }}>{person.name} · {person.role}</Link>
                ))}
              </div>
            ) : (
              <div data-hub-people-friends="1">
                <div style={{ fontSize: 10, color: accentColor }}>FRIENDS</div>
                {gpsDestinationState("friends") !== "LIVE" ? (
                  <p data-testid="hub-friends-soon" style={{ fontSize: 11 }}>{gpsDestinationById("friends")?.building ?? "We're building the accepted friends list and friend requests."}</p>
                ) : friendsLoad === "unavailable" ? (
                  <p data-testid="hub-friends-unavailable" style={{ fontSize: 11 }}>Unable to load accepted friends.</p>
                ) : friendsLoad !== "ready" ? (
                  <p style={{ fontSize: 11 }}>Loading accepted friends…</p>
                ) : friends.length === 0 ? (
                  <p style={{ fontSize: 11 }}>No accepted friends yet.</p>
                ) : friends.map((friend) => (
                  <Link key={friend.id} href={`/p/${encodeURIComponent(friend.id)}`} style={{ display: "block", padding: "6px 0", color: "#fff" }}>{friend.name}</Link>
                ))}
              </div>
            )}
            {roomId ? <div style={{ fontSize: 10, color: accentColor, marginTop: 16 }}>IN THIS ROOM</div> : null}
            {!roomId ? (
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                {gpsDestinationState("friends") === "LIVE"
                  ? "No current room participants. Friends and public people remain available above."
                  : "No current room participants."}
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
    
      {/* ── Canonical Right Context Workspace ── */}
      <div
        data-hub-context-workspace="1"
        style={{
          flexShrink: 0,
          borderTop: `1px solid ${accentColor}33`,
          background: "rgba(6,3,15,0.95)",
          display: "flex",
          flexDirection: "column",
          padding: "10px 8px 14px",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2px",
          }}
        >
          <span
            style={{
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase",
            }}
          >
            COMMUNITY & IDENTITY
          </span>
          <div style={{ display: "flex", gap: 3 }}>
            {[
              { id: "happydays", label: "☀️ MOMENT" },
              { id: "friends", label: "🎁 INVITE" },
              { id: "profile", label: "👤 PROFILE" },
            ].map((chip) => {
              const active = contextChip === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  data-hub-context-chip={chip.id}
                  onClick={() => setContextChip(chip.id as typeof contextChip)}
                  style={{
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: "0.06em",
                    padding: "3px 6px",
                    borderRadius: 4,
                    border: active ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.12)",
                    background: active ? `${accentColor}25` : "rgba(255,255,255,0.04)",
                    color: active ? accentColor : "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s ease",
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ minHeight: 0 }}>
          {contextChip === "happydays" && (
            <div data-hub-context-slot="happydays">
              <HappyDaysPromptCard
                userId={userId}
                displayName={displayName}
                userRole={role}
              />
            </div>
          )}

          {contextChip === "friends" && (
            <div data-hub-context-slot="friends">
              <InviteRewardPanel userId={userId} />
            </div>
          )}

          {contextChip === "profile" && (
            <div
              data-hub-context-slot="profile"
              style={{
                borderRadius: 12,
                border: "1px solid rgba(0,255,255,0.25)",
                background: "linear-gradient(135deg, rgba(8,12,28,0.9), rgba(4,6,16,0.95))",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{displayName}</div>
                  <div style={{ fontSize: 8, color: accentColor, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {role.toUpperCase()} PROFILE
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="tmi-hub-quick-profile-launcher"
                  onClick={() => setProfileQuickPanelOpen(true)}
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: "rgba(0,255,255,0.12)",
                    border: "1px solid rgba(0,255,255,0.4)",
                    color: "#00FFFF",
                    cursor: "pointer",
                  }}
                >
                  QUICK MENU ↗
                </button>
              </div>

              {/* Marcel P0: In-Hub EDIT PUBLIC PROFILE action -> lands directly in owner ProfileCustomizer (?edit=1) */}
              <Link
                href={`${resolveCanonicalPublicProfilePath(userId)}?edit=1`}
                data-testid="tmi-hub-edit-public-profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  textDecoration: "none",
                  boxShadow: "0 0 16px rgba(255,45,170,0.3)",
                  transition: "all 0.15s ease",
                }}
              >
                <span>✏️</span>
                <span>EDIT PUBLIC PROFILE</span>
              </Link>

              <div style={{ display: "flex", gap: 6 }}>
                <Link
                  href={resolveCanonicalPublicProfilePath(userId)}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 8,
                    fontWeight: 800,
                    padding: "5px 6px",
                    borderRadius: 5,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.75)",
                    textDecoration: "none",
                  }}
                >
                  VIEW PUBLIC PAGE
                </Link>
                <Link
                  href="/account"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 8,
                    fontWeight: 800,
                    padding: "5px 6px",
                    borderRadius: 5,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.75)",
                    textDecoration: "none",
                  }}
                >
                  ACCOUNT SETTINGS
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canonical Profile Quick Panel reconciliation */}
      <ProfileQuickPanel
        fanId={userId}
        open={profileQuickPanelOpen}
        onClose={() => setProfileQuickPanelOpen(false)}
        role={role}
      />
    </aside>
  );
}
