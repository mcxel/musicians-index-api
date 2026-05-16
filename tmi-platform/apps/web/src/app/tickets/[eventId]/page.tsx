import { notFound } from "next/navigation";
import Link from "next/link";
import RouteRecoveryCard from "@/components/routing/RouteRecoveryCard";
import SlugFallbackPanel from "@/components/routing/SlugFallbackPanel";
import SocketStatusBadge from "@/components/routing/SocketStatusBadge";
import ReconnectButton from "@/components/routing/ReconnectButton";
import ReturnPathButton from "@/components/routing/ReturnPathButton";
import { registerRoute } from "@/lib/routing/RouteClosureRegistry";
import { registerReturnPath } from "@/lib/routing/ReturnPathResolver";
import { resolveSlug } from "@/lib/routing/SlugRecoveryEngine";
import SocketRecoveryEngine from "@/lib/routing/SocketRecoveryEngine";

type Props = { params: Promise<{ eventId: string }> };

const EVENTS: Record<string, {
  title: string; artist: string; date: string; time: string;
  venue: string; price: number; capacity: number; sold: number;
  icon: string; color: string; desc: string; type: string;
}> = {
  "wavetek-fifth-ward-live": { title: "Fifth Ward Live", artist: "Wavetek", date: "2026-05-03", time: "9:00 PM EST", venue: "TMI Main Stage", price: 12, capacity: 240, sold: 187, icon: "🎤", color: "#FF2DAA", type: "CONCERT", desc: "Wavetek brings unreleased tracks, freestyle rounds, and fan interactions to TMI's Main Stage. This is Houston's finest, live." },
  "zuri-bloom-diaspora-session": { title: "Diaspora Session", artist: "Zuri Bloom", date: "2026-05-10", time: "7:30 PM EST", venue: "TMI World Stage", price: 9, capacity: 180, sold: 64, icon: "🌍", color: "#00FF88", type: "CONCERT", desc: "Afrobeats, Amapiano, and pop collide in Zuri Bloom's debut live performance. Special guest features expected." },
  "lyric-stone-obsidian-water": { title: "Obsidian Water Live", artist: "Lyric Stone", date: "2026-05-17", time: "8:00 PM EST", venue: "TMI Soul Room", price: 15, capacity: 300, sold: 41, icon: "🎵", color: "#FFD700", type: "CONCERT", desc: "Lyric Stone performs the full Obsidian Water album live for the first time. Intimate, emotional, live band." },
  "tmi-grand-contest-s1-finale": { title: "Grand Contest S1 Finale", artist: "Multiple Artists", date: "2026-06-01", time: "8:00 PM EST", venue: "TMI Grand Arena", price: 25, capacity: 1000, sold: 612, icon: "🏆", color: "#AA2DFF", type: "EVENT", desc: "The Season 1 Grand Contest finale. All category winners compete for the $100,000 grand prize and a recording contract." },
};

export async function generateStaticParams() {
  return Object.keys(EVENTS).map(eventId => ({ eventId }));
}

export async function generateMetadata({ params }: Props) {
  const { eventId } = await params;
  const event = EVENTS[eventId];
  if (!event) return { title: "Event Not Found | TMI Tickets" };
  return { title: `${event.title} — Tickets | TMI`, description: event.desc };
}

export default async function TicketDetailPage({ params }: Props) {
  const { eventId } = await params;
  registerRoute("/tickets/[eventId]", "open", {
    returnRoute: "/tickets",
    fallbackRoute: "/tickets",
    nextAction: "buy-ticket",
  });
  registerReturnPath({ fromRoute: "/tickets/[eventId]", toRoute: "/tickets", label: "Back to Tickets" });
  resolveSlug("event", eventId);
  SocketRecoveryEngine.register("guest-user", `sock_ticket_${eventId.slice(0, 5)}`, eventId);

  const event = EVENTS[eventId];
  if (!event) return notFound();

  const remaining = event.capacity - event.sold;
  const pct = Math.round((event.sold / event.capacity) * 100);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 24px 0" }}>
        <Link href="/tickets" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← MY TICKETS
        </Link>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 36, alignItems: "start" }}>
        {/* Event info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 48 }}>{event.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: event.color, border: `1px solid ${event.color}40`, borderRadius: 4, padding: "3px 8px" }}>
              {event.type}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.4rem,4vw,2.2rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>
            {event.title}
          </h1>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{event.artist}</div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 28 }}>{event.desc}</p>

          {/* Event details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
            {[
              { label: "Date",     value: event.date },
              { label: "Time",     value: event.time },
              { label: "Venue",    value: event.venue },
              { label: "Type",     value: event.type },
            ].map(item => (
              <div key={item.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Availability */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>{event.sold} sold</span>
              <span style={{ color: remaining < 20 ? "#FF2DAA" : "rgba(255,255,255,0.4)" }}>
                {remaining} remaining
              </span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct > 85 ? "#FF2DAA" : event.color, borderRadius: 3 }} />
            </div>
            {remaining < 30 && (
              <div style={{ fontSize: 10, color: "#FF2DAA", fontWeight: 700, marginTop: 6 }}>
                ⚠️ Almost sold out — only {remaining} tickets left
              </div>
            )}
          </div>
        </div>

        {/* Purchase panel */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${event.color}20`, borderRadius: 16, padding: 24, position: "sticky", top: 80 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>TICKET PRICE</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: event.color, marginBottom: 20 }}>
            ${event.price.toFixed(2)}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>QTY</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 4].map(qty => (
                <button key={qty} style={{ flex: 1, padding: "8px 0", fontSize: 13, fontWeight: 800, color: qty === 1 ? "#050510" : "rgba(255,255,255,0.5)", background: qty === 1 ? event.color : "rgba(255,255,255,0.04)", border: `1px solid ${qty === 1 ? event.color : "rgba(255,255,255,0.1)"}`, borderRadius: 8, cursor: "pointer" }}>
                  {qty}
                </button>
              ))}
            </div>
          </div>

          <Link href="/checkout" style={{ display: "block", textAlign: "center", padding: "13px 0", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: `linear-gradient(135deg,${event.color},${event.color}99)`, borderRadius: 10, textDecoration: "none", marginBottom: 10 }}>
            BUY TICKET — ${event.price.toFixed(2)}
          </Link>
          <Link href="/cart" style={{ display: "block", textAlign: "center", padding: "11px 0", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, textDecoration: "none" }}>
            ADD TO CART
          </Link>

          <div style={{ marginTop: 16, fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
            🔒 Secured by Stripe · Instant delivery
          </div>
        </div>
      </div>

        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px 24px", display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <SocketStatusBadge userId="guest-user" />
            <ReconnectButton userId="guest-user" />
            <ReturnPathButton />
          </div>
          <RouteRecoveryCard route="/tickets/[eventId]" />
          <SlugFallbackPanel entity="event" slug={eventId} />
        </div>
    </main>
  );
}
