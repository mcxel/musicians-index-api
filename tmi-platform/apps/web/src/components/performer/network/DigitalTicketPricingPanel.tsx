"use client";

/**
 * Digital ticket pricing — performer sets price; fixed TMI fee ladder (not %).
 * Review & Publish (creator) · optional TEST PURCHASE · physical stays Rule 17.
 */

import { useMemo, useState, type CSSProperties } from "react";
import {
  DIGITAL_TICKET_RECOMMENDED_MAX_CENTS,
  DIGITAL_TICKET_RECOMMENDED_MIN_CENTS,
  clampDigitalTicketPrice,
  isInRecommendedDigitalRange,
  quoteDigitalTicketClass,
  TICKET_FEE_POLICY_ID,
  type DigitalTicketClass,
} from "@/lib/tickets/digitalTicketPricing";

interface Props {
  accent?: string;
  eventId?: string;
}

export default function DigitalTicketPricingPanel({
  accent = "#00FFFF",
  eventId = "performer-digital-event",
}: Props) {
  const [general, setGeneral] = useState(299);
  const [vip, setVip] = useState(699);
  const [backstage, setBackstage] = useState(999);
  const [title, setTitle] = useState("Digital Broadcast Ticket");
  const [artworkUrl, setArtworkUrl] = useState("");
  const [capacity, setCapacity] = useState(100);
  const [offerId, setOfferId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const quotes = useMemo(() => {
    const classes: Array<{ id: DigitalTicketClass; cents: number }> = [
      { id: "general", cents: general },
      { id: "vip", cents: vip },
      { id: "backstage", cents: backstage },
    ];
    return classes.map((c) => quoteDigitalTicketClass({ classId: c.id, priceCents: c.cents }));
  }, [general, vip, backstage]);

  const primary = quotes[0];

  async function api(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/tickets/digital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action,
          offerId: offerId ?? undefined,
          id: offerId ?? undefined,
          eventId,
          title,
          artworkUrl: artworkUrl.trim() || null,
          artworkAssetId: artworkUrl.trim() ? `art:${artworkUrl.trim()}` : null,
          priceCents: general,
          capacity,
          ticketType: "general",
          ...extra,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data?.message ?? data?.error ?? "request_failed");
        return null;
      }
      if (data.offer?.id) setOfferId(data.offer.id);
      setStatus(
        action === "publish"
          ? "Published — buyers can purchase. You are on Review & Publish (not buyer checkout)."
          : action === "test_purchase"
            ? `TEST PURCHASE issued · ticket ${data.ticket?.id ?? ""}`
            : `Draft saved · ${data.offer?.id ?? ""}`,
      );
      return data;
    } catch {
      setStatus("network_error");
      return null;
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={section(accent)}>
      <header style={{ marginBottom: 12 }}>
        <div style={eyebrow(accent)}>Digital Tickets · {TICKET_FEE_POLICY_ID}</div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Performer-owned pricing</h2>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Recommended ${(DIGITAL_TICKET_RECOMMENDED_MIN_CENTS / 100).toFixed(2)}–
          ${(DIGITAL_TICKET_RECOMMENDED_MAX_CENTS / 100).toFixed(2)}. Fixed TMI fee ladder (min $0.75 /
          max $9.99) — not 20%. Physical venue tickets stay Venue/Promoter.
        </p>
      </header>

      <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ ...input, width: "100%" }} />
        </label>
        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          Artwork URL (live preview — no placeholder when set)
          <input
            value={artworkUrl}
            onChange={(e) => setArtworkUrl(e.target.value)}
            placeholder="https://…"
            style={{ ...input, width: "100%" }}
          />
        </label>
        {artworkUrl.trim() ? (
          <div
            style={{
              height: 120,
              borderRadius: 12,
              border: `1px solid ${accent}44`,
              background: `center/cover url(${artworkUrl.trim()})`,
            }}
          />
        ) : null}
        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          Capacity
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Math.max(1, Number(e.target.value) || 1))}
            style={input}
          />
        </label>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {(
          [
            { id: "general" as const, label: "General", value: general, set: setGeneral },
            { id: "vip" as const, label: "VIP", value: vip, set: setVip },
            { id: "backstage" as const, label: "Backstage", value: backstage, set: setBackstage },
          ] as const
        ).map((row) => {
          const q = quotes.find((x) => x.classId === row.id)!;
          const inRec = isInRecommendedDigitalRange(row.value);
          return (
            <div key={row.id} style={card(accent)}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{row.label}</div>
                  <div style={{ fontSize: 11, color: inRec ? accent : "#FFD700" }}>
                    {inRec ? "In recommended range" : "Outside recommended range (still allowed)"}
                  </div>
                </div>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  Seller price ($)
                  <input
                    type="number"
                    min={0.99}
                    step={0.5}
                    value={(row.value / 100).toFixed(2)}
                    onChange={(e) =>
                      row.set(clampDigitalTicketPrice(Math.round((Number(e.target.value) || 0) * 100)))
                    }
                    style={input}
                  />
                </label>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 8 }}>
                Seller {((q.fee.sellerPriceCents ?? q.priceCents) / 100).toFixed(2)} + TMI fee $
                {(q.fee.platformFeeCentsPerTicket / 100).toFixed(2)} = Buyer $
                {(q.fee.buyerTotalCentsPerTicket / 100).toFixed(2)} · You receive $
                {(q.fee.hostPayoutCentsPerTicket / 100).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, padding: 12, borderRadius: 12, border: `1px solid ${accent}33`, background: "rgba(0,0,0,0.25)" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: accent, marginBottom: 8 }}>
          REVIEW &amp; PUBLISH
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 10 }}>
          Buyer total ${(primary.fee.buyerTotalCentsPerTicket / 100).toFixed(2)} · Estimated payout $
          {(primary.fee.hostPayoutCentsPerTicket / 100).toFixed(2)} · Fee policy {TICKET_FEE_POLICY_ID}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" disabled={busy} onClick={() => void api("save")} style={btn(accent)}>
            Save Draft
          </button>
          <button type="button" disabled={busy} onClick={() => setPreviewOpen(true)} style={btn("#FFD700")}>
            Preview
          </button>
          <button type="button" disabled={busy} onClick={() => void api("publish")} style={btn("#00FF88")}>
            Review &amp; Publish
          </button>
          <button
            type="button"
            disabled={busy || !offerId}
            onClick={() => void api("test_purchase")}
            style={btn("#AA2DFF")}
          >
            TEST PURCHASE
          </button>
        </div>
        {status ? (
          <div style={{ marginTop: 10, fontSize: 11, color: "#86efac", fontFamily: "monospace" }}>{status}</div>
        ) : null}
      </div>

      {previewOpen ? (
        <div
          role="dialog"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(0,0,0,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(420px, 100%)",
              borderRadius: 16,
              border: `1px solid ${accent}55`,
              background: "#0a0714",
              padding: 18,
            }}
          >
            <div style={{ fontSize: 10, color: accent, fontWeight: 800, letterSpacing: "0.2em" }}>TICKET PREVIEW</div>
            <h3 style={{ margin: "8px 0" }}>{title}</h3>
            {artworkUrl.trim() ? (
              <div
                style={{
                  height: 160,
                  borderRadius: 12,
                  marginBottom: 12,
                  background: `center/cover url(${artworkUrl.trim()})`,
                }}
              />
            ) : (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>No artwork uploaded</div>
            )}
            <div style={{ fontSize: 13 }}>
              Seller ${(general / 100).toFixed(2)} + fee $
              {(primary.fee.platformFeeCentsPerTicket / 100).toFixed(2)} → Buyer $
              {(primary.fee.buyerTotalCentsPerTicket / 100).toFixed(2)}
            </div>
            <button type="button" onClick={() => setPreviewOpen(false)} style={{ ...btn(accent), marginTop: 14 }}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function section(accent: string): CSSProperties {
  return {
    background: "rgba(10,8,24,0.92)",
    border: `1px solid ${accent}33`,
    borderRadius: 16,
    padding: 18,
  };
}
function eyebrow(accent: string): CSSProperties {
  return {
    fontSize: 9,
    letterSpacing: "0.28em",
    color: accent,
    fontWeight: 800,
    textTransform: "uppercase",
    marginBottom: 4,
  };
}
function card(accent: string): CSSProperties {
  return {
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${accent}28`,
    background: "rgba(255,255,255,0.03)",
  };
}
function btn(color: string): CSSProperties {
  return {
    padding: "8px 14px",
    borderRadius: 8,
    border: `1px solid ${color}66`,
    background: `${color}22`,
    color,
    fontWeight: 800,
    fontSize: 11,
    letterSpacing: "0.08em",
    cursor: "pointer",
  };
}
const input: CSSProperties = {
  display: "block",
  marginTop: 4,
  width: 100,
  background: "rgba(0,0,0,0.35)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#fff",
  padding: "6px 8px",
  fontSize: 12,
};
