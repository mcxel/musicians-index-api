"use client";

/**
 * FanTicketsDrawerPanel — thin presentation over GET /api/tickets/mine.
 * Rule 17: Fans own/buy tickets; Venues/Promoters own inventory.
 * Honest empty — never invent concerts, QRs, or upcoming events.
 */

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import type { TicketRecord } from "@/lib/tickets/ticketCore";

export default function FanTicketsDrawerPanel({
  accentColor = "#00D4FF",
}: {
  accentColor?: string;
}) {
  const [tickets, setTickets] = useState<TicketRecord[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tickets/mine", { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) {
          if (!cancelled) {
            setTickets([]);
            setError("Sign in to view your tickets.");
          }
          return;
        }
        if (!res.ok) throw new Error("fetch_failed");
        const data = (await res.json()) as TicketRecord[] | { tickets?: TicketRecord[] };
        const list = Array.isArray(data) ? data : data.tickets ?? [];
        if (!cancelled) {
          setTickets(list);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTickets([]);
          setError("Unable to load tickets.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div data-testid="fan-tickets-drawer" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accentColor }}>
        TICKETS & ORDERS
      </div>

      {tickets === null ? (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>Loading tickets…</p>
      ) : null}

      {error ? (
        <p style={{ fontSize: 11, color: "rgba(255,100,100,0.85)", margin: 0 }}>{error}</p>
      ) : null}

      {tickets !== null && tickets.length === 0 && !error ? (
        <>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
            You don&apos;t have any tickets yet.
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.5 }}>
            Tickets purchased from venues and promoters appear here. Ticket inventory is managed by
            Venues and Promoters only (Rule 17).
          </p>
        </>
      ) : null}

      {tickets !== null && tickets.length > 0 ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {tickets.slice(0, 12).map((ticket) => {
            const event = ticket.template?.eventSlug?.replace(/-/g, " ") ?? "Event";
            const venue = ticket.template?.venueSlug?.replace(/-/g, " ") ?? "";
            return (
              <li
                key={ticket.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${accentColor}33`,
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: ticket.redeemed ? "#FF9500" : "#00FF88" }}>
                  {ticket.redeemed ? "REDEEMED" : "ACTIVE"}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{event}</div>
                {venue ? <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{venue}</div> : null}
                <Link
                  href={`/tickets/print/${encodeURIComponent(ticket.id)}`}
                  style={{ fontSize: 10, color: accentColor, marginTop: 6, display: "inline-block" }}
                >
                  Open ticket →
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Link href="/fan/tickets" style={linkStyle(accentColor)}>
          My Tickets →
        </Link>
        <Link href="/events" style={linkStyle(`${accentColor}99`)}>
          Browse Events →
        </Link>
      </div>
    </div>
  );
}

function linkStyle(color: string): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color,
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${color}44`,
  };
}
