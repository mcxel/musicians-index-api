"use client";

/**
 * Performer HUD GUESTS tray — server-authoritative guest invites via
 * Claude's backstageClient → /api/live/backstage.
 *
 * Does NOT use in-memory GuestAdmissionAuthority for admission transitions.
 * Host never receives a backstage Whisper token (server isolation).
 * Opening/closing this tray must not remount the stage broadcast.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { backstageClient, type BackstageInviteView } from "@/lib/live/backstage/backstageClient";
import { resolveAdmissionPolicyForExperience } from "@/lib/live/GuestAdmissionAuthority";
import { emitEntranceCue } from "@/lib/live/EntranceCueAuthority";
import type { EliminationKind } from "@/lib/competition/InstantReEntryBackOfQueuePolicy";
import PerformerFreeRoamControls from "@/components/venue-hud/PerformerFreeRoamControls";
import PerformerGreenRoomThreeViewControls from "@/components/venue-hud/PerformerGreenRoomThreeViewControls";
import AdaptivePerformanceDirectorControls from "@/components/venue-hud/AdaptivePerformanceDirectorControls";
import {
  revalidateGreenRoomMembership,
  membershipHintFromCache,
  CACHE_ALONE_GRANTS_PRIVATE_BACKSTAGE,
} from "@/lib/live/DurableGreenRoomMembershipSession";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";

type FriendRow = { friendshipId: string; userId: string; name: string };

function tile(active: boolean, accent: string): React.CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minWidth: 56,
    padding: "8px 6px",
    borderRadius: 10,
    border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.12)",
    background: active ? `${accent}18` : "rgba(0,0,0,0.45)",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

export type ServerBackedGuestsTrayProps = {
  roomId: string;
  liveSessionId: string;
  performerId: string;
  experienceKind?: string | null;
  onStatus?: (line: string) => void;
  /** Competition elimination context for REJOIN QUEUE (optional). */
  eliminationContext?: {
    eliminationKind: EliminationKind | null;
    safetyBlocked?: boolean;
    misconductDisqualified?: boolean;
    eventDisqualified?: boolean;
    accountRestricted?: boolean;
    alreadyQueued?: boolean;
  };
  /** Server-confirmed challenger queue index when Claude durable queue is live. */
  serverQueuePosition?: number | null;
};

export default function ServerBackedGuestsTray(props: ServerBackedGuestsTrayProps) {
  const admission = resolveAdmissionPolicyForExperience(props.experienceKind);
  const [invites, setInvites] = useState<BackstageInviteView[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string>("");
  const [instantJoin, setInstantJoin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [durableBackstageMember, setDurableBackstageMember] = useState(false);
  const [backstageVideoConsent, setBackstageVideoConsent] = useState(false);
  const [queueMigrationNotApplied, setQueueMigrationNotApplied] = useState(false);
  const [serverCypherSeconds, setServerCypherSeconds] = useState<number | null>(null);
  const [serverCypherSource, setServerCypherSource] = useState<"SAVED" | "DEFAULT" | null>(null);
  const [membershipRevalidating, setMembershipRevalidating] = useState(false);
  const refresh = useCallback(async () => {
    if (!props.roomId) return;
    const res = await backstageClient.list(props.roomId);
    if (!res.ok) {
      setError(String(res.error));
      return;
    }
    setIsHost(res.isHost);
    setInvites(res.invites);
    setError(null);
  }, [props.roomId]);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 4000);
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/friends", { credentials: "include" });
        const data = (await res.json()) as { ok?: boolean; friends?: FriendRow[] };
        if (!cancelled && data.ok && Array.isArray(data.friends)) {
          setFriends(data.friends);
        }
      } catch {
        /* friends list optional for tray render */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Room-scoped cache: other rooms never grant this room. Cache alone never opens private mosaic.
    const hint = membershipHintFromCache(props.roomId, props.performerId);
    if (CACHE_ALONE_GRANTS_PRIVATE_BACKSTAGE === 0) {
      setDurableBackstageMember(false);
      if (hint.mayBeMember) setMembershipRevalidating(true);
    }
    const pull = async () => {
      setMembershipRevalidating(true);
      const snap = await revalidateGreenRoomMembership({
        roomId: props.roomId,
        userId: props.performerId,
        isHost,
      });
      if (cancelled) return;
      setQueueMigrationNotApplied(snap.migrationNotApplied);
      // Server authority only — cache never grants private mosaic alone.
      setDurableBackstageMember(snap.privateBackstageAllowed && snap.serverConfirmed);
      setBackstageVideoConsent(snap.cameraConsent);
      if (typeof snap.cypherTurnSeconds === "number") {
        setServerCypherSeconds(snap.cypherTurnSeconds);
        setServerCypherSource(snap.cypherTurnSource);
      } else {
        // Non-Cypher rooms (or migration) — null is authoritative, not "pending Claude".
        setServerCypherSeconds(null);
        setServerCypherSource(null);
      }
      setMembershipRevalidating(false);
    };
    void pull();
    const t = setInterval(() => void pull(), 4000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [props.roomId, props.performerId, isHost]);

  const pending = useMemo(
    () => invites.filter((i) => i.status === "pending" || i.status === "pending_instant"),
    [invites],
  );
  const backstage = useMemo(() => invites.filter((i) => i.status === "backstage"), [invites]);
  const onStage = useMemo(() => invites.filter((i) => i.status === "live"), [invites]);

  const friendLabel = (userId: string) =>
    friends.find((f) => f.userId === userId)?.name ?? userId.slice(0, 8);

  const run = async (label: string, fn: () => Promise<{ ok: boolean; error?: string } | unknown>) => {
    if (busy) return;
    setBusy(true);
    try {
      const r = (await fn()) as { ok: boolean; error?: string; entranceCue?: string; inviteId?: string };
      if (r && typeof r === "object" && "ok" in r && !r.ok) {
        props.onStatus?.(`${label} failed: ${r.error ?? "error"}`);
        setError(String(r.error ?? "error"));
      } else {
        if (r && typeof r === "object" && "entranceCue" in r && r.entranceCue === "REGULAR_GUEST") {
          emitEntranceCue({
            eventId: `guest-bring:${props.roomId}:${r.inviteId ?? Date.now()}`,
            kind: "REGULAR_GUEST",
            experienceKind: props.experienceKind,
          });
        }
        props.onStatus?.(label);
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="performer-guests-tray" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>
        Admission: <strong style={{ color: GOLD }}>{admission.mode}</strong>
        {admission.mode === "COMPETITION"
          ? " — server promotes next challenger (no host veto)"
          : " — host Bring In via server"}
        {" · "}
        {isHost ? "You are host" : "Guest/viewer view"}
      </div>

      <PerformerFreeRoamControls
        roomId={props.roomId}
        liveSessionId={props.liveSessionId}
        performerId={props.performerId}
        serverQueuePosition={props.serverQueuePosition}
        eliminationKind={props.eliminationContext?.eliminationKind ?? null}
        onStatus={props.onStatus}
      />

      {queueMigrationNotApplied ? (
        <div
          data-testid="green-room-migration-not-applied"
          style={{
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${FUCHSIA}`,
            background: `${FUCHSIA}18`,
            fontSize: 10,
            fontWeight: 800,
            color: FUCHSIA,
          }}
        >
          MIGRATION NOT APPLIED — durable Green Room membership unavailable
        </div>
      ) : null}

      {membershipRevalidating ? (
        <div
          data-testid="green-room-membership-revalidating"
          style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}
        >
          Revalidating durable membership… (cache alone cannot grant private backstage)
        </div>
      ) : null}

      <PerformerGreenRoomThreeViewControls
        authorizedBackstageMember={durableBackstageMember}
        backstageVideoConsent={backstageVideoConsent}
        onStatus={props.onStatus}
      />

      <AdaptivePerformanceDirectorControls
        roomId={props.roomId}
        liveSessionId={props.liveSessionId}
        performerId={props.performerId}
        experienceKind={props.experienceKind}
        nextPerformerReady
        serverCypherTurnSeconds={serverCypherSeconds}
        serverCypherTurnSource={serverCypherSource}
        isHost={isHost}
        onStatus={props.onStatus}
      />

      {error ? (
        <div data-testid="guests-tray-error" style={{ fontSize: 10, color: FUCHSIA }}>
          {error}
        </div>
      ) : null}

      {admission.mode === "REGULAR_LIVE" && isHost ? (
        <>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <select
              data-testid="guest-friend-select"
              value={selectedFriendId}
              onChange={(e) => setSelectedFriendId(e.target.value)}
              style={{
                flex: 1,
                minWidth: 140,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.45)",
                color: "#fff",
                padding: 8,
                fontSize: 12,
              }}
            >
              <option value="">Select friend…</option>
              {friends.map((f) => (
                <option key={f.userId} value={f.userId}>
                  {f.name}
                </option>
              ))}
            </select>
            <label style={{ fontSize: 9, alignItems: "center", gap: 4, display: "flex" }}>
              <input
                data-testid="guest-instant-join"
                type="checkbox"
                checked={instantJoin}
                onChange={(e) => setInstantJoin(e.target.checked)}
              />
              Instant Join
            </label>
            <button
              type="button"
              data-testid="guest-invite"
              disabled={!selectedFriendId || busy}
              onClick={() =>
                void run(`Invited ${friendLabel(selectedFriendId)}`, () =>
                  backstageClient.invite(props.roomId, selectedFriendId, instantJoin),
                )
              }
              style={tile(false, CYAN)}
            >
              <span style={{ fontSize: 18 }}>✉️</span>
              <span style={{ fontSize: 9, fontWeight: 700 }}>Invite DM</span>
            </button>
            <button
              type="button"
              data-testid="guest-message"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("tmi:open-workspace", {
                    detail: { workspaceId: "messaging", surface: "DRAWER" },
                  }),
                );
                props.onStatus?.("Opening MessagingCanister");
              }}
              style={tile(false, FUCHSIA)}
            >
              <span style={{ fontSize: 18 }}>💬</span>
              <span style={{ fontSize: 9, fontWeight: 700 }}>Message</span>
            </button>
          </div>
          {friends.length === 0 ? (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
              No accepted friends yet — add friends to send real DM invites.
            </div>
          ) : null}
        </>
      ) : null}

      <Section title={`PENDING (${pending.length})`} color={GOLD}>
        {pending.map((g) => (
          <InviteCard
            key={g.inviteId}
            invite={g}
            label={friendLabel(g.guestUserId)}
            hostActions={
              isHost && admission.mode === "REGULAR_LIVE" ? (
                <button
                  type="button"
                  data-testid={`guest-cancel-${g.inviteId}`}
                  onClick={() => void run("Invite cancelled", () => backstageClient.cancel(g.inviteId))}
                  style={{ ...tile(false, FUCHSIA), minWidth: 40, padding: 4 }}
                >
                  Cancel
                </button>
              ) : null
            }
          />
        ))}
      </Section>

      <Section title={`BACKSTAGE (${backstage.length})`} color={CYAN}>
        {backstage.map((g) => (
          <InviteCard
            key={g.inviteId}
            invite={g}
            label={friendLabel(g.guestUserId)}
            hostActions={
              isHost && admission.mode === "REGULAR_LIVE" ? (
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    data-testid={`guest-bring-in-${g.inviteId}`}
                    disabled={onStage.length >= 3 || busy}
                    onClick={() =>
                      void run(`Brought in ${friendLabel(g.guestUserId)}`, () =>
                        backstageClient.bringIn(g.inviteId),
                      )
                    }
                    style={{ ...tile(false, CYAN), minWidth: 40, padding: 4 }}
                  >
                    In
                  </button>
                  <button
                    type="button"
                    data-testid={`guest-remove-${g.inviteId}`}
                    onClick={() => void run("Removed", () => backstageClient.remove(g.inviteId))}
                    style={{ ...tile(false, FUCHSIA), minWidth: 40, padding: 4 }}
                  >
                    ✕
                  </button>
                </div>
              ) : admission.mode === "COMPETITION" ? (
                <span style={{ fontSize: 8, color: GOLD }}>Auto-queue · no host veto</span>
              ) : null
            }
          />
        ))}
        {backstage.length === 0 ? (
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
            No backstage guests — invite friends; Green Room video mounts on guest devices after accept
          </span>
        ) : null}
      </Section>

      <Section title={`ON STAGE (${onStage.length}/3)`} color={FUCHSIA}>
        {onStage.map((g) => (
          <InviteCard
            key={g.inviteId}
            invite={g}
            label={friendLabel(g.guestUserId)}
            hostActions={
              isHost && admission.mode === "REGULAR_LIVE" ? (
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    data-testid={`guest-return-bs-${g.inviteId}`}
                    onClick={() =>
                      void run("Returned backstage", () => backstageClient.returnBackstage(g.inviteId))
                    }
                    style={{ ...tile(false, GOLD), minWidth: 40, padding: 4 }}
                  >
                    BS
                  </button>
                  <button
                    type="button"
                    data-testid={`guest-kick-${g.inviteId}`}
                    onClick={() => void run("Removed", () => backstageClient.remove(g.inviteId))}
                    style={{ ...tile(false, FUCHSIA), minWidth: 40, padding: 4 }}
                  >
                    ✕
                  </button>
                </div>
              ) : null
            }
          />
        ))}
      </Section>

      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
        Server admits · max 3 stage guests · Whisper isolated (host/audience never get backstage token) ·
        MIX PERSONAL levels only · stage broadcast preserved when tray opens/closes
      </div>
    </div>
  );
}

function Section(props: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: props.color }}>{props.title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{props.children}</div>
    </div>
  );
}

function InviteCard(props: {
  invite: BackstageInviteView;
  label: string;
  hostActions: React.ReactNode;
}) {
  return (
    <div
      data-testid={`server-guest-${props.invite.status}-${props.invite.guestUserId}`}
      style={{
        ...tile(false, GOLD),
        minWidth: 88,
        alignItems: "stretch",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700 }}>{props.label}</span>
      <span style={{ fontSize: 8, opacity: 0.7 }}>{props.invite.status}</span>
      {props.hostActions}
    </div>
  );
}
