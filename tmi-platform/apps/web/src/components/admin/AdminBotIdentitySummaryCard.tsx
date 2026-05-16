import Link from "next/link";
import { ensureSampleBotIdentityFaces } from "@/lib/bots/BotFaceGenerationEngine";
import { listBotFaceDuplicates, listBotFaceRegistryRecords } from "@/lib/bots/BotFaceRegistry";
import { ensureSampleFeederIdeas } from "@/lib/bots/CreativePromptFeederEngine";
import { listFeederIdeas } from "@/lib/bots/AssetIdeaQueueEngine";
import { listHumanReplacementQueue } from "@/lib/bots/HumanReplacementEngine";

export default function AdminBotIdentitySummaryCard() {
  ensureSampleBotIdentityFaces();
  if (listFeederIdeas().length === 0) ensureSampleFeederIdeas();

  const records = listBotFaceRegistryRecords();
  const duplicates = listBotFaceDuplicates();
  const ideas = listFeederIdeas();
  const replacementQueue = listHumanReplacementQueue();

  const metrics = [
    { label: "Bot Faces", value: records.length, color: "#00FFFF" },
    { label: "Duplicates", value: duplicates.length, color: "#FF2DAA" },
    { label: "Feeder Ideas", value: ideas.length, color: "#FFD700" },
    { label: "Replacement Queue", value: replacementQueue.length, color: "#00FF88" },
  ];

  const links = [
    { label: "Faces", href: "/admin/bots/faces" },
    { label: "Identities", href: "/admin/bots/identities" },
    { label: "Feeder Ideas", href: "/admin/bots/feeder-ideas" },
    { label: "Replacement Queue", href: "/admin/replacement-queue" },
    { label: "Lifecycle", href: "/admin/visual-lifecycle" },
  ];

  return (
    <div
      style={{
        border: "1px solid rgba(255,45,170,0.32)",
        borderRadius: 14,
        background: "linear-gradient(135deg, rgba(255,45,170,0.08), rgba(0,255,255,0.07))",
        padding: 16,
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "#FF2DAA", fontWeight: 800 }}>
            Bot Identity Face Generation
          </div>
          <div style={{ marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.66)" }}>
            Synthetic identities, duplicate prevention, feeder ideas, and replacement readiness.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8 }}>
        {metrics.map((metric) => (
          <div key={metric.label} style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, background: "rgba(0,0,0,0.24)", padding: 10 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{metric.label}</div>
            <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800, color: metric.color }}>{metric.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.24)",
              borderRadius: 8,
              padding: "6px 10px",
              color: "#fff",
              background: "rgba(255,255,255,0.05)",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
