import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Battle Audio Formats | TMI",
  description: "How TMI battles work — acapella, bring your own beat, producer + MC, DJ + MC, beat submission, and more. Pick the right format for your style.",
};

const FORMATS = [
  {
    id: "acapella",
    icon: "🎤",
    color: "#FF2DAA",
    label: "Acapella Only",
    subtitle: "No instrumentals. Voice, breath, and body — nothing else.",
    who: "Vocalists, freestylers, beatboxers, spoken word artists",
    how: "Both performers enter with zero backing track. Crowd hears raw skill. No beat to hide behind. Judges score flow, breath control, lyricism, and presence.",
    tags: ["No Beat", "Voice Only", "Raw Skill"],
    cta: { href: "/battles/create?type=acapella-battle", label: "START ACAPELLA BATTLE" },
  },
  {
    id: "byob",
    icon: "🎵",
    color: "#00FFFF",
    label: "Bring Your Own Beat",
    subtitle: "Each performer brings their own backing track. Your beat. Your style.",
    who: "Rappers, singers, any performer who has their own sound",
    how: "Performer A plays their chosen instrumental, then performs. Performer B does the same with theirs. Judges and crowd compare the full package — beat + performance — as a unified presentation. No shared beat means no excuses.",
    tags: ["Self-Supplied Beat", "Full Package", "Any Genre"],
    cta: { href: "/battles/create?type=byob", label: "START BYOB BATTLE" },
  },
  {
    id: "producer-mc",
    icon: "🎛️",
    color: "#AA2DFF",
    label: "Producer + MC",
    subtitle: "Producer submits the beat. MC performs over it live. One team, one sound.",
    who: "Producer / MC duos or open-bracket collabs",
    how: "The producer uploads an original beat before the battle. The MC freestyles or performs written bars over that exact track during the live event. Both score together. If the chemistry hits, the crowd feels it. If it misses, they both lose.",
    tags: ["Collab Format", "Producer + Rapper", "Original Beat"],
    cta: { href: "/battles/create?type=producer-mc", label: "START PRODUCER + MC BATTLE" },
  },
  {
    id: "dj-mc",
    icon: "🎚️",
    color: "#FFD700",
    label: "DJ + MC",
    subtitle: "DJ plays a live set. MC freestyles over it in real time. Pure improvisation.",
    who: "DJs and MCs who want to show live chemistry",
    how: "The DJ controls the room — beat selection, transitions, drops. The MC has to match whatever comes. No rehearsed timing. No script. If the DJ throws a curveball, the MC adapts or gets washed. Crowd votes on the live energy.",
    tags: ["Live DJ Set", "Freestyle MC", "Real-Time Collab"],
    cta: { href: "/battles/create?type=dj-mc", label: "START DJ + MC BATTLE" },
  },
  {
    id: "beat-submission",
    icon: "🏆",
    color: "#00FF88",
    label: "Beat Submission Battle",
    subtitle: "No MCs. Both producers submit original beats. Judges vote on production alone.",
    who: "Beat makers, producers, instrumentalists",
    how: "Each producer uploads one original beat before the battle. No performance layer — just the music. Judge panel scores on composition, mix quality, creativity, arrangement, and replay value. The crowd also casts fan votes. Winner earns producer ranking XP.",
    tags: ["No MC Needed", "Production Only", "Beat vs Beat"],
    cta: { href: "/battles/create?type=beat-submission", label: "START BEAT SUBMISSION BATTLE" },
  },
  {
    id: "flip-battle",
    icon: "🔄",
    color: "#FF8800",
    label: "Sample Flip Battle",
    subtitle: "Same sample. Two producers. Completely different results.",
    who: "Producers who want to prove creativity over the same source material",
    how: "TMI provides a sample pack or single audio clip. Both producers get it simultaneously. Each builds an original beat around it — chopped, pitched, layered however they want. The flip is what matters. Judges hear both and vote blind.",
    tags: ["Same Sample", "Producer Creativity", "Blind Judge Vote"],
    cta: { href: "/battles/create?type=flip-battle", label: "START FLIP BATTLE" },
  },
];

const QUICK_GUIDE = [
  { rule: "Beat Optional", desc: "Performer can use a beat or go acapella — their choice each round." },
  { rule: "Beat Required", desc: "A backing track must be used. Acapella disqualifies the round." },
  { rule: "Acapella Only", desc: "Zero instrumentals. Any backing audio = immediate loss of that round." },
  { rule: "Live Instrument Only", desc: "Must perform on a real instrument live. No pre-recorded loops." },
  { rule: "Live Set Only", desc: "DJ must play live — no pre-mixed sets or pre-recorded transitions." },
  { rule: "Producer Submits Beat", desc: "Beat is uploaded before the battle. Cannot be changed during the event." },
];

export default function BattleFormatsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 100 }}>
      <section style={{ textAlign: "center", padding: "64px 24px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#AA2DFF", fontWeight: 800, marginBottom: 12 }}>
          TMI BATTLES — AUDIO FORMATS
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 900, marginBottom: 14 }}>
          Battle Format Guide
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 540, margin: "0 auto 28px", lineHeight: 1.7 }}>
          Battles on TMI are not one-size-fits-all. Rappers who bring their own beat compete differently than producers going head-to-head. Choose the format that matches your skill.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/battles/create" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "#FF2DAA", borderRadius: 8, textDecoration: "none" }}>
            CREATE A BATTLE
          </Link>
          <Link href="/battles/categories" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.4)", borderRadius: 8, textDecoration: "none" }}>
            ALL CATEGORIES
          </Link>
          <Link href="/battles" style={{ padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, textDecoration: "none" }}>
            LIVE BATTLES
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 980, margin: "0 auto", padding: "56px 24px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 32 }}>
          FORMAT BREAKDOWNS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {FORMATS.map(f => (
            <article key={f.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${f.color}20`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "28px 32px 24px", borderBottom: `1px solid ${f.color}12` }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 36, flexShrink: 0 }}>{f.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                      <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: f.color }}>{f.label}</h2>
                      <div style={{ display: "flex", gap: 6 }}>
                        {f.tags.map(t => (
                          <span key={t} style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", color: f.color, border: `1px solid ${f.color}40`, borderRadius: 4, padding: "2px 7px" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "#fff", fontWeight: 600, margin: "0 0 6px" }}>{f.subtitle}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0 }}>Best for: {f.who}</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: "20px 32px", display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                <p style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0, minWidth: 200 }}>{f.how}</p>
                <Link href={f.cta.href} style={{ flexShrink: 0, padding: "10px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: f.color, borderRadius: 8, textDecoration: "none", whiteSpace: "nowrap" }}>
                  {f.cta.label}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quick Reference */}
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 56px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 40 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 24 }}>
          AUDIO RULE QUICK REFERENCE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
          {QUICK_GUIDE.map(g => (
            <div key={g.rule} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#AA2DFF", marginBottom: 6 }}>{g.rule}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{g.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ textAlign: "center", padding: "0 24px 40px" }}>
        <Link href="/battles/create" style={{ padding: "14px 36px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius: 10, textDecoration: "none", display: "inline-block" }}>
          ⚔️ CREATE YOUR BATTLE
        </Link>
      </div>
    </main>
  );
}
