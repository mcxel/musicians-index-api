"use client";

import Link from "next/link";
import { BOT_ACCOUNT_REGISTRY, type BotAccount, type BotAccountStatus } from "@/lib/bots/BotAccountRegistry";

const STATUS_DOT: Record<BotAccountStatus, string> = {
  ACTIVE: "#00FF88",
  DISPLACED: "#AA2DFF",
  RETIRED: "rgba(255,255,255,0.3)",
};

const STATUS_LABEL: Record<BotAccountStatus, string> = {
  ACTIVE: "ACTIVE",
  DISPLACED: "DISPLACED BY HUMAN",
  RETIRED: "RETIRED",
};

function seatSafetyLabel(bot: BotAccount): string {
  if (bot.status !== "ACTIVE") return "—";
  const gap = bot.humanTakeoverThreshold - bot.provisionalScore;
  if (gap <= 0) return "Overtakeable now";
  return `${gap.toLocaleString()} XP to overtake`;
}

export default function BotSummonDeck() {
  const activeCount = BOT_ACCOUNT_REGISTRY.filter((b) => b.status === "ACTIVE").length;
  const displacedCount = BOT_ACCOUNT_REGISTRY.filter((b) => b.status === "DISPLACED").length;
  const retiredCount = BOT_ACCOUNT_REGISTRY.filter((b) => b.status === "RETIRED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "'Inter', sans-serif", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 2px", fontSize: 8, fontWeight: 800, letterSpacing: "0.08em" }}>
        <span style={{ color: "#00FF88" }}>{activeCount} ACTIVE</span>
        <span style={{ color: "#AA2DFF" }}>{displacedCount} DISPLACED</span>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>{retiredCount} RETIRED</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", flex: 1, minHeight: 0 }}>
        {BOT_ACCOUNT_REGISTRY.map((bot) => (
          <Link
            key={bot.id}
            href={bot.profileRoute}
            prefetch={false}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 8px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)",
              textDecoration: "none",
              opacity: bot.status === "RETIRED" ? 0.5 : 1,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_DOT[bot.status], flexShrink: 0 }} />
            <img
              src={bot.avatarUrl}
              alt=""
              width={20}
              height={20}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/tmi-placeholder.jpg"; }}
              style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                [BOT] {bot.displayName}
              </span>
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>
                {bot.assignments[0] ? `${bot.assignments[0].category} #${bot.assignments[0].rankPosition}` : "unassigned"} · {STATUS_LABEL[bot.status]}
              </span>
            </div>
            <span style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", flexShrink: 0 }}>
              {seatSafetyLabel(bot)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
