"use client";

import { useState } from "react";

type Gift = {
  id: string;
  name: string;
  type: "merch" | "experience" | "digital" | "cash-voucher";
  quantity: number;
  claimed: number;
  assignedTo: string;
  tier: "vip" | "general" | "all";
  expiresAt: string;
};

type Giveaway = {
  id: string;
  title: string;
  prize: string;
  entries: number;
  endsAt: string;
  status: "active" | "ended" | "pending";
};

const SEED_GIFTS: Gift[] = [
  { id: "gift-001", name: "Limited Edition Hoodie", type: "merch", quantity: 50, claimed: 23, assignedTo: "crown-stage", tier: "vip", expiresAt: "2026-07-01" },
  { id: "gift-002", name: "Backstage Meet & Greet Pass", type: "experience", quantity: 10, claimed: 7, assignedTo: "all-venues", tier: "vip", expiresAt: "2026-06-15" },
  { id: "gift-003", name: "Digital NFT Pack x3", type: "digital", quantity: 200, claimed: 84, assignedTo: "pulse-arena", tier: "general", expiresAt: "2026-08-31" },
  { id: "gift-004", name: "$25 Merch Voucher", type: "cash-voucher", quantity: 100, claimed: 41, assignedTo: "all-venues", tier: "all", expiresAt: "2026-09-01" },
];

const SEED_GIVEAWAYS: Giveaway[] = [
  { id: "gw-001", title: "Grand Prize Raffle — VIP Weekend", prize: "3-Day VIP Access + Hotel", entries: 1847, endsAt: "2026-05-31", status: "active" },
  { id: "gw-002", title: "Front Row Flash Giveaway", prize: "2x Front Row Seats", entries: 432, endsAt: "2026-04-30", status: "ended" },
];

const TYPE_COLORS: Record<Gift["type"], string> = {
  merch: "#f97316",
  experience: "#AA2DFF",
  digital: "#00FFFF",
  "cash-voucher": "#fcd34d",
};

export default function GiftsRail({ sponsorSlug }: { sponsorSlug: string }) {
  const [gifts, setGifts] = useState<Gift[]>(SEED_GIFTS);
  const [giveaways, setGiveaways] = useState<Giveaway[]>(SEED_GIVEAWAYS);
  const [tab, setTab] = useState<"gifts" | "giveaways">("gifts");
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [showGwForm, setShowGwForm] = useState(false);
  const [giftName, setGiftName] = useState("");
  const [giftQty, setGiftQty] = useState("25");
  const [gwTitle, setGwTitle] = useState("");
  const [gwPrize, setGwPrize] = useState("");

  function assignGift(name: string, qty: number) {
    const gift: Gift = {
      id: `gift-${Date.now()}`,
      name,
      type: "merch",
      quantity: qty,
      claimed: 0,
      assignedTo: sponsorSlug,
      tier: "general",
      expiresAt: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
    };
    setGifts(prev => [gift, ...prev]);
    setGiftName("");
    setGiftQty("25");
    setShowGiftForm(false);
  }

  function createGiveaway(title: string, prize: string) {
    if (!title.trim() || !prize.trim()) return;
    const gw: Giveaway = {
      id: `gw-${Date.now()}`,
      title,
      prize,
      entries: 0,
      endsAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: "pending",
    };
    setGiveaways(prev => [gw, ...prev]);
    setGwTitle("");
    setGwPrize("");
    setShowGwForm(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #1e293b", paddingBottom: 8 }}>
        {(["gifts", "giveaways"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "rgba(170,45,255,0.2)" : "transparent", border: `1px solid ${tab === t ? "#AA2DFF" : "#334155"}`, borderRadius: 6, color: tab === t ? "#c4b5fd" : "#64748b", fontSize: 10, padding: "4px 14px", cursor: "pointer", fontWeight: 700, textTransform: "uppercase" }}>
            {t}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <button onClick={() => { setShowGiftForm(tab === "gifts" && !showGiftForm); setShowGwForm(tab === "giveaways" && !showGwForm); }} style={{ background: "rgba(170,45,255,0.12)", border: "1px solid rgba(170,45,255,0.4)", borderRadius: 6, color: "#c4b5fd", fontSize: 10, padding: "4px 12px", cursor: "pointer", fontWeight: 700 }}>
            + ADD
          </button>
        </div>
      </div>

      {tab === "gifts" && (
        <>
          {showGiftForm && (
            <div style={{ background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ color: "#c4b5fd", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em" }}>ASSIGN GIFT</div>
              <input value={giftName} onChange={e => setGiftName(e.target.value)} placeholder="Gift name" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #334155", borderRadius: 5, color: "#e2e8f0", padding: "6px 10px", fontSize: 12, outline: "none" }} />
              <input value={giftQty} onChange={e => setGiftQty(e.target.value)} type="number" placeholder="Quantity" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #334155", borderRadius: 5, color: "#e2e8f0", padding: "6px 10px", fontSize: 12, outline: "none" }} />
              <button onClick={() => assignGift(giftName, parseInt(giftQty) || 25)} style={{ background: "rgba(170,45,255,0.2)", border: "1px solid #AA2DFF", borderRadius: 6, color: "#c4b5fd", fontSize: 11, padding: "7px 0", cursor: "pointer", fontWeight: 700 }}>
                ASSIGN GIFT
              </button>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {gifts.map(gift => {
              const pct = Math.round((gift.claimed / gift.quantity) * 100);
              return (
                <div key={gift.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${TYPE_COLORS[gift.type]}33`, borderRadius: 10, padding: "11px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{gift.name}</div>
                      <div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>{gift.assignedTo} · {gift.tier.toUpperCase()} tier · expires {gift.expiresAt}</div>
                    </div>
                    <span style={{ background: `${TYPE_COLORS[gift.type]}22`, border: `1px solid ${TYPE_COLORS[gift.type]}55`, borderRadius: 4, color: TYPE_COLORS[gift.type], fontSize: 9, padding: "2px 7px", fontWeight: 700, height: "fit-content" }}>
                      {gift.type.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: TYPE_COLORS[gift.type], borderRadius: 2 }} />
                    </div>
                    <span style={{ color: "#94a3b8", fontSize: 10, whiteSpace: "nowrap" }}>{gift.claimed}/{gift.quantity} claimed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "giveaways" && (
        <>
          {showGwForm && (
            <div style={{ background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ color: "#c4b5fd", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em" }}>CREATE GIVEAWAY</div>
              <input value={gwTitle} onChange={e => setGwTitle(e.target.value)} placeholder="Giveaway title" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #334155", borderRadius: 5, color: "#e2e8f0", padding: "6px 10px", fontSize: 12, outline: "none" }} />
              <input value={gwPrize} onChange={e => setGwPrize(e.target.value)} placeholder="Prize description" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #334155", borderRadius: 5, color: "#e2e8f0", padding: "6px 10px", fontSize: 12, outline: "none" }} />
              <button onClick={() => createGiveaway(gwTitle, gwPrize)} style={{ background: "rgba(170,45,255,0.2)", border: "1px solid #AA2DFF", borderRadius: 6, color: "#c4b5fd", fontSize: 11, padding: "7px 0", cursor: "pointer", fontWeight: 700 }}>
                CREATE GIVEAWAY
              </button>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {giveaways.map(gw => (
              <div key={gw.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${gw.status === "active" ? "#22c55e" : "#33415533"}`, borderRadius: 10, padding: "11px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{gw.title}</div>
                  <span style={{ background: gw.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(100,116,139,0.15)", border: `1px solid ${gw.status === "active" ? "#22c55e55" : "#33415555"}`, borderRadius: 4, color: gw.status === "active" ? "#22c55e" : "#64748b", fontSize: 9, padding: "2px 7px", fontWeight: 700 }}>
                    {gw.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ color: "#94a3b8", fontSize: 11 }}>Prize: {gw.prize}</div>
                <div style={{ color: "#64748b", fontSize: 10, marginTop: 4 }}>{gw.entries.toLocaleString()} entries · ends {gw.endsAt}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
