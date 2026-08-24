"use client";
/**
 * MiniEventCreator — Rule 21 (AGENTS.md)
 * One-click panel for creating Mini events. Qualified users hit one button
 * and land in a live room immediately — no intermediate setup screens.
 *
 * Supported Mini event types:
 *   battle | cypher | challenge | concert | release-party | lounge | dance-party
 *
 * Each type maps to the appropriate API, gets a joinUrl back, and routes
 * through LobbyEntryFlow (Rule 15) or directly to the live room.
 *
 * Rule 21: "the moment a qualified user creates a Mini event, the Event
 * Runtime registers it with the correct live discovery surface immediately."
 */
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { WorldMiniBadge } from "./WorldMiniBadge";
import {
  extractRoomIdFromJoinUrl,
  presentMiniEventInPlace,
} from "@/lib/dock/presentInstantGoLiveInPlace";
import {
  isOutdoorSelectable,
  normalizeEventVenueKind,
  type VenueEnvironmentKind,
} from "@/lib/venues/EventVenueEnvironment";

export type MiniEventType =
  | "battle"
  | "cypher"
  | "challenge"
  | "concert"
  | "release-party"
  | "lounge"
  | "dance-party"
  | "slow-jam"
  | "joke-off"
  | "dance-off"
  | "dirty-dozens"
  | "producer-battle"
  | "dj-battle";

const MINI_EXPERIENCE: Partial<Record<MiniEventType, string>> = {
  battle: "battle",
  "joke-off": "battle",
  "dance-off": "battle",
  "dirty-dozens": "battle",
  "producer-battle": "battle",
  "dj-battle": "battle",
  cypher: "cypher",
  challenge: "challenge",
  concert: "concert",
  "release-party": "release-party",
  lounge: "lounge",
  "dance-party": "dance-party",
  "slow-jam": "lounge",
};

interface MiniEventDef {
  type: MiniEventType;
  emoji: string;
  label: string;
  accent: string;
  description: string;
  /** Which API endpoint to POST to */
  endpoint: string;
  /** Build the POST body */
  buildBody: (
    displayName: string,
    genre?: string,
    venueEnvironment?: VenueEnvironmentKind,
  ) => object;
  /** Extract the joinUrl from the API response */
  extractJoinUrl: (res: Record<string, unknown>) => string;
}

const MINI_EVENTS: MiniEventDef[] = [
  {
    type: "battle",
    emoji: "⚔️",
    label: "Mini Battle",
    accent: "#FF2DAA",
    description: "Open performer challenge",
    endpoint: "/api/battles/mini",
    buildBody: (name, genre) => ({
      format: "open-performer-challenge",
      genreName: genre ?? "Hip-Hop",
      title: `${name}'s Mini Battle`,
    }),
    extractJoinUrl: (r) => (r.joinUrl as string) ?? "/rooms/battle-arena",
  },
  {
    type: "joke-off",
    emoji: "😂",
    label: "Mini Joke-Off",
    accent: "#FF6B35",
    description: "Comedy battle — real votes, real winner",
    endpoint: "/api/battles/mini",
    buildBody: (name, genre) => ({
      format: "joke-off",
      genreName: genre ?? "Comedy",
      title: `${name}'s Mini Joke-Off`,
    }),
    extractJoinUrl: (r) => (r.joinUrl as string) ?? "/games/joke-offs",
  },
  {
    type: "dance-off",
    emoji: "💃",
    label: "Mini Dance-Off",
    accent: "#AA2DFF",
    description: "Dance battle — real votes, real winner",
    endpoint: "/api/battles/mini",
    buildBody: (name, genre) => ({
      format: "dance-off",
      genreName: genre ?? "Dance",
      title: `${name}'s Mini Dance-Off`,
    }),
    extractJoinUrl: (r) => (r.joinUrl as string) ?? "/games/dance-offs",
  },
  {
    type: "dirty-dozens",
    emoji: "🔥",
    label: "Mini Dirty Dozens",
    accent: "#AA2DFF",
    description: "Roast battle — real votes, real winner",
    endpoint: "/api/battles/mini",
    buildBody: (name, genre) => ({
      format: "dirty-dozens",
      genreName: genre ?? "Hip-Hop",
      title: `${name}'s Mini Dirty Dozens`,
    }),
    extractJoinUrl: (r) => (r.joinUrl as string) ?? "/games/dirty-dozens",
  },
  {
    type: "producer-battle",
    emoji: "🎛️",
    label: "Mini Producer Battle",
    accent: "#C0A0FF",
    description: "Producer vs producer — real votes, real winner",
    endpoint: "/api/battles/mini",
    buildBody: (name, genre) => ({
      format: "producer-vs-producer",
      genreName: genre ?? "Hip-Hop",
      title: `${name}'s Producer Battle`,
    }),
    extractJoinUrl: (r) => (r.joinUrl as string) ?? "/battles/create",
  },
  {
    type: "dj-battle",
    emoji: "🎧",
    label: "Mini DJ Battle",
    accent: "#00FFFF",
    description: "DJ vs DJ — real votes, real winner",
    endpoint: "/api/battles/mini",
    buildBody: (name, genre) => ({
      format: "dj-vs-dj",
      genreName: genre ?? "EDM",
      title: `${name}'s DJ Battle`,
    }),
    extractJoinUrl: (r) => (r.joinUrl as string) ?? "/battles/create",
  },
  {
    type: "cypher",
    emoji: "🎤",
    label: "Mini Cypher",
    accent: "#AA2DFF",
    description: "Open freestyle cypher",
    endpoint: "/api/live/go",
    buildBody: (name, genre, venueEnvironment) => ({
      displayName: name,
      category: "cypher",
      genreName: genre ?? "Hip-Hop",
      title: `${name}'s Mini Cypher`,
      isMini: true,
      venueEnvironment: venueEnvironment ?? "indoor",
    }),
    extractJoinUrl: (r) =>
      r.roomId
        ? `/live/rooms/${r.roomId}?mode=performer&category=cypher&auto=true&venueEnv=${encodeURIComponent(String((r as { venueEnvironment?: string }).venueEnvironment ?? "indoor"))}${typeof (r as { venueSkinId?: string }).venueSkinId === "string" && (r as { venueSkinId?: string }).venueSkinId ? `&venueSkin=${encodeURIComponent(String((r as { venueSkinId?: string }).venueSkinId))}` : ""}`
        : "/rooms/cypher-arena",
  },
  {
    type: "challenge",
    emoji: "🏆",
    label: "Mini Challenge",
    accent: "#FFD700",
    description: "Issue a direct challenge",
    endpoint: "/api/live/go",
    buildBody: (name, genre, venueEnvironment) => ({
      displayName: name,
      category: "challenge",
      genreName: genre ?? "Hip-Hop",
      title: `${name}'s Challenge`,
      isMini: true,
      venueEnvironment: venueEnvironment ?? "outdoor",
    }),
    extractJoinUrl: (r) =>
      r.roomId
        ? `/live/rooms/${r.roomId}?mode=performer&category=challenge&auto=true&venueEnv=${encodeURIComponent(String((r as { venueEnvironment?: string }).venueEnvironment ?? "outdoor"))}${typeof (r as { venueSkinId?: string }).venueSkinId === "string" && (r as { venueSkinId?: string }).venueSkinId ? `&venueSkin=${encodeURIComponent(String((r as { venueSkinId?: string }).venueSkinId))}` : ""}`
        : "/rooms/challenge-arena",
  },
  {
    type: "concert",
    emoji: "🎸",
    label: "Mini Concert",
    accent: "#00FFFF",
    description: "Live performance, instant",
    endpoint: "/api/live/go",
    buildBody: (name, genre, venueEnvironment) => ({
      displayName: name,
      category: "concert",
      genreName: genre ?? "General",
      title: `${name}'s Mini Concert`,
      isMini: true,
      venueEnvironment: venueEnvironment ?? "indoor",
    }),
    extractJoinUrl: (r) =>
      r.roomId
        ? `/live/rooms/${r.roomId}?mode=performer&category=concert&auto=true&venueEnv=${encodeURIComponent(String((r as { venueEnvironment?: string }).venueEnvironment ?? "indoor"))}${typeof (r as { venueSkinId?: string }).venueSkinId === "string" && (r as { venueSkinId?: string }).venueSkinId ? `&venueSkin=${encodeURIComponent(String((r as { venueSkinId?: string }).venueSkinId))}` : ""}`
        : "/rooms/world-concert",
  },
  {
    type: "release-party",
    emoji: "🚀",
    label: "Mini Release",
    accent: "#FF8C00",
    description: "Drop a new release live",
    endpoint: "/api/live/go",
    buildBody: (name, genre, venueEnvironment) => ({
      displayName: name,
      category: "release-party",
      genreName: genre ?? "General",
      title: `${name}'s Release Party`,
      isMini: true,
      venueEnvironment: venueEnvironment ?? "indoor",
    }),
    extractJoinUrl: (r) =>
      r.roomId
        ? `/live/rooms/${r.roomId}?mode=performer&category=release-party&auto=true&venueEnv=${encodeURIComponent(String((r as { venueEnvironment?: string }).venueEnvironment ?? "indoor"))}${typeof (r as { venueSkinId?: string }).venueSkinId === "string" && (r as { venueSkinId?: string }).venueSkinId ? `&venueSkin=${encodeURIComponent(String((r as { venueSkinId?: string }).venueSkinId))}` : ""}`
        : "/rooms/new-release",
  },
  {
    type: "lounge",
    emoji: "🛋️",
    label: "Mini Lounge",
    accent: "#c4b5fd",
    description: "Chill room, open to fans",
    endpoint: "/api/live/go",
    buildBody: (name) => ({
      displayName: name,
      category: "lounge",
      title: `${name}'s Lounge`,
      isMini: true,
    }),
    extractJoinUrl: (r) =>
      r.roomId
        ? `/live/rooms/${r.roomId}?mode=performer&category=lounge&auto=true`
        : "/rooms/vip-lounge",
  },
  {
    type: "dance-party",
    emoji: "🕺",
    label: "Mini Dance Party",
    accent: "#00FF88",
    description: "Fan dance floor, you DJ",
    endpoint: "/api/live/go",
    buildBody: (name, genre, venueEnvironment) => ({
      displayName: name,
      category: "dance-party",
      genreName: genre ?? "EDM",
      title: `${name}'s Dance Party`,
      isMini: true,
      venueEnvironment: venueEnvironment ?? "outdoor",
    }),
    extractJoinUrl: (r) =>
      r.roomId
        ? `/live/rooms/${r.roomId}?mode=performer&category=dance-party&auto=true&venueEnv=${encodeURIComponent(String((r as { venueEnvironment?: string }).venueEnvironment ?? "outdoor"))}${typeof (r as { venueSkinId?: string }).venueSkinId === "string" && (r as { venueSkinId?: string }).venueSkinId ? `&venueSkin=${encodeURIComponent(String((r as { venueSkinId?: string }).venueSkinId))}` : ""}`
        : "/rooms/world-dance-party",
  },
  {
    type: "slow-jam",
    emoji: "🌙",
    label: "Mini Slow Jam",
    accent: "#AA2DFF",
    description: "Chill listening lounge",
    endpoint: "/api/live/go",
    buildBody: (name, genre, venueEnvironment) => ({
      displayName: name,
      category: "listening",
      genreName: genre ?? "R&B",
      title: `${name}'s Slow Jam Lounge`,
      isMini: true,
      venueEnvironment: venueEnvironment ?? "outdoor",
    }),
    extractJoinUrl: (r) =>
      r.roomId
        ? `/live/rooms/${r.roomId}?mode=performer&category=listening&auto=true&venueEnv=${encodeURIComponent(String((r as { venueEnvironment?: string }).venueEnvironment ?? "outdoor"))}${typeof (r as { venueSkinId?: string }).venueSkinId === "string" && (r as { venueSkinId?: string }).venueSkinId ? `&venueSkin=${encodeURIComponent(String((r as { venueSkinId?: string }).venueSkinId))}` : ""}`
        : "/rooms/slow-jams",
  },
];

interface MiniEventCreatorProps {
  /** Creator's display name (for room title) */
  displayName?: string;
  /** Optional genre pre-select */
  genre?: string;
  /** Which event types to show. Defaults to all 7. */
  show?: MiniEventType[];
  /** Layout: "grid" (default) | "list" | "compact" */
  layout?: "grid" | "list" | "compact";
  /** Called after successful creation with the joinUrl */
  onCreated?: (type: MiniEventType, joinUrl: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

type CreatingState = { type: MiniEventType } | null;
type ErrorState = { type: MiniEventType; message: string } | null;

export function MiniEventCreator({
  displayName = "Artist",
  genre,
  show,
  layout = "grid",
  onCreated,
  className,
  style,
}: MiniEventCreatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [creating, setCreating] = useState<CreatingState>(null);
  const [error, setError] = useState<ErrorState>(null);
  const [venueEnvironment, setVenueEnvironment] = useState<VenueEnvironmentKind>("indoor");

  const events = show
    ? MINI_EVENTS.filter((e) => show.includes(e.type))
    : MINI_EVENTS;

  function kindForMini(type: MiniEventType) {
    if (type === "dance-party") return "mini-dance-party" as const;
    if (type === "slow-jam") return "mini-slow-jam" as const;
    if (type === "lounge") return "lounge" as const;
    if (type === "dirty-dozens") return "dirty-dozens" as const;
    return (
      normalizeEventVenueKind(type) ??
      (type === "release-party" ? ("mini-release" as const) : ("battle" as const))
    );
  }

  async function handleCreate(def: MiniEventDef) {
    if (creating) return;
    setCreating({ type: def.type });
    setError(null);

    const kind = kindForMini(def.type);
    const outdoorOk = isOutdoorSelectable(kind);
    const env: VenueEnvironmentKind = outdoorOk ? venueEnvironment : "indoor";

    try {
      const res = await fetch(def.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(def.buildBody(displayName, genre, env)),
      });

      const data = (await res.json()) as Record<string, unknown>;

      if (!res.ok) {
        const msg =
          (data?.error as string) === "tier_gate"
            ? `Requires ${(data as Record<string, unknown>)?.requiredTier ?? "higher"} tier`
            : (data?.error as string) ?? "Creation failed";
        setError({ type: def.type, message: msg });
        return;
      }

      const joinUrl = def.extractJoinUrl({
        ...data,
        venueEnvironment: (data.venueEnvironment as string | undefined) ?? env,
        venueSkinId: (data.venueSkinId as string | undefined) ?? (data.session as { venueSkinId?: string } | undefined)?.venueSkinId,
      });
      const roomId =
        typeof data.roomId === "string"
          ? data.roomId
          : extractRoomIdFromJoinUrl(joinUrl) ?? undefined;
      const experience = MINI_EXPERIENCE[def.type] ?? "live";

      onCreated?.(def.type, joinUrl);

      if (roomId) {
        const inPlace = await presentMiniEventInPlace({
          joinUrl,
          preferredExperience: experience,
          roomId,
          publishSession: true,
        });
        if (!inPlace.ok && inPlace.error) {
          setError({ type: def.type, message: inPlace.error });
        }
        return;
      }

      router.push(joinUrl);
    } catch {
      setError({ type: def.type, message: "Network error — try again" });
    } finally {
      setCreating(null);
    }
  }

  const isCompact = layout === "compact";
  const isList = layout === "list";
  const showVenueToggle = events.some((e) => isOutdoorSelectable(kindForMini(e.type)));

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingBottom: 2,
        }}
      >
        <WorldMiniBadge authority="mini" size="xs" />
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Create Instant Event
        </span>
      </div>

      {showVenueToggle ? (
        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          {(["indoor", "outdoor"] as const).map((env) => (
            <button
              key={env}
              type="button"
              onClick={() => setVenueEnvironment(env)}
              style={{
                flex: 1,
                padding: "6px 8px",
                borderRadius: 6,
                border:
                  venueEnvironment === env
                    ? "1px solid rgba(0,255,255,0.55)"
                    : "1px solid rgba(255,255,255,0.12)",
                background:
                  venueEnvironment === env ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.04)",
                color: venueEnvironment === env ? "#00FFFF" : "rgba(255,255,255,0.55)",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {env === "indoor" ? "🏠 Indoor" : "🌳 Outdoor"}
            </button>
          ))}
        </div>
      ) : null}

      {/* Button grid/list */}
      <div
        style={
          isList
            ? { display: "flex", flexDirection: "column", gap: 6 }
            : {
                display: "grid",
                gridTemplateColumns: isCompact
                  ? "repeat(auto-fill, minmax(80px, 1fr))"
                  : "repeat(auto-fill, minmax(130px, 1fr))",
                gap: isCompact ? 6 : 8,
              }
        }
      >
        {events.map((def) => {
          const isLoading = creating?.type === def.type;
          const hasError = error?.type === def.type;

          return (
            <button
              key={def.type}
              onClick={() => handleCreate(def)}
              disabled={!!creating}
              style={{
                display: "flex",
                flexDirection: isList || isCompact ? "row" : "column",
                alignItems: "center",
                gap: isCompact ? 6 : isList ? 10 : 6,
                padding: isCompact ? "6px 10px" : isList ? "10px 14px" : "10px 8px",
                background: hasError
                  ? "rgba(255,60,60,0.1)"
                  : isLoading
                  ? `rgba(${hexToRgb(def.accent)},0.2)`
                  : `rgba(${hexToRgb(def.accent)},0.08)`,
                border: `1px solid ${hasError ? "#FF4444" : def.accent}${isLoading ? "88" : "33"}`,
                borderRadius: 10,
                cursor: creating ? "wait" : "pointer",
                opacity: creating && !isLoading ? 0.5 : 1,
                transition: "all 0.15s",
                textAlign: isList ? "left" : "center",
                width: "100%",
              }}
            >
              <span style={{ fontSize: isCompact ? 16 : 22, lineHeight: 1 }}>
                {isLoading ? "⏳" : hasError ? "⚠️" : def.emoji}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span
                  style={{
                    fontSize: isCompact ? 10 : 11,
                    fontWeight: 900,
                    color: hasError ? "#FF8888" : def.accent,
                    letterSpacing: "0.04em",
                  }}
                >
                  {isLoading ? "Creating…" : def.label}
                </span>
                {!isCompact && (
                  <span
                    style={{
                      fontSize: 9,
                      color: hasError ? "#FF8888" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {hasError ? error!.message : def.description}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Global error (non-type-specific) */}
      {error && !creating && (
        <div
          style={{
            fontSize: 10,
            color: "#FF8888",
            padding: "6px 10px",
            background: "rgba(255,60,60,0.08)",
            borderRadius: 6,
            border: "1px solid rgba(255,60,60,0.2)",
          }}
        >
          {error.message} —{" "}
          <button
            onClick={() => setError(null)}
            style={{ background: "none", border: "none", color: "#FF8888", cursor: "pointer", padding: 0, fontWeight: 700 }}
          >
            dismiss
          </button>
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r},${g},${b}`;
}
