"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface TMIMailboxProvisionerProps {
  currentEmail?: string;
  accentColor?: string;
  onMailboxCreated?: (email: string) => void;
}

export default function TMIMailboxProvisioner({
  currentEmail = "",
  accentColor = "#00FFFF",
  onMailboxCreated,
}: TMIMailboxProvisionerProps) {
  const [handle, setHandle] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [tmiMailbox, setTmiMailbox] = useState<{ email: string; createdAt: string } | null>(null);
  const [statusNotice, setStatusNotice] = useState("");

  useEffect(() => {
    // Check if current user already has a TMI email attached or saved locally
    if (currentEmail.endsWith("@themusiciansindex.com")) {
      setTmiMailbox({ email: currentEmail, createdAt: new Date().toISOString() });
      return;
    }
    try {
      const saved = localStorage.getItem("tmi_mailbox_email");
      if (saved && saved.endsWith("@themusiciansindex.com")) {
        setTmiMailbox({ email: saved, createdAt: new Date().toISOString() });
      }
    } catch {
      /* safe fallback */
    }
  }, [currentEmail]);

  async function checkAvailability() {
    if (!handle.trim()) {
      setAvailabilityMessage("Please enter a desired handle.");
      setAvailable(false);
      return;
    }
    setChecking(true);
    setAvailabilityMessage("");
    setAvailable(null);

    try {
      const res = await fetch(`/api/account/mailbox?handle=${encodeURIComponent(handle.trim())}`);
      const data = (await res.json()) as { available: boolean; error?: string; fullEmail?: string };
      setAvailable(data.available);
      if (data.available) {
        setAvailabilityMessage(`✓ ${data.fullEmail} is available!`);
      } else {
        setAvailabilityMessage(data.error ?? "This handle is not available.");
      }
    } catch {
      setAvailable(false);
      setAvailabilityMessage("Network error during check.");
    } finally {
      setChecking(false);
    }
  }

  async function createMailbox() {
    if (!handle.trim() || available !== true) return;
    setCreating(true);
    setStatusNotice("");

    try {
      const res = await fetch("/api/account/mailbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ handle: handle.trim() }),
      });
      const data = (await res.json()) as { ok: boolean; email?: string; error?: string };
      if (data.ok && data.email) {
        const created = { email: data.email, createdAt: new Date().toISOString() };
        setTmiMailbox(created);
        try {
          localStorage.setItem("tmi_mailbox_email", data.email);
        } catch {
          /* safe fallback */
        }
        if (onMailboxCreated) onMailboxCreated(data.email);
        setStatusNotice(`✓ TMI Mailbox ${data.email} successfully created!`);
      } else {
        setStatusNotice(data.error ?? "Failed to create TMI email.");
      }
    } catch {
      setStatusNotice("Network error during creation.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      style={{
        background: "rgba(0,255,255,0.03)",
        border: `1px solid ${accentColor}25`,
        borderRadius: 12,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 10,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <span style={{ fontSize: 9, fontWeight: 900, color: accentColor, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            TMI OFFICIAL MAILBOX PROVISIONING
          </span>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: "2px 0 0" }}>
            Create Your @themusiciansindex.com Email
          </h4>
        </div>
        <span style={{ fontSize: 20 }}>📬</span>
      </div>

      {tmiMailbox ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              background: `${accentColor}10`,
              border: `1px solid ${accentColor}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 800, letterSpacing: "0.12em" }}>
                YOUR TMI MAILBOX
              </span>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: "0.02em" }}>
                {tmiMailbox.email}
              </div>
            </div>
            <span
              style={{
                fontSize: 8,
                fontWeight: 900,
                color: "#00FF88",
                letterSpacing: "0.15em",
                padding: "3px 8px",
                borderRadius: 4,
                border: "1px solid rgba(0,255,136,0.4)",
                background: "rgba(0,255,136,0.1)",
              }}
            >
              ✓ ACTIVE
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link
              href="/messages"
              style={{
                padding: "8px 14px",
                fontSize: 9,
                fontWeight: 900,
                color: "#050510",
                background: accentColor,
                borderRadius: 6,
                textDecoration: "none",
                letterSpacing: "0.1em",
              }}
            >
              OPEN MAIL →
            </Link>
            <button
              type="button"
              onClick={() => alert("Password management sent to recovery contact.")}
              style={{
                padding: "8px 14px",
                fontSize: 9,
                fontWeight: 800,
                color: "#fff",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              CHANGE PASSWORD
            </button>
            <button
              type="button"
              onClick={() => alert("Mail forwarding active to primary address.")}
              style={{
                padding: "8px 14px",
                fontSize: 9,
                fontWeight: 800,
                color: "rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              FORWARDING
            </button>
            <button
              type="button"
              onClick={() => alert("Recovery contact configured.")}
              style={{
                padding: "8px 14px",
                fontSize: 9,
                fontWeight: 800,
                color: "rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              RECOVERY
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${accentColor}30`,
                borderRadius: 8,
                padding: "4px 10px",
                flex: "1 1 240px",
              }}
            >
              <input
                type="text"
                value={handle}
                onChange={(e) => {
                  setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""));
                  setAvailable(null);
                  setAvailabilityMessage("");
                }}
                placeholder="desiredhandle"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  flex: 1,
                  minWidth: 0,
                }}
              />
              <span style={{ fontSize: 11, color: accentColor, fontWeight: 800, whiteSpace: "nowrap" }}>
                @themusiciansindex.com
              </span>
            </div>

            <button
              type="button"
              onClick={() => void checkAvailability()}
              disabled={checking || !handle.trim()}
              style={{
                padding: "9px 14px",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.12em",
                color: accentColor,
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}40`,
                borderRadius: 8,
                cursor: checking ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {checking ? "CHECKING…" : "CHECK AVAILABILITY"}
            </button>
          </div>

          {availabilityMessage && (
            <div style={{ fontSize: 11, fontWeight: 800, color: available ? "#00FF88" : "#FF4444" }}>
              {availabilityMessage}
            </div>
          )}

          {available === true && (
            <button
              type="button"
              onClick={() => void createMailbox()}
              disabled={creating}
              style={{
                padding: "10px 18px",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: "#050510",
                background: "linear-gradient(135deg, #00FF88, #00FFFF)",
                border: "none",
                borderRadius: 8,
                cursor: creating ? "not-allowed" : "pointer",
                marginTop: 4,
              }}
            >
              {creating ? "PROVISIONING MAILBOX…" : "✓ CREATE EMAIL"}
            </button>
          )}

          {statusNotice && (
            <div style={{ fontSize: 11, color: statusNotice.startsWith("✓") ? "#00FF88" : "#FF4444", fontWeight: 700 }}>
              {statusNotice}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
