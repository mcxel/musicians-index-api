"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

// QR scan destination — tmi.app/ticket/verify/[ticketId]
// This is where the QR code on every printed/digital ticket points.
// Venue staff scan the QR to verify and redeem tickets at the door.

interface TicketVerifyData {
  id: string;
  status: "valid" | "redeemed" | "not_found" | "invalid";
  tier: string;
  eventSlug: string;
  venueSlug: string;
  mintedAt?: string;
}

const STATUS_COLORS: Record<string, string> = {
  valid:     "#00FF88",
  redeemed:  "#FF9500",
  not_found: "#FF4444",
  invalid:   "#FF4444",
};

const STATUS_LABEL: Record<string, string> = {
  valid:     "VALID — ADMIT",
  redeemed:  "ALREADY REDEEMED",
  not_found: "TICKET NOT FOUND",
  invalid:   "INVALID TICKET",
};

const STATUS_ICON: Record<string, string> = {
  valid:     "✅",
  redeemed:  "⚠️",
  not_found: "❌",
  invalid:   "❌",
};

export default function TicketVerifyPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = use(params);
  const [data, setData] = useState<TicketVerifyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeemStatus, setRedeemStatus] = useState<
    "idle" | "redeeming" | "done" | "error"
  >("idle");
  const [redeemMsg, setRedeemMsg] = useState("");

  useEffect(() => {
    if (!ticketId) return;
    setLoading(true);

    fetch("/api/tickets/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.valid) {
          const reason: string = json.reason ?? "";
          const status: TicketVerifyData["status"] =
            reason === "ticket_not_found"
              ? "not_found"
              : reason === "already_redeemed"
              ? "redeemed"
              : "invalid";
          setData({ id: ticketId, status, tier: "—", eventSlug: "—", venueSlug: "—" });
          return;
        }

        // Valid — enrich with ticket details from print endpoint
        fetch(`/api/tickets/${encodeURIComponent(ticketId)}/print`, {
          cache: "no-store",
        })
          .then(async (r) => {
            const payload = r.ok ? await r.json().catch(() => ({})) : {};
            const t = payload.ticket as {
              template?: { tier?: string; eventSlug?: string; venueSlug?: string };
              mintedAt?: string;
            } | undefined;
            setData({
              id: ticketId,
              status: "valid",
              tier: t?.template?.tier ?? "STANDARD",
              eventSlug: t?.template?.eventSlug ?? "—",
              venueSlug: t?.template?.venueSlug ?? "—",
              mintedAt: t?.mintedAt,
            });
          })
          .catch(() => {
            setData({ id: ticketId, status: "valid", tier: "—", eventSlug: "—", venueSlug: "—" });
          });
      })
      .catch(() => {
        setData({ id: ticketId, status: "not_found", tier: "—", eventSlug: "—", venueSlug: "—" });
      })
      .finally(() => setLoading(false));
  }, [ticketId]);

  async function handleRedeem() {
    setRedeemStatus("redeeming");
    setRedeemMsg("");
    try {
      const res = await fetch("/api/tickets/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, gate: "VERIFY_QR" }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.allowed !== false) {
        setRedeemStatus("done");
        setRedeemMsg("Ticket marked as redeemed. Entry granted.");
        setData((prev) => (prev ? { ...prev, status: "redeemed" } : prev));
      } else {
        setRedeemStatus("error");
        setRedeemMsg(json.reason ?? json.error ?? "Unable to redeem ticket.");
      }
    } catch {
      setRedeemStatus("error");
      setRedeemMsg("Network error — unable to process redemption.");
    }
  }

  const statusColor = data ? (STATUS_COLORS[data.status] ?? "#FF4444") : "#555";
  const statusLabel = data ? (STATUS_LABEL[data.status] ?? "UNKNOWN") : "";
  const statusIcon  = data ? (STATUS_ICON[data.status]  ?? "❓")      : "";

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050510",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.2em",
            }}
          >
            VERIFYING TICKET…
          </div>
        </div>
      </main>
    );
  }

  const rows = data
    ? [
        { label: "TICKET ID", value: data.id },
        { label: "TIER",      value: data.tier.replace(/_/g, " ") },
        { label: "EVENT",     value: data.eventSlug.replace(/-/g, " ") },
        { label: "VENUE",     value: data.venueSlug.replace(/-/g, " ") },
        ...(data.mintedAt
          ? [{ label: "ISSUED", value: new Date(data.mintedAt).toLocaleDateString() }]
          : []),
      ]
    : [];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050510",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        paddingBottom: 60,
      }}
    >
      <nav
        style={{
          background: "rgba(0,0,0,0.85)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Link
          href="/home/1"
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: "#00FFFF",
            textDecoration: "none",
            letterSpacing: "0.15em",
          }}
        >
          TMI
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
          Ticket Verification
        </span>
      </nav>

      <div style={{ maxWidth: 540, margin: "40px auto", padding: "0 20px" }}>
        {/* Status badge */}
        <div
          style={{
            padding: "28px",
            background: `${statusColor}08`,
            border: `2px solid ${statusColor}44`,
            borderRadius: 20,
            textAlign: "center",
            marginBottom: 24,
            boxShadow: `0 0 40px ${statusColor}18`,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>{statusIcon}</div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              color: statusColor,
              fontWeight: 900,
              marginBottom: 8,
            }}
          >
            TICKET STATUS
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: statusColor,
              marginBottom: 4,
            }}
          >
            {statusLabel}
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.4)",
              marginTop: 8,
            }}
          >
            {ticketId}
          </div>
        </div>

        {/* Ticket details — skip when ticket not found */}
        {data && data.status !== "not_found" && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "20px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.3em",
                color: "rgba(255,255,255,0.3)",
                fontWeight: 800,
                marginBottom: 14,
              }}
            >
              TICKET DETAILS
            </div>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
            >
              {rows.map(({ label, value }) => (
                <div key={label}>
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 900,
                      letterSpacing: "0.15em",
                      color: "rgba(255,255,255,0.3)",
                      marginBottom: 4,
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    {value || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Redeem button — only for valid tickets not yet redeemed */}
        {data?.status === "valid" && redeemStatus === "idle" && (
          <button
            onClick={handleRedeem}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #00FF88, #00FFFF)",
              border: "none",
              borderRadius: 12,
              color: "#050510",
              fontSize: 13,
              fontWeight: 900,
              cursor: "pointer",
              letterSpacing: "0.1em",
              marginBottom: 12,
            }}
          >
            ✅ MARK AS REDEEMED — ADMIT HOLDER
          </button>
        )}

        {redeemStatus === "redeeming" && (
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              color: "#00FF88",
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            Processing redemption…
          </div>
        )}

        {(redeemStatus === "done" || redeemStatus === "error") && (
          <div
            style={{
              padding: "14px 16px",
              background:
                redeemStatus === "done"
                  ? "rgba(0,255,136,0.08)"
                  : "rgba(255,68,68,0.08)",
              border: `1px solid ${
                redeemStatus === "done"
                  ? "rgba(0,255,136,0.3)"
                  : "rgba(255,68,68,0.3)"
              }`,
              borderRadius: 10,
              fontSize: 12,
              color: redeemStatus === "done" ? "#00FF88" : "#FF4444",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {redeemMsg}
          </div>
        )}

        {/* Navigation */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}
        >
          <Link
            href="/tickets/scanner"
            style={{
              display: "block",
              padding: "12px",
              background: "rgba(0,255,255,0.06)",
              border: "1px solid rgba(0,255,255,0.2)",
              borderRadius: 10,
              color: "#00FFFF",
              fontSize: 11,
              fontWeight: 800,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            📷 Scan Another
          </Link>
          <Link
            href="/tickets/validate"
            style={{
              display: "block",
              padding: "12px",
              background: "rgba(170,45,255,0.06)",
              border: "1px solid rgba(170,45,255,0.2)",
              borderRadius: 10,
              color: "#AA2DFF",
              fontSize: 11,
              fontWeight: 800,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            🎫 Manual Validate
          </Link>
        </div>

        {/* Venue staff note */}
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "rgba(255,215,0,0.04)",
            border: "1px solid rgba(255,215,0,0.15)",
            borderRadius: 10,
            fontSize: 10,
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: "#FFD700", fontWeight: 800 }}>Venue Staff:</span>{" "}
          This is the QR scan destination for all TMI tickets. Scan the QR code
          on any printed or digital ticket to verify and redeem at the door. For
          bulk scanning use the{" "}
          <Link
            href="/tickets/scanner"
            style={{ color: "#FFD700", fontWeight: 700, textDecoration: "none" }}
          >
            Camera Scanner
          </Link>
          .
        </div>
      </div>
    </main>
  );
}
