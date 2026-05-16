"use client";

export type ArtistShowState =
  | "closed"
  | "pre-show"
  | "opening"
  | "live"
  | "intermission"
  | "closing";

type ArtistCurtainShellProps = {
  showState: ArtistShowState;
  showTitle: string;
  onStateChange: (next: ArtistShowState) => void;
};

const STATE_SEQUENCE: ArtistShowState[] = [
  "closed",
  "pre-show",
  "opening",
  "live",
  "intermission",
  "closing",
  "closed",
];

const STATE_META: Record<ArtistShowState, { label: string; color: string; cta: string }> = {
  closed:       { label: "STAGE CLOSED",      color: "#444",     cta: "Open Pre-Show" },
  "pre-show":   { label: "PRE-SHOW PREP",      color: "#FFD700",  cta: "Open Curtain" },
  opening:      { label: "CURTAIN OPENING",    color: "#FF9200",  cta: "Start Live" },
  live:         { label: "LIVE ON STAGE",      color: "#00FF88",  cta: "Intermission" },
  intermission: { label: "INTERMISSION",       color: "#00FFFF",  cta: "Resume Show" },
  closing:      { label: "CLOSING CURTAIN",    color: "#FF2DAA",  cta: "End Show" },
};

export function nextShowState(current: ArtistShowState): ArtistShowState {
  const idx = STATE_SEQUENCE.indexOf(current);
  return STATE_SEQUENCE[Math.min(idx + 1, STATE_SEQUENCE.length - 1)] ?? "closed";
}

export default function ArtistCurtainShell({
  showState,
  showTitle,
  onStateChange,
}: ArtistCurtainShellProps) {
  const meta = STATE_META[showState];
  const isLive = showState === "live";
  const isClosed = showState === "closed";

  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${meta.color}44`,
        background: "rgba(4,8,18,0.96)",
        overflow: "hidden",
        boxShadow: `0 0 20px ${meta.color}18`,
      }}
    >
      {/* Curtain visual */}
      <div
        style={{
          position: "relative",
          height: 120,
          background:
            isClosed
              ? "linear-gradient(180deg, #1a0404 0%, #0a0202 100%)"
              : isLive
              ? "linear-gradient(180deg, #001a0a 0%, #000d04 100%)"
              : "linear-gradient(180deg, #1a0808 0%, #0a0404 100%)",
          overflow: "hidden",
        }}
      >
        {/* Stage floor line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)`,
          }}
        />
        {/* Spotlight cones */}
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: `${10 + i * 20}%`,
              width: "14%",
              height: "100%",
              background: `linear-gradient(180deg, ${meta.color}${isLive ? "22" : "0a"}, transparent)`,
              clipPath: "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)",
            }}
          />
        ))}
        {/* Curtain panels (left + right) */}
        {!isLive && (
          <>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "46%",
                height: "100%",
                background:
                  "linear-gradient(90deg, #5a0a0a, #3a0606 60%, rgba(58,6,6,0.4))",
                borderRight: "2px solid #8b1414",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "46%",
                height: "100%",
                background:
                  "linear-gradient(270deg, #5a0a0a, #3a0606 60%, rgba(58,6,6,0.4))",
                borderLeft: "2px solid #8b1414",
              }}
            />
          </>
        )}
        {/* State badge */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.7)",
            borderRadius: 999,
            border: `1px solid ${meta.color}60`,
            color: meta.color,
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.18em",
            padding: "4px 12px",
            whiteSpace: "nowrap",
          }}
        >
          {meta.label}
        </div>
        {isLive && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              display: "flex",
              gap: 5,
              alignItems: "center",
              borderRadius: 999,
              border: "1px solid rgba(255,40,40,0.5)",
              background: "rgba(255,40,40,0.14)",
              color: "#ff6666",
              fontSize: 9,
              fontWeight: 900,
              padding: "2px 8px",
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff4444", boxShadow: "0 0 5px #ff4444" }} />
            LIVE
          </div>
        )}
      </div>

      {/* Info strip */}
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#d9f2ff", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {showTitle}
        </div>
        <button
          type="button"
          onClick={() => onStateChange(nextShowState(showState))}
          style={{
            width: "100%",
            borderRadius: 8,
            border: `1px solid ${meta.color}55`,
            background: `${meta.color}18`,
            color: meta.color,
            padding: "7px 10px",
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginTop: 6,
          }}
        >
          {meta.cta}
        </button>
      </div>
    </div>
  );
}
