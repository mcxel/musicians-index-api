"use client";

/**
 * PrivateLobbyCanister — Rule 15 canonical canister.
 * Shows the invite-only private lobby for a performer/venue.
 * Accessible from performer profile + messaging per Rule 15.
 * Routes through LobbyEntryFlow.
 */

import Link from "next/link";

interface PrivateLobbyCanisterProps {
  entityId: string;
  entityName?: string;
  accentColor?: string;
  /** Route of the private lobby to join. Defaults to /live/lobby?type=private */
  lobbyRoute?: string;
}

export function PrivateLobbyCanister({
  entityId,
  entityName,
  accentColor = "#AA2DFF",
  lobbyRoute,
}: PrivateLobbyCanisterProps) {
  const route = lobbyRoute
    ? `${lobbyRoute}?from=private-lobby`
    : `/live/lobby?entity=${entityId}&type=private&from=private-lobby`;

  return (
    <div style={{
      background: "rgba(255,255,255,0.015)",
      border: `1px solid ${accentColor}22`,
      borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 18px",
        borderBottom: `1px solid ${accentColor}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
            🔒 PRIVATE LOBBY {entityName ? `— ${entityName.toUpperCase()}` : ""}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
            Invite-only — you need an invitation to enter.
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 18px 20px" }}>
        {/* VIP access info */}
        <div style={{
          padding: "14px 16px",
          background: `${accentColor}08`,
          border: `1px solid ${accentColor}22`,
          borderRadius: 10,
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: accentColor, marginBottom: 6 }}>
            🔑 Private Access
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: 10 }}>
            This lobby is invite-only. Members receive a personal invite link
            from {entityName ?? "the host"}. You can also request access through messaging.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link
              href={route}
              style={{
                padding: "8px 18px", borderRadius: 8,
                background: accentColor, color: "#050310",
                fontSize: 10, fontWeight: 900, letterSpacing: "0.08em",
                textDecoration: "none",
              }}
            >
              ENTER PRIVATE LOBBY
            </Link>
            <Link
              href={`/messages/new?recipientId=${entityId}&name=${encodeURIComponent(entityName ?? entityId)}&subject=Private+Lobby+Access`}
              style={{
                padding: "8px 18px", borderRadius: 8,
                background: "transparent",
                border: `1px solid ${accentColor}44`,
                color: accentColor,
                fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                textDecoration: "none",
              }}
            >
              REQUEST ACCESS
            </Link>
          </div>
        </div>

        {/* Perks list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { icon: "🎙️", text: "Exclusive live performances for members only" },
            { icon: "💬", text: "Direct chat with the artist" },
            { icon: "🎁", text: "Early access to new releases and drops" },
          ].map((perk) => (
            <div
              key={perk.text}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                fontSize: 11, color: "rgba(255,255,255,0.5)",
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{perk.icon}</span>
              <span>{perk.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PrivateLobbyCanister;
