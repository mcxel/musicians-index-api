"use client";

interface Field {
  label: string;
  done: boolean;
  href: string;
}

interface Props {
  fields: Field[];
  role?: string;
  compact?: boolean;
}

export default function ProfileCompletionBar({ fields, role, compact = false }: Props) {
  const total   = fields.length;
  const done    = fields.filter((f) => f.done).length;
  const pct     = total === 0 ? 100 : Math.round((done / total) * 100);
  const isReady = pct === 100;

  const barColor = pct >= 80 ? "#00FF88" : pct >= 50 ? "#FFD700" : "#FF2DAA";

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${isReady ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: compact ? 8 : 12,
      padding: compact ? "12px 16px" : "18px 20px",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: compact ? 8 : 12 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>
            {role ? `${role.toUpperCase()} ` : ""}PROFILE COMPLETION
          </div>
          <div style={{ fontSize: compact ? 14 : 18, fontWeight: 900, color: isReady ? "#00FF88" : "#fff" }}>
            {pct}% {isReady ? "✓ Complete" : "Complete"}
          </div>
        </div>
        <div style={{ fontSize: compact ? 22 : 32 }}>
          {isReady ? "🌟" : pct >= 50 ? "🔧" : "📋"}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", marginBottom: compact ? 10 : 14 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${barColor},${barColor}cc)`, borderRadius: 4, transition: "width 0.5s ease" }} />
      </div>

      {/* Field checklist */}
      {!compact && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {fields.map((f) => (
            <a
              key={f.label}
              href={f.done ? "#" : f.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 10px",
                borderRadius: 6,
                background: f.done ? "transparent" : "rgba(255,255,255,0.03)",
                textDecoration: "none",
                cursor: f.done ? "default" : "pointer",
              }}
            >
              <span style={{ fontSize: 13, color: f.done ? "#00FF88" : "rgba(255,255,255,0.25)" }}>
                {f.done ? "✓" : "○"}
              </span>
              <span style={{ fontSize: 12, color: f.done ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.8)", flex: 1 }}>
                {f.label}
              </span>
              {!f.done && (
                <span style={{ fontSize: 9, color: "#00FFFF", letterSpacing: "0.1em" }}>ADD →</span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Preset field sets per role ───────────────────────────────────────────────

export const FAN_FIELDS = (done: Record<string, boolean>): Field[] => [
  { label: "Profile photo",     done: !!done.avatar,     href: "/avatar" },
  { label: "Username set",      done: !!done.username,   href: "/settings" },
  { label: "Favorite genres",   done: !!done.genres,     href: "/settings" },
  { label: "First ticket bought", done: !!done.ticket,   href: "/tickets" },
  { label: "Follow 3+ artists", done: !!done.follows,    href: "/search" },
];

export const PERFORMER_FIELDS = (done: Record<string, boolean>): Field[] => [
  { label: "Profile photo",     done: !!done.avatar,     href: "/avatar" },
  { label: "Bio written",       done: !!done.bio,        href: "/settings" },
  { label: "Genre tags",        done: !!done.genres,     href: "/settings" },
  { label: "First battle entered", done: !!done.battle,  href: "/battles" },
  { label: "Beat store set up", done: !!done.beats,      href: "/beats" },
  { label: "Stripe payout connected", done: !!done.stripe, href: "/account/subscription" },
];

export const PROMOTER_FIELDS = (done: Record<string, boolean>): Field[] => [
  { label: "Company name",      done: !!done.company,    href: "/settings" },
  { label: "City / market",     done: !!done.city,       href: "/settings" },
  { label: "First event created", done: !!done.event,    href: "/promoter/events" },
  { label: "Stripe Connect payout", done: !!done.stripe, href: "/venues/sell" },
  { label: "Tickets published", done: !!done.tickets,    href: "/tickets" },
];

export const SPONSOR_FIELDS = (done: Record<string, boolean>): Field[] => [
  { label: "Brand name",        done: !!done.brand,      href: "/settings" },
  { label: "Industry selected", done: !!done.industry,   href: "/settings" },
  { label: "First sponsorship", done: !!done.sponsored,  href: "/sponsor/campaigns" },
  { label: "Payment method",    done: !!done.payment,    href: "/account/subscription" },
];

export const ADVERTISER_FIELDS = (done: Record<string, boolean>): Field[] => [
  { label: "Brand name",        done: !!done.brand,      href: "/settings" },
  { label: "Ad creative uploaded", done: !!done.creative, href: "/advertising" },
  { label: "Campaign live",     done: !!done.campaign,   href: "/advertising" },
  { label: "Payment method",    done: !!done.payment,    href: "/account/subscription" },
];

export const VENUE_FIELDS = (done: Record<string, boolean>): Field[] => [
  { label: "Venue name",        done: !!done.name,       href: "/settings" },
  { label: "Address / location", done: !!done.address,   href: "/settings" },
  { label: "Seat map configured", done: !!done.seatmap,  href: "/seating" },
  { label: "Stripe Connect",    done: !!done.stripe,     href: "/venues/sell" },
  { label: "First event listed", done: !!done.event,     href: "/venues" },
];
