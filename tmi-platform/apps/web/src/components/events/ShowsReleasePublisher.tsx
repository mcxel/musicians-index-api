"use client";

/**
 * ShowsReleasePublisher — performer Event & Release publisher (request, not mint tickets).
 * Mini kinds can launch now; Live Online Concert / World Release require schedule.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { WorldMiniBadge } from "@/components/live/WorldMiniBadge";
import type {
  ShowsReleaseKind,
  ShowsReleasePublicCard,
} from "@/lib/events/ScheduledEventRegistry";

const KINDS: { kind: ShowsReleaseKind; label: string; hint: string }[] = [
  { kind: "MINI_CONCERT", label: "Mini Concert", hint: "Instant launch now" },
  { kind: "LIVE_ONLINE_CONCERT", label: "Live Online Concert", hint: "Scheduled broadcast" },
  { kind: "MINI_RELEASE", label: "Mini Release", hint: "Instant premiere" },
  { kind: "WORLD_RELEASE", label: "World Release", hint: "Scheduled album/single premiere" },
];

export default function ShowsReleasePublisher({
  performerSlug,
}: {
  performerSlug?: string;
}) {
  const [mine, setMine] = useState<ShowsReleasePublicCard[]>([]);
  const [kind, setKind] = useState<ShowsReleaseKind>("LIVE_ONLINE_CONCERT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [artworkUrl, setArtworkUrl] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [scheduledLocal, setScheduledLocal] = useState("");
  const [venueTheme, setVenueTheme] = useState("");
  const [ticketRequested, setTicketRequested] = useState(false);
  const [requestedPriceUsd, setRequestedPriceUsd] = useState(10);
  const [replayAllowed, setReplayAllowed] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const res = await fetch("/api/events/shows-releases?mine=1", {
      credentials: "include",
      cache: "no-store",
    });
    const data = (await res.json()) as { events?: ShowsReleasePublicCard[] };
    setMine(Array.isArray(data.events) ? data.events : []);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const publish = async (asDraft: boolean) => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const isMini = kind === "MINI_CONCERT" || kind === "MINI_RELEASE";
      let scheduledStartIso: string | undefined;
      if (scheduledLocal) {
        scheduledStartIso = new Date(scheduledLocal).toISOString();
      } else if (!isMini && !asDraft) {
        setError("Scheduled shows need a date/time.");
        setBusy(false);
        return;
      }

      const res = await fetch("/api/events/shows-releases", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title,
          description,
          artworkUrl: artworkUrl || null,
          timezone,
          scheduledStartIso,
          venueTheme: venueTheme || null,
          ticketRequested,
          requestedPriceUsd: ticketRequested ? requestedPriceUsd : null,
          replayAllowed,
          asDraft,
          performerSlug,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        liveRoomUrl?: string;
        event?: ShowsReleasePublicCard;
      };
      if (!res.ok || !data.ok) {
        setError(data.message ?? data.error ?? "Publish failed");
        return;
      }
      setMessage(
        data.liveRoomUrl
          ? "Published and live — opening room…"
          : asDraft
            ? "Draft saved."
            : "Published to Shows & Releases marquee.",
      );
      setTitle("");
      setDescription("");
      await reload();
      if (data.liveRoomUrl) {
        window.location.href = data.liveRoomUrl;
      }
    } catch {
      setError("Publish failed");
    } finally {
      setBusy(false);
    }
  };

  const goLive = async (eventId: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/shows-releases/${encodeURIComponent(eventId)}/go-live`, {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as {
        ok?: boolean;
        liveRoomUrl?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.message ?? data.error ?? "Go-live failed");
        return;
      }
      if (data.liveRoomUrl) window.location.href = data.liveRoomUrl;
    } catch {
      setError("Go-live failed");
    } finally {
      setBusy(false);
    }
  };

  const buckets = {
    live: mine.filter((e) => e.phase === "LIVE"),
    upcoming: mine.filter((e) => e.phase === "CLOSED" || e.phase === "PRESHOW"),
    past: mine.filter((e) => e.phase === "POSTSHOW"),
    drafts: mine.filter((e) => e.phase === "DRAFT" || e.publishStatus === "DRAFT"),
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid rgba(170,45,255,0.35)",
    background: "rgba(8,14,38,0.9)",
    color: "#fff",
    fontSize: 12,
  };

  return (
    <section
      style={{
        marginTop: 16,
        padding: 14,
        borderRadius: 10,
        border: "1px solid rgba(255,215,0,0.28)",
        background: "rgba(8,14,38,0.95)",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: "#FFD700", marginBottom: 4 }}>
        MY SHOWS & RELEASES
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
        Event & Release Publisher — request free or ticketed access. Platform issues ticket inventory
        (you do not mint tickets).
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8, marginBottom: 12 }}>
        {KINDS.map((k) => (
          <button
            key={k.kind}
            type="button"
            onClick={() => setKind(k.kind)}
            style={{
              textAlign: "left",
              padding: 10,
              borderRadius: 8,
              border: kind === k.kind ? "1px solid #FFD700" : "1px solid rgba(255,255,255,0.1)",
              background: kind === k.kind ? "rgba(255,215,0,0.1)" : "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800 }}>{k.label}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{k.hint}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <input style={inputStyle} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea
          style={{ ...inputStyle, minHeight: 64, resize: "vertical" }}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Artwork URL (poster)"
          value={artworkUrl}
          onChange={(e) => setArtworkUrl(e.target.value)}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input
            style={inputStyle}
            placeholder="Timezone (IANA)"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />
          <input
            style={inputStyle}
            type="datetime-local"
            value={scheduledLocal}
            onChange={(e) => setScheduledLocal(e.target.value)}
            title="Start in canonical timezone context (stored as UTC instant)"
          />
        </div>
        <input
          style={inputStyle}
          placeholder="Venue / theme"
          value={venueTheme}
          onChange={(e) => setVenueTheme(e.target.value)}
        />
        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={ticketRequested} onChange={(e) => setTicketRequested(e.target.checked)} />
          Request ticketed access (platform issues inventory)
        </label>
        {ticketRequested ? (
          <input
            style={inputStyle}
            type="number"
            min={0}
            step={1}
            value={requestedPriceUsd}
            onChange={(e) => setRequestedPriceUsd(Number(e.target.value))}
            placeholder="Requested ticket price USD"
          />
        ) : null}
        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={replayAllowed} onChange={(e) => setReplayAllowed(e.target.checked)} />
          Replay allowed after show
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <button
          type="button"
          disabled={busy || !title.trim()}
          onClick={() => void publish(false)}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            border: "none",
            background: "#FFD700",
            color: "#050510",
            fontWeight: 900,
            fontSize: 10,
            letterSpacing: "0.1em",
            cursor: busy ? "wait" : "pointer",
          }}
        >
          PUBLISH
        </button>
        <button
          type="button"
          disabled={busy || !title.trim()}
          onClick={() => void publish(true)}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            border: "1px solid rgba(170,45,255,0.5)",
            background: "transparent",
            color: "#AA2DFF",
            fontWeight: 900,
            fontSize: 10,
            letterSpacing: "0.1em",
            cursor: busy ? "wait" : "pointer",
          }}
        >
          SAVE DRAFT
        </button>
        <Link href="/concerts" style={{ fontSize: 10, color: "#00FFFF", alignSelf: "center" }}>
          View marquee →
        </Link>
      </div>

      {error ? <div style={{ fontSize: 11, color: "#FF3B5C", marginBottom: 8 }}>{error}</div> : null}
      {message ? <div style={{ fontSize: 11, color: "#00FF88", marginBottom: 8 }}>{message}</div> : null}

      {(
        [
          ["LIVE", buckets.live],
          ["UPCOMING", buckets.upcoming],
          ["PAST", buckets.past],
          ["DRAFTS", buckets.drafts],
        ] as const
      ).map(([label, list]) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,215,0,0.55)", marginBottom: 6 }}>
            {label} ({list.length})
          </div>
          {list.length === 0 ? (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>None</div>
          ) : (
            list.map((e) => (
              <div
                key={e.eventId}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <WorldMiniBadge authority={e.authority} size="xs" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{e.title}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                    {e.publicTypeLabel} · {e.dayTimeLabel}
                  </div>
                </div>
                {(e.phase === "PRESHOW" || e.phase === "LIVE") && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void goLive(e.eventId)}
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #00FF88",
                      background: "rgba(0,255,136,0.1)",
                      color: "#00FF88",
                      cursor: "pointer",
                    }}
                  >
                    GO LIVE
                  </button>
                )}
                <Link href={e.joinHref} style={{ fontSize: 9, color: "#00FFFF" }}>
                  OPEN
                </Link>
              </div>
            ))
          )}
        </div>
      ))}
    </section>
  );
}
