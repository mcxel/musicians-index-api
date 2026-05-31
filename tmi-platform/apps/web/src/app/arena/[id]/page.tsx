import Link from "next/link";
import ArenaEventShell from "@/components/live/ArenaEventShell";
import type { ArenaEventType } from "@/components/live/ArenaEventShell";

type EventMeta = {
  label: string;
  eventType: ArenaEventType;
  accentColor: string;
};

const EVENT_REGISTRY: Record<string, EventMeta> = {
  "main-stage":         { label: "Main Stage",          eventType: "live-show",    accentColor: "#FF2DAA" },
  "concert":            { label: "Live Concert",         eventType: "concert",      accentColor: "#FFD700" },
  "battle":             { label: "Battle Arena",         eventType: "battle",       accentColor: "#FF2DAA" },
  "cypher":             { label: "Cypher Circle",        eventType: "cypher",       accentColor: "#AA2DFF" },
  "challenge":          { label: "Challenge Stage",      eventType: "challenge",    accentColor: "#00FFFF" },
  "monday-night-stage": { label: "Monday Night Stage",  eventType: "monday-stage", accentColor: "#4488FF" },
};

function resolveEvent(id: string): EventMeta {
  const direct = EVENT_REGISTRY[id];
  if (direct) return direct;
  if (id.includes("battle"))    return EVENT_REGISTRY["battle"]!;
  if (id.includes("cypher"))    return EVENT_REGISTRY["cypher"]!;
  if (id.includes("concert"))   return EVENT_REGISTRY["concert"]!;
  if (id.includes("challenge")) return EVENT_REGISTRY["challenge"]!;
  if (id.includes("monday"))    return EVENT_REGISTRY["monday-night-stage"]!;
  return EVENT_REGISTRY["main-stage"]!;
}

export default function ArenaPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const meta = resolveEvent(id);

  return (
    <main
      data-testid="arena-page"
      style={{ minHeight: "100vh", background: "#050510", color: "#fff" }}
    >
      {/* Top nav */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 20px",
        background: "rgba(0,0,0,0.85)", borderBottom: `1px solid ${meta.accentColor}22`,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/home/3" style={{
          fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none",
          letterSpacing: "0.1em",
        }}>
          ← HOME
        </Link>
        <div style={{
          fontSize: 9, fontWeight: 900, letterSpacing: "0.28em",
          color: meta.accentColor,
        }}>
          {meta.label.toUpperCase()}
        </div>
        <div style={{
          fontSize: 9, color: "rgba(255,255,255,0.25)", marginLeft: 4,
        }}>
          · {id}
        </div>
      </div>

      {/* Arena — all event types (except dance party) route here */}
      <ArenaEventShell
        roomId={id}
        eventType={meta.eventType}
        mode="audience"
      />
    </main>
  );
}
