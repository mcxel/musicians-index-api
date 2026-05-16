import { notFound } from "next/navigation";
import Link from "next/link";
import { LiveStatusBadge } from "@/components/live/LiveStatusBadge";

type Props = { params: Promise<{ slug: string }> };

const SESSIONS: Record<string, {
  label: string; title: string; date: string; status: string;
  winner: string | null; color: string; participants: string[];
}> = {
  "dirty-dozens-season-1-episode-1": {
    label: "S1 E01", title: "The Inaugural Dirty Dozens", date: "2026-04-07",
    status: "ENDED", winner: "Wavetek", color: "#FFD700",
    participants: ["Wavetek","Krypt","Verse Knight","FlowMaster","Lyric Stone","Drake Junior","Bar God","MC Phantom","Ace Villain","Zero Degrees","Cold Spark","The Architect"],
  },
  "dirty-dozens-season-1-episode-2": {
    label: "S1 E02", title: "No Mercy Round", date: "2026-04-14",
    status: "ENDED", winner: "Krypt", color: "#FF2DAA",
    participants: ["Krypt","Shadow Pen","Wavetek","Blade Verse","Iron Flow","Truth Seeker","Phantom Lyric","Overdrive","Cold Fusion","Solo Ace","The Prophet","Midnight Bars"],
  },
  "dirty-dozens-season-1-episode-3": {
    label: "S1 E03", title: "The Heat Check", date: "2026-04-21",
    status: "ENDED", winner: "Verse Knight", color: "#AA2DFF",
    participants: ["Verse Knight","Wavetek","Krypt","Cold Spark","Ace Villain","Bar God","Lyric Stone","MC Phantom","Zero Degrees","FlowMaster","Drake Junior","The Architect"],
  },
  "dirty-dozens-season-1-episode-4": {
    label: "S1 E04", title: "Grand Finale Countdown", date: "2026-05-05",
    status: "UPCOMING", winner: null, color: "#00FFFF",
    participants: ["Wavetek","Krypt","Verse Knight","Cold Spark","Bar God","Ace Villain","Shadow Pen","Blade Verse","Zero Degrees","FlowMaster","The Prophet","Midnight Bars"],
  },
};

export async function generateStaticParams() {
  return Object.keys(SESSIONS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const session = SESSIONS[slug];
  if (!session) return { title: "Not Found | TMI" };
  return {
    title: `${session.title} | Dirty Dozens — TMI`,
    description: `${session.label}: ${session.title}. ${session.status === "ENDED" ? `Winner: ${session.winner}.` : "Coming soon."}`,
  };
}

export default async function DirtyDozensSessionPage({ params }: Props) {
  const { slug } = await params;
  const session = SESSIONS[slug];
  if (!session) return notFound();

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px 0" }}>
        <Link href="/dirty-dozens" style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          ← DIRTY DOZENS
        </Link>
      </div>

      <header style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: session.color, marginBottom: 12 }}>
          {session.label} · {session.date}
        </div>
        <h1 style={{ fontSize: "clamp(1.4rem,4vw,2.4rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
          {session.title}
        </h1>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: session.status === "UPCOMING" ? "#00FFFF" : "#FFD700", border: `1px solid ${session.status === "UPCOMING" ? "rgba(0,255,255,0.4)" : "rgba(255,215,0,0.4)"}`, borderRadius: 4, padding: "4px 10px" }}>
            {session.status}
          </span>
          {session.status === "UPCOMING" && <LiveStatusBadge roomSlug={slug} />}
          {session.winner && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
              Winner: <strong style={{ color: "#FFD700" }}>{session.winner}</strong>
            </span>
          )}
        </div>
      </header>

      {/* Participants */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 20 }}>
          PARTICIPANTS ({session.participants.length})
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
          {session.participants.map((name, i) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: name === session.winner ? `${session.color}12` : "rgba(255,255,255,0.02)", border: `1px solid ${name === session.winner ? session.color + "40" : "rgba(255,255,255,0.06)"}`, borderRadius: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.2)", minWidth: 22 }}>#{i + 1}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: name === session.winner ? session.color : "#fff" }}>
                {name === session.winner && "🏆 "}{name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 32 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {session.status === "UPCOMING" ? (
            <Link href="/live/world" style={{ padding: "10px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#00AABB)", borderRadius: 8, textDecoration: "none" }}>
              JOIN LIVE WHEN IT STARTS
            </Link>
          ) : (
            <Link href="/live/world" style={{ padding: "10px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.4)", borderRadius: 8, textDecoration: "none" }}>
              WATCH REPLAY
            </Link>
          )}
          <Link href="/dirty-dozens" style={{ padding: "10px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, textDecoration: "none" }}>
            ALL EPISODES
          </Link>
        </div>
      </div>
    </main>
  );
}
