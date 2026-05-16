"use client";

import { useState } from "react";
import type { TicketRecord, TicketTier } from "@/lib/tickets/ticketCore";
import VenueTicketPrintShell from "@/components/tickets/VenueTicketPrintShell";

const TIERS: TicketTier[] = [
  "STANDARD", "VIP", "BACKSTAGE", "MEET_AND_GREET",
  "SPONSOR_GIFT", "SEASON_PASS", "BATTLE_PASS", "RAFFLE_PASS",
];

const TIER_PRICE: Record<TicketTier, number> = {
  STANDARD: 40, VIP: 150, BACKSTAGE: 250, MEET_AND_GREET: 200,
  SPONSOR_GIFT: 0, SEASON_PASS: 320, BATTLE_PASS: 180, RAFFLE_PASS: 25,
};

const TIER_COLORS: Record<string, string> = {
  VIP: "#FFD700", BACKSTAGE: "#FF2DAA", MEET_AND_GREET: "#AA2DFF",
  STANDARD: "#00FFFF", SEASON_PASS: "#f97316", BATTLE_PASS: "#ef4444",
  SPONSOR_GIFT: "#86efac", RAFFLE_PASS: "#c4b5fd",
};

type BuilderState = {
  tier: TicketTier;
  eventSlug: string;
  ownerId: string;
  faceScanId: string;
  venueLogo: string;
  sponsorLogo: string;
  eventBranding: string;
  faceValue: number;
};

export default function VenueTicketBuilderShell({ slug }: { slug: string }) {
  const [form, setForm] = useState<BuilderState>({
    tier: "STANDARD",
    eventSlug: `${slug}-event`,
    ownerId: "demo-user",
    faceScanId: "",
    venueLogo: slug,
    sponsorLogo: "",
    eventBranding: "",
    faceValue: 40,
  });
  const [status, setStatus] = useState<string>("");
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [building, setBuilding] = useState(false);

  function update<K extends keyof BuilderState>(key: K, val: BuilderState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleBuild() {
    setBuilding(true);
    setStatus("Building ticket...");
    setTicket(null);
    try {
      const res = await fetch("/api/tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: form.ownerId || "demo-user",
          venueSlug: slug,
          eventSlug: form.eventSlug,
          tier: form.tier,
          faceValue: form.faceValue,
          venueLogo: form.venueLogo || undefined,
          sponsorLogo: form.sponsorLogo || undefined,
          eventBranding: form.eventBranding || undefined,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setStatus(payload?.error ?? "build_failed");
      } else {
        setTicket(payload.ticket);
        setStatus(`Ticket minted · royalty split: creator ${payload.royalty?.creatorRoyaltyPct ?? 0}% · venue ${payload.royalty?.venueCutPct ?? 0}% · platform ${payload.royalty?.platformPct ?? 0}%`);
      }
    } catch {
      setStatus("network_error");
    } finally {
      setBuilding(false);
    }
  }

  const accent = TIER_COLORS[form.tier] ?? "#00FFFF";

  return (
    <div style={{ display: "grid", gridTemplateColumns: ticket ? "1fr 1fr" : "1fr", gap: 16, alignItems: "start" }}>
      {/* Builder form */}
      <section style={{ border: `1px solid ${accent}44`, borderRadius: 14, background: "linear-gradient(160deg, rgba(8,8,18,0.97), #0a0712)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ color: accent, fontSize: 11, fontWeight: 800, letterSpacing: "0.18em" }}>
          VENUE TICKET BUILDER · {slug.toUpperCase()}
        </div>

        {/* Tier selector */}
        <div>
          <div style={{ color: "#475569", fontSize: 9, letterSpacing: "0.1em", marginBottom: 6 }}>TICKET TIER</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {TIERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { update("tier", t); update("faceValue", TIER_PRICE[t]); }}
                style={{
                  borderRadius: 6,
                  border: `1px solid ${form.tier === t ? TIER_COLORS[t] : "#1e293b"}`,
                  background: form.tier === t ? `${TIER_COLORS[t]}18` : "transparent",
                  color: form.tier === t ? TIER_COLORS[t] : "#475569",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        {([
          ["EVENT SLUG", "eventSlug", "text", form.eventSlug],
          ["OWNER / USER ID", "ownerId", "text", form.ownerId],
          ["FACE SCAN ID (optional)", "faceScanId", "text", form.faceScanId],
          ["FACE VALUE ($)", "faceValue", "number", String(form.faceValue)],
        ] as [string, keyof BuilderState, string, string][]).map(([label, key, type, val]) => (
          <div key={key}>
            <div style={{ color: "#475569", fontSize: 9, letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
            <input
              type={type}
              value={val}
              min={type === "number" ? 0 : undefined}
              onChange={(e) => update(key, (type === "number" ? Number(e.target.value) : e.target.value) as BuilderState[typeof key])}
              style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: `1px solid #1e293b`, borderRadius: 7, color: "#e2e8f0", fontSize: 11, padding: "7px 10px" }}
            />
          </div>
        ))}

        {/* Branding */}
        <div style={{ borderTop: "1px solid #1e293b", paddingTop: 10 }}>
          <div style={{ color: "#475569", fontSize: 9, letterSpacing: "0.1em", marginBottom: 8 }}>TICKET SKIN BRANDING</div>
          <div style={{ display: "grid", gap: 8 }}>
            {([
              ["VENUE LOGO / NAME", "venueLogo", form.venueLogo],
              ["SPONSOR LOGO / NAME", "sponsorLogo", form.sponsorLogo],
              ["EVENT BRANDING TAG", "eventBranding", form.eventBranding],
            ] as [string, keyof BuilderState, string][]).map(([label, key, val]) => (
              <div key={key}>
                <div style={{ color: "#334155", fontSize: 8, letterSpacing: "0.08em", marginBottom: 3 }}>{label}</div>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => update(key, e.target.value as BuilderState[typeof key])}
                  style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: `1px solid #1e293b`, borderRadius: 6, color: "#94a3b8", fontSize: 10, padding: "5px 8px" }}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleBuild}
          disabled={building}
          style={{ borderRadius: 8, border: `1px solid ${accent}66`, background: `${accent}22`, color: accent, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", padding: "10px 0", cursor: building ? "not-allowed" : "pointer", opacity: building ? 0.6 : 1 }}
        >
          {building ? "MINTING..." : "MINT TICKET"}
        </button>

        {status && (
          <div style={{ color: ticket ? "#22c55e" : "#f87171", fontSize: 9, fontFamily: "monospace", wordBreak: "break-all" }}>
            {status}
          </div>
        )}
      </section>

      {/* Print shell */}
      {ticket && (
        <VenueTicketPrintShell
          ticket={ticket}
          branding={{ venueSlug: slug, venueName: slug.replace(/-/g, " ").toUpperCase() }}
          faceScanId={form.faceScanId || null}
        />
      )}
    </div>
  );
}
