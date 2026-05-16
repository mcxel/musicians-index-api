import Link from "next/link";
import HubAssetPortraitLayer from "@/components/avatar/HubAssetPortraitLayer";

export type PreviewWindowAction = {
  label: string;
  href?: string;
};

export type PreviewWindowCard = {
  label?: string;
  title?: string;
  value?: string;
  description?: string;
  accent?: string;
  badge?: string;
  actions?: PreviewWindowAction[];
};

export type PreviewWindowCards = {
  profile?: PreviewWindowCard;
  liveActivity?: PreviewWindowCard;
  article?: PreviewWindowCard;
  venueBooking?: PreviewWindowCard;
  music?: PreviewWindowCard;
  ranking?: PreviewWindowCard;
};

type PreviewWindowProps = {
  title: string;
  subtitle?: string;
  cards?: PreviewWindowCards;
  motionPortrait?: {
    name: string;
    accent?: string;
    mode?: "cutout" | "circle" | "hero";
    state?: "idle" | "speaking" | "featured" | "winner" | "live";
    assetId?: string;
    avatarId?: string;
    hostId?: string;
  };
};

type PreviewCardKey = keyof PreviewWindowCards;

const CARD_ORDER: PreviewCardKey[] = [
  "profile",
  "liveActivity",
  "article",
  "venueBooking",
  "music",
  "ranking",
];

const DEFAULT_CARDS: Record<PreviewCardKey, Required<Omit<PreviewWindowCard, "actions">> & { actions: PreviewWindowAction[] }> = {
  profile: {
    label: "Profile Card",
    title: "Identity Ready",
    value: "Live",
    description: "Profile metadata is loaded and safe fallback labels are active.",
    accent: "#00FFFF",
    badge: "READY",
    actions: [{ label: "Open Profile" }],
  },
  liveActivity: {
    label: "Live Activity",
    title: "Activity Feed",
    value: "Standby",
    description: "No live activity detected yet. The preview remains shell-safe.",
    accent: "#FF2DAA",
    badge: "LIVE",
    actions: [{ label: "Open Live" }],
  },
  article: {
    label: "Recent Article",
    title: "Editorial Preview",
    value: "Magazine",
    description: "Latest article preview appears here when editorial routing is present.",
    accent: "#FFD700",
    badge: "READ",
    actions: [{ label: "Open Article" }],
  },
  venueBooking: {
    label: "Venue / Booking",
    title: "Booking Surface",
    value: "Open",
    description: "Venue and booking jump points are available without changing auth or route structure.",
    accent: "#00FF88",
    badge: "BOOK",
    actions: [{ label: "Open Booking" }],
  },
  music: {
    label: "Music Preview",
    title: "Audio Surface",
    value: "Queued",
    description: "Music preview safely routes to an existing listening surface when data is missing.",
    accent: "#AA2DFF",
    badge: "AUDIO",
    actions: [{ label: "Open Music" }],
  },
  ranking: {
    label: "Ranking Preview",
    title: "Leaderboard",
    value: "Tracked",
    description: "Ranking snapshot and jump controls remain visible even with partial data.",
    accent: "#FF8C00",
    badge: "RANK",
    actions: [{ label: "Open Rankings" }],
  },
};

function mergeCard(type: PreviewCardKey, card?: PreviewWindowCard) {
  const base = DEFAULT_CARDS[type];
  return {
    ...base,
    ...card,
    actions: card?.actions && card.actions.length > 0 ? card.actions : base.actions,
  };
}

export default function PreviewWindow({ title, subtitle, cards, motionPortrait }: PreviewWindowProps) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "linear-gradient(160deg, rgba(8,10,24,0.96) 0%, rgba(14,7,22,0.96) 100%)",
        boxShadow: "0 0 30px rgba(0,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.03)",
        padding: 18,
      }}
    >
      <style>{`
        @keyframes previewWindowPulse {
          0% { box-shadow: 0 0 0 rgba(0,255,255,0.00); }
          50% { box-shadow: 0 0 28px rgba(0,255,255,0.14); }
          100% { box-shadow: 0 0 0 rgba(0,255,255,0.00); }
        }
        @keyframes previewWindowSweep {
          0% { transform: translateX(-130%); }
          100% { transform: translateX(220%); }
        }
      `}</style>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 20,
          border: "1px solid rgba(0,255,255,0.18)",
          animation: "previewWindowPulse 4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 100,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          transform: "translateX(-130%)",
          animation: "previewWindowSweep 6s linear infinite",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              color: "#74dfff",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 900,
              marginBottom: 5,
            }}
          >
            Preview Windows
          </div>
          <h2 style={{ margin: 0, color: "#ffffff", fontSize: 22, lineHeight: 1.15 }}>{title}</h2>
          {subtitle ? <p style={{ margin: "6px 0 0", color: "#8ea8c8", fontSize: 12 }}>{subtitle}</p> : null}

          {motionPortrait ? (
            <div style={{ marginTop: 12 }}>
              <HubAssetPortraitLayer
                name={motionPortrait.name}
                accent={motionPortrait.accent}
                variant={motionPortrait.mode}
                state={motionPortrait.state}
                assetId={motionPortrait.assetId}
                avatarId={motionPortrait.avatarId}
                hostId={motionPortrait.hostId}
              />
            </div>
          ) : null}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {CARD_ORDER.map((type) => {
            const card = mergeCard(type, cards?.[type]);

            return (
              <div
                key={type}
                style={{
                  borderRadius: 16,
                  border: `1px solid ${card.accent}30`,
                  background: `${card.accent}0f`,
                  padding: 14,
                  minHeight: 168,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                  boxShadow: `0 0 0 ${card.accent}00`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div>
                    <div
                      style={{
                        color: card.accent,
                        fontSize: 9,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        fontWeight: 800,
                        marginBottom: 4,
                      }}
                    >
                      {card.label}
                    </div>
                    <div style={{ color: "#ffffff", fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{card.title}</div>
                  </div>
                  <span
                    style={{
                      flexShrink: 0,
                      borderRadius: 999,
                      border: `1px solid ${card.accent}40`,
                      color: card.accent,
                      background: `${card.accent}14`,
                      padding: "3px 8px",
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {card.badge}
                  </span>
                </div>

                <div style={{ color: card.accent, fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{card.value}</div>
                <p style={{ margin: 0, color: "#a7b9d6", fontSize: 12, lineHeight: 1.5, flex: 1 }}>{card.description}</p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {card.actions.map((action, index) =>
                    action.href ? (
                      <Link
                        key={`${type}-${index}`}
                        href={action.href}
                        style={{
                          borderRadius: 10,
                          border: `1px solid ${card.accent}42`,
                          background: `${card.accent}18`,
                          color: "#ffffff",
                          textDecoration: "none",
                          padding: "7px 10px",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {action.label}
                      </Link>
                    ) : (
                      <span
                        key={`${type}-${index}`}
                        style={{
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.35)",
                          padding: "7px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {action.label}
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}