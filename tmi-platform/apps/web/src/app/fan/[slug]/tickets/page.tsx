"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getOwnedTickets,
  transferTicket,
  upgradeTicket,
  redeemTicket,
} from "@/lib/tickets/ticketEngine";
import { createTicket } from "@/lib/tickets/ticketEngine";
import TicketPrintEngine from "@/components/venues/TicketPrintEngine";
import type { TicketRecord } from "@/lib/tickets/ticketCore";

const TABS = [
  { label: "All Tickets",  href: "" },
  { label: "Active",       href: "/active" },
  { label: "History",      href: "/history" },
  { label: "NFT Passes",   href: "/nft" },
] as const;

const TIER_COLOR: Record<string, string> = {
  VIP:            "#fcd34d",
  STANDARD:       "#00FFFF",
  BACKSTAGE:      "#c4b5fd",
  MEET_AND_GREET: "#f97316",
  SPONSOR_GIFT:   "#22c55e",
  SEASON_PASS:    "#e879f9",
  BATTLE_PASS:    "#38bdf8",
  RAFFLE_PASS:    "#94a3b8",
};

function seedDemoTickets(slug: string): TicketRecord[] {
  const existing = getOwnedTickets(slug);
  if (existing.length > 0) return existing;
  return [
    createTicket({ ownerId: slug, venueSlug: "crown-stage",    eventSlug: "tmi-finale-s3",    tier: "VIP",      faceValue: 250 }),
    createTicket({ ownerId: slug, venueSlug: "electric-blue",  eventSlug: "cypher-night-12",  tier: "STANDARD", faceValue: 75  }),
    createTicket({ ownerId: slug, venueSlug: "pulse-arena",    eventSlug: "battle-royale-4",  tier: "BACKSTAGE",faceValue: 180 }),
  ];
}

export default function FanTicketWalletPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [tickets, setTickets] = useState<TicketRecord[]>(() => seedDemoTickets(slug));
  const [selected, setSelected] = useState<TicketRecord | null>(null);
  const [transferTo, setTransferTo] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  function refresh() { setTickets(getOwnedTickets(slug)); }

  function handleTransfer(ticketId: string) {
    if (!transferTo.trim()) return;
    try {
      transferTicket(ticketId, transferTo.trim());
      setMsg(`Transferred to ${transferTo}`);
      setTransferTo("");
      refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "transfer_failed");
    }
  }

  function handleUpgrade(ticketId: string) {
    try {
      upgradeTicket(ticketId, "VIP");
      setMsg("Upgraded to VIP");
      refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "upgrade_failed");
    }
  }

  function handleRedeem(ticketId: string) {
    try {
      redeemTicket(ticketId);
      setMsg("Ticket redeemed");
      refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "redeem_failed");
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#03020b", color: "#e2e8f0", padding: "0 0 40px" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(3,2,11,0.95)", borderBottom: "1px solid rgba(251,191,36,0.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href={`/fan/${slug}`} style={{ color: "#fcd34d", fontSize: 10, textDecoration: "none", border: "1px solid rgba(251,191,36,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← FAN HUB</Link>
        <strong style={{ color: "#fcd34d", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>TICKET WALLET</strong>
        <span style={{ color: "#64748b", fontSize: 10 }}>@{slug}</span>
        <span style={{ marginLeft: "auto", color: "#22c55e", fontSize: 10, fontWeight: 700 }}>{tickets.length} tickets</span>
      </header>

      <div style={{ padding: "14px 20px" }}>
        {/* Tab nav */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {TABS.map((tab) => (
            <Link
              key={tab.label}
              href={`/fan/${slug}/tickets${tab.href}`}
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: tab.href === "" ? "#fcd34d" : "#64748b",
                border: tab.href === "" ? "1px solid rgba(251,191,36,0.5)" : "1px solid rgba(100,116,139,0.25)",
                borderRadius: 6,
                padding: "4px 12px",
                textDecoration: "none",
                background: tab.href === "" ? "rgba(251,191,36,0.08)" : "transparent",
              }}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {msg && (
          <div style={{ border: "1px solid rgba(34,197,94,0.4)", borderRadius: 8, background: "rgba(5,46,22,0.3)", padding: "7px 12px", marginBottom: 12, fontSize: 10, color: "#86efac" }}>
            {msg} <button type="button" onClick={() => setMsg(null)} style={{ marginLeft: 8, background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 10 }}>×</button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: 14, alignItems: "start" }}>
          {/* Ticket list */}
          <div style={{ display: "grid", gap: 8 }}>
            {tickets.length === 0 && (
              <p style={{ color: "#475569", fontSize: 11, textAlign: "center", padding: "40px 0" }}>No tickets in wallet.</p>
            )}
            {tickets.map((ticket) => {
              const accent = TIER_COLOR[ticket.template.tier] ?? "#fcd34d";
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelected(selected?.id === ticket.id ? null : ticket)}
                  style={{
                    border: `1px solid ${selected?.id === ticket.id ? accent + "88" : accent + "33"}`,
                    borderRadius: 12,
                    background: selected?.id === ticket.id ? `${accent}0a` : "rgba(255,255,255,0.02)",
                    padding: 14,
                    cursor: "pointer",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    alignItems: "start",
                    transition: "all 0.15s",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent, boxShadow: `0 0 6px ${accent}`, display: "inline-block" }} />
                      <strong style={{ color: accent, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>{ticket.template.tier}</strong>
                      {ticket.redeemed && <span style={{ fontSize: 8, color: "#64748b", border: "1px solid rgba(100,116,139,0.3)", borderRadius: 3, padding: "1px 5px" }}>REDEEMED</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>
                      {ticket.template.eventSlug} · {ticket.template.venueSlug}
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: 9, color: "#475569", fontFamily: "monospace" }}>{ticket.id}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#f1f5f9" }}>${ticket.template.faceValue}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 9, color: "#64748b" }}>Row {ticket.seat.row} · {ticket.seat.seat}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected ticket detail */}
          {selected && (
            <div style={{ display: "grid", gap: 10, position: "sticky", top: 60 }}>
              <TicketPrintEngine ticket={selected} onPrinted={() => setMsg("Ticket sent to print")} />

              {!selected.redeemed && (
                <div style={{ border: "1px solid rgba(251,191,36,0.25)", borderRadius: 12, background: "rgba(0,0,0,0.4)", padding: 12, display: "grid", gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 10, color: "#fcd34d", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Actions</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      type="text"
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                      placeholder="Transfer to fan ID..."
                      style={{ flex: 1, background: "#0f172a", border: "1px solid rgba(148,163,184,0.25)", borderRadius: 6, color: "#e2e8f0", padding: "5px 9px", fontSize: 10 }}
                    />
                    <button type="button" onClick={() => handleTransfer(selected.id)} style={{ borderRadius: 6, border: "1px solid rgba(251,191,36,0.4)", background: "rgba(120,53,15,0.35)", color: "#fde68a", fontSize: 9, fontWeight: 700, padding: "5px 10px", cursor: "pointer" }}>TRANSFER</button>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {selected.template.tier !== "VIP" && (
                      <button type="button" onClick={() => handleUpgrade(selected.id)} style={{ flex: 1, borderRadius: 6, border: "1px solid rgba(168,85,247,0.4)", background: "rgba(44,14,69,0.35)", color: "#c4b5fd", fontSize: 9, fontWeight: 700, padding: "5px 0", cursor: "pointer" }}>UPGRADE TO VIP</button>
                    )}
                    <button type="button" onClick={() => handleRedeem(selected.id)} style={{ flex: 1, borderRadius: 6, border: "1px solid rgba(34,197,94,0.4)", background: "rgba(5,46,22,0.35)", color: "#86efac", fontSize: 9, fontWeight: 700, padding: "5px 0", cursor: "pointer" }}>REDEEM</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
