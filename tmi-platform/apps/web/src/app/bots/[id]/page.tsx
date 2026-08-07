import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { BOT_ACCOUNT_REGISTRY, getBotById, type BotAccount } from "@/lib/bots/BotAccountRegistry";
import { getBotOperationsLog } from "@/lib/bots/permanentBotOperationsEngine";

interface Props {
  params: { id: string };
}

function resolveBot(id: string): BotAccount | undefined {
  const decoded = decodeURIComponent(id).trim();
  return (
    getBotById(decoded) ??
    BOT_ACCOUNT_REGISTRY.find((b) => b.slug === decoded || b.id === decoded)
  );
}

export function generateStaticParams() {
  return BOT_ACCOUNT_REGISTRY.map((b) => ({ id: b.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const bot = resolveBot(params.id);
  if (!bot) {
    return { title: "Bot not found" };
  }
  return {
    title: `[BOT] ${bot.displayName}`,
    description: `${bot.label} platform seat holder — ${bot.bio}`,
    robots: { index: false, follow: false },
  };
}

/**
 * Public lightweight bot identity page.
 * Rule 20: clearly labeled [BOT] — never presented as a human performer.
 * Journal lines come from real operations log only (honest empty if none).
 */
export default function BotProfilePage({ params }: Props) {
  const resolved = resolveBot(params.id);
  if (!resolved) {
    redirect("/admin/bots/observe");
  }
  const bot: BotAccount = resolved;

  const journal = getBotOperationsLog()
    .filter((entry) => entry.botId === bot.id || entry.botId === bot.slug)
    .slice(-12)
    .reverse();

  const seat = bot.assignments[0];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(165deg, #0a0614 0%, #050510 55%, #020208 100%)",
        color: "#fff",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "28px 18px 80px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 18, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Link
            href="/bots"
            style={{ fontSize: 11, fontWeight: 800, color: "#00FFFF", textDecoration: "none", letterSpacing: "0.08em" }}
          >
            ← BOT ENGINE
          </Link>
          <Link
            href={`/admin/bots/observe?botId=${encodeURIComponent(bot.id)}`}
            style={{ fontSize: 11, fontWeight: 800, color: "#FF2DAA", textDecoration: "none", letterSpacing: "0.08em" }}
          >
            Admin observe →
          </Link>
        </div>

        <div
          style={{
            borderRadius: 16,
            border: "1px solid rgba(0,255,255,0.28)",
            background: "linear-gradient(160deg, rgba(20,10,40,0.95), rgba(5,5,16,0.98))",
            padding: 22,
            boxShadow: "0 0 40px rgba(0,255,255,0.08)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.2em",
              color: "#FFD700",
              background: "rgba(255,215,0,0.12)",
              border: "1px solid rgba(255,215,0,0.4)",
              borderRadius: 999,
              padding: "4px 12px",
              marginBottom: 14,
            }}
          >
            {bot.label} SYSTEM ACTOR — NOT A HUMAN ACCOUNT
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bot.avatarUrl || "/images/tmi-placeholder.jpg"}
              alt=""
              width={88}
              height={88}
              style={{
                width: 88,
                height: 88,
                borderRadius: 14,
                objectFit: "cover",
                border: "2px solid rgba(0,255,255,0.45)",
                background: "#111",
              }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: "0.02em" }}>
                {bot.label} {bot.displayName}
              </h1>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                ID {bot.id} · status {bot.status}
                {seat ? ` · ${seat.category} #${seat.rankPosition}` : ""}
              </p>
            </div>
          </div>

          <p style={{ margin: "18px 0 0", fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,0.75)" }}>
            {bot.bio}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 10,
              marginTop: 18,
            }}
          >
            <Stat label="Tier" value={bot.tier} />
            <Stat label="Provisional XP" value={bot.provisionalScore.toLocaleString()} />
            <Stat label="Overtake at" value={bot.humanTakeoverThreshold.toLocaleString()} />
            <Stat label="Genres" value={bot.genres.join(", ") || "—"} />
          </div>
        </div>

        <section style={{ marginTop: 22 }}>
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: "#FF2DAA",
              textTransform: "uppercase",
            }}
          >
            NPC Journal
          </h2>
          {journal.length === 0 ? (
            <div
              style={{
                borderRadius: 12,
                border: "1px dashed rgba(255,255,255,0.18)",
                padding: 18,
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              No journal entries yet for this bot. Operations log is empty — honest empty state.
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {journal.map((entry) => (
                <li
                  key={entry.id}
                  style={{
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.08em" }}>
                    {entry.action}
                    {entry.blocked ? " · BLOCKED" : ""}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{entry.detail}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                    {new Date(entry.timestamp).toLocaleString()}
                    {entry.roomId ? ` · ${entry.roomId}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid rgba(255,215,0,0.2)",
        background: "rgba(255,215,0,0.06)",
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 800, color: "#FFD700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}
