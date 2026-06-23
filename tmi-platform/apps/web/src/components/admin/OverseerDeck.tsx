"use client";

import { useEffect, useState, useCallback } from "react";

type ObservatorySummary = {
  users: { total: number; online: number; paid: number; free: number };
  membership: {
    performer: Record<string, number>;
    fan: Record<string, number>;
  };
  rooms: { total: number; active: number; liveSessions: number; occupancy: number };
  liveActivity: {
    liveRooms: number;
    livePerformers: number;
    liveFans: number;
    battlesActive: number;
    cyphersActive: number;
    challengesActive: number;
    radioRoomsActive: number;
    playlistRoomsActive: number;
  };
  uploadHealth: {
    imagesUploadedToday: number;
    songsUploadedToday: number;
    videosUploadedToday: number;
    failedUploads: number;
    failedTranscodes: number;
    failedPlaylistImports: number;
  };
  business: { revenueToday: number; revenueMonth: number };
  revenueHealth: {
    revenueToday: number;
    revenueWeek: number;
    revenueMonth: number;
    newSubscriptions: number;
    renewals: number;
    failedPayments: number;
    pendingPayments: number;
    stripeHealth: string;
  };
  commerce: { tickets: number; sponsors: number };
  discoveryHealth: {
    roomsVisibleOnDiscovery: number;
    roomsMissingPreview: number;
    roomsMissingThumbnails: number;
    roomsMissingStreams: number;
  };
  observatory: {
    hottestRoom: unknown;
    activeGifts: number;
    totalConflicts: number;
  };
};

const MONITOR_ACCENT: Record<string, string> = {
  Activity:      "#00FFFF",
  Revenue:       "#00FF88",
  Signups:       "#AA2DFF",
  "Live Rooms":  "#FF2DAA",
  Tickets:       "#FFD700",
  Sponsors:      "#FF8C00",
  Battles:       "#f87171",
  "Sys Health":  "#a3e635",
};

function fmt$(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
}

function Monitor({
  label,
  children,
  pulse,
}: {
  label: string;
  children: React.ReactNode;
  pulse?: boolean;
}) {
  const accent = MONITOR_ACCENT[label] ?? "#00FFFF";
  return (
    <div
      style={{
        background: "rgba(5,5,22,0.92)",
        border: `1px solid ${accent}33`,
        borderRadius: 10,
        padding: "14px 16px",
        position: "relative",
        overflow: "hidden",
        minHeight: 160,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* scanline effect */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.012) 2px,rgba(255,255,255,0.012) 4px)",
          pointerEvents: "none",
        }}
      />
      {/* corner glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 80,
          height: 80,
          background: `radial-gradient(circle at 0 0,${accent}18,transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, zIndex: 1 }}>
        {pulse && (
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 6px ${accent}`,
              flexShrink: 0,
              animation: "tmi-pulse 1.8s ease-in-out infinite",
            }}
          />
        )}
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.22em",
            color: accent,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ flex: 1, zIndex: 1 }}>{children}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  large,
}: {
  label: string;
  value: string | number;
  accent?: string;
  large?: boolean;
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: large ? 22 : 14, fontWeight: 900, color: accent ?? "#f3e9ff" }}>
        {value}
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", letterSpacing: "0.1em" }}>
        {label}
      </div>
    </div>
  );
}

function HealthBadge({ status }: { status: string }) {
  const ok = status === "HEALTHY";
  const warn = status === "DEGRADED";
  const color = ok ? "#00FF88" : warn ? "#FFD700" : "rgba(255,255,255,0.3)";
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.14em",
        color,
        border: `1px solid ${color}55`,
        borderRadius: 4,
        padding: "2px 6px",
      }}
    >
      {status}
    </span>
  );
}

export default function OverseerDeck() {
  const [summary, setSummary] = useState<ObservatorySummary | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/observatory-summary", { credentials: "include" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        setError(d.error ?? `HTTP ${res.status}`);
        return;
      }
      const data = await res.json() as { summary: ObservatorySummary };
      setSummary(data.summary);
      setLastUpdated(new Date());
      setError("");
    } catch {
      setError("Network error");
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 15000);
    return () => clearInterval(interval);
  }, [fetchSummary]);

  if (error) {
    return (
      <div style={{ padding: 32, color: "#ff6666", fontFamily: "monospace", fontSize: 13 }}>
        Overseer Deck error: {error}
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={{ padding: 32, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", fontSize: 12 }}>
        Loading telemetry…
      </div>
    );
  }

  const s = summary;

  return (
    <div style={{ padding: "24px 20px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes tmi-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.3em", color: "#00FFFF", textTransform: "uppercase" }}>
            Overseer Deck
          </div>
          <h2 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 900, color: "#f3e9ff" }}>
            8-Monitor Telemetry Wall
          </h2>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
            AUTO-REFRESH 15s
          </div>
          {lastUpdated && (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
              {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={fetchSummary}
            style={{
              marginTop: 4,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#00FFFF",
              background: "rgba(0,255,255,0.08)",
              border: "1px solid rgba(0,255,255,0.2)",
              borderRadius: 4,
              padding: "2px 8px",
              cursor: "pointer",
            }}
          >
            REFRESH
          </button>
        </div>
      </div>

      {/* 8-Monitor Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        {/* Monitor 1 — Activity */}
        <Monitor label="Activity" pulse={s.liveActivity.liveRooms > 0}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <Stat label="Live Rooms" value={s.liveActivity.liveRooms} accent="#00FFFF" />
            <Stat label="Live Performers" value={s.liveActivity.livePerformers} accent="#00FFFF" />
            <Stat label="Live Fans" value={s.liveActivity.liveFans} />
            <Stat label="Online Now" value={s.users.online} />
            <Stat label="Radio Rooms" value={s.liveActivity.radioRoomsActive} />
            <Stat label="Playlist Rooms" value={s.liveActivity.playlistRoomsActive} />
          </div>
        </Monitor>

        {/* Monitor 2 — Revenue */}
        <Monitor label="Revenue" pulse={s.revenueHealth.revenueToday > 0}>
          <Stat label="Today" value={fmt$(s.revenueHealth.revenueToday)} accent="#00FF88" large />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 6 }}>
            <Stat label="This Week" value={fmt$(s.revenueHealth.revenueWeek)} accent="#00FF88" />
            <Stat label="This Month" value={fmt$(s.revenueHealth.revenueMonth)} accent="#00FF88" />
            <Stat label="New Subs" value={s.revenueHealth.newSubscriptions} />
            <Stat label="Renewals" value={s.revenueHealth.renewals} />
            <Stat label="Failed Payments" value={s.revenueHealth.failedPayments} accent={s.revenueHealth.failedPayments > 0 ? "#ff6666" : undefined} />
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
              <HealthBadge status={s.revenueHealth.stripeHealth} />
            </div>
          </div>
        </Monitor>

        {/* Monitor 3 — Signups */}
        <Monitor label="Signups">
          <Stat label="Total Users" value={s.users.total} accent="#AA2DFF" large />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 6 }}>
            <Stat label="Paid" value={s.users.paid} accent="#AA2DFF" />
            <Stat label="Free" value={s.users.free} />
            <Stat label="Diamond Fans" value={s.membership.fan.diamond ?? 0} accent="#FFD700" />
            <Stat label="Diamond Artists" value={s.membership.performer.diamond ?? 0} accent="#FFD700" />
            <Stat label="Gold Fans" value={s.membership.fan.gold ?? 0} />
            <Stat label="Gold Artists" value={s.membership.performer.gold ?? 0} />
          </div>
        </Monitor>

        {/* Monitor 4 — Live Rooms */}
        <Monitor label="Live Rooms" pulse={s.rooms.active > 0}>
          <Stat label="Active Rooms" value={s.rooms.active} accent="#FF2DAA" large />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 6 }}>
            <Stat label="Sessions" value={s.rooms.liveSessions} accent="#FF2DAA" />
            <Stat label="Total Capacity" value={s.rooms.total} />
            <Stat label="Occupancy" value={s.rooms.occupancy} />
            <Stat label="Missing Preview" value={s.discoveryHealth.roomsMissingPreview} accent={s.discoveryHealth.roomsMissingPreview > 0 ? "#FFD700" : undefined} />
            <Stat label="Missing Streams" value={s.discoveryHealth.roomsMissingStreams} accent={s.discoveryHealth.roomsMissingStreams > 0 ? "#ff6666" : undefined} />
            <Stat label="On Discovery" value={s.discoveryHealth.roomsVisibleOnDiscovery} />
          </div>
        </Monitor>

        {/* Monitor 5 — Tickets */}
        <Monitor label="Tickets">
          <Stat label="Total Tickets" value={s.commerce.tickets} accent="#FFD700" large />
          <div style={{ marginTop: 8 }}>
            <Stat label="Songs Uploaded Today" value={s.uploadHealth.songsUploadedToday} />
            <Stat label="Videos Uploaded Today" value={s.uploadHealth.videosUploadedToday} />
            <Stat label="Images Uploaded Today" value={s.uploadHealth.imagesUploadedToday} />
            <Stat
              label="Failed Uploads"
              value={s.uploadHealth.failedUploads}
              accent={s.uploadHealth.failedUploads > 0 ? "#ff6666" : undefined}
            />
          </div>
        </Monitor>

        {/* Monitor 6 — Sponsors */}
        <Monitor label="Sponsors">
          <Stat label="Active Sponsor Zones" value={s.commerce.sponsors} accent="#FF8C00" large />
          <div style={{ marginTop: 8 }}>
            <Stat label="Active Gifts" value={(s.observatory as { activeGifts?: number }).activeGifts ?? 0} />
            <Stat label="Runtime Conflicts" value={(s.observatory as { totalConflicts?: number }).totalConflicts ?? 0} accent={(s.observatory as { totalConflicts?: number }).totalConflicts ? "#ff6666" : undefined} />
            <Stat label="Pending Payments" value={s.revenueHealth.pendingPayments} accent={s.revenueHealth.pendingPayments > 0 ? "#FFD700" : undefined} />
          </div>
        </Monitor>

        {/* Monitor 7 — Battles */}
        <Monitor label="Battles" pulse={s.liveActivity.battlesActive > 0}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <Stat label="Battles Live" value={s.liveActivity.battlesActive} accent="#f87171" large />
            <Stat label="Cyphers Live" value={s.liveActivity.cyphersActive} accent="#f87171" large />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 6 }}>
            <Stat label="Challenges" value={s.liveActivity.challengesActive} />
            <Stat label="Total Arena" value={s.liveActivity.battlesActive + s.liveActivity.cyphersActive + s.liveActivity.challengesActive} accent="#f87171" />
          </div>
          {s.liveActivity.battlesActive === 0 && s.liveActivity.cyphersActive === 0 && (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 8 }}>
              No active arena sessions
            </div>
          )}
        </Monitor>

        {/* Monitor 8 — Sys Health */}
        <Monitor label="Sys Health">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>STRIPE</span>
              <HealthBadge status={s.revenueHealth.stripeHealth} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>TRANSCODES</span>
              <HealthBadge status={s.uploadHealth.failedTranscodes > 0 ? "DEGRADED" : "HEALTHY"} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>STREAM FEEDS</span>
              <HealthBadge status={s.discoveryHealth.roomsMissingStreams > 0 ? "DEGRADED" : "HEALTHY"} />
            </div>
            <div style={{ marginTop: 4 }}>
              <Stat label="Failed Transcodes" value={s.uploadHealth.failedTranscodes} accent={s.uploadHealth.failedTranscodes > 0 ? "#ff6666" : undefined} />
              <Stat label="Playlist Import Errors" value={s.uploadHealth.failedPlaylistImports} accent={s.uploadHealth.failedPlaylistImports > 0 ? "#ff6666" : undefined} />
            </div>
          </div>
        </Monitor>
      </div>
    </div>
  );
}
