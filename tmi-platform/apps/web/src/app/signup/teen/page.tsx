"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { teenAccountEngine, type TeenAccountRole } from "@/lib/auth/TeenAccountEngine";
import { Chevron } from "@/components/ui/Chevron";

export default function TeenSignupPage() {
  const [role, setRole] = useState<TeenAccountRole>("fan_teen");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirthIso, setDateOfBirthIso] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [safetyLevel, setSafetyLevel] = useState(70);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const isPerformer = role === "performer_teen";

  const capabilityPreview = useMemo(() => {
    if (!createdUserId) return [] as Array<{ capability: string; allowed: boolean; reason: string }>;
    const checks = ["view_public_rooms", "join_fan_chat", "vote_contests", "buy_tickets", "buy_beats", "publish_beats", "go_live", "mint_nft", "sell_tickets"] as const;
    return checks.map((capability) => {
      const decision = teenAccountEngine.canAccess(createdUserId, capability);
      return { capability, allowed: decision.allowed, reason: decision.reason };
    });
  }, [createdUserId]);

  const submit = () => {
    setMessage("");
    const account = teenAccountEngine.registerTeenAccount({
      role,
      displayName,
      email,
      dateOfBirthIso,
      guardianEmail,
    });

    if (!account) {
      setCreatedUserId(null);
      setMessage("Teen signup requires age 13-17 and valid guardian email.");
      return;
    }

    // Demo flow: auto-approve consent when safety level is high enough.
    if (safetyLevel >= 60) {
      teenAccountEngine.approveGuardianConsent(account.userId);
      setMessage("Teen account created and guardian consent approved.");
    } else {
      teenAccountEngine.submitGuardianConsent(account.userId);
      setMessage("Teen account created. Guardian consent is pending.");
    }

    setCreatedUserId(account.userId);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#030712", color: "#e2e8f0", padding: 20 }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Link href="/signup" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 12 }}>Back To Signup</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Chevron direction="left" href="/signup" />
            <Chevron direction="right" href="/auth" />
          </div>
        </div>

        <h1 style={{ margin: "0 0 6px", fontSize: 28 }}>Teen Accounts: Fans + Performers</h1>
        <p style={{ margin: "0 0 16px", color: "#94a3b8", fontSize: 13 }}>
          Dedicated account class with guardian consent, capability gating, and safety-level controls.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <section style={cardStyle}>
            <h2 style={h2Style}>Create Teen Account</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {([
                ["fan_teen", "Teen Fan"],
                ["performer_teen", "Teen Performer"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${role === value ? "rgba(0,255,255,0.6)" : "rgba(51,65,85,0.7)"}`,
                    background: role === value ? "rgba(0,255,255,0.18)" : "rgba(15,23,42,0.7)",
                    color: role === value ? "#00ffff" : "#94a3b8",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={isPerformer ? "Performer Name" : "Display Name"} style={inputStyle} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Teen Email" type="email" style={inputStyle} />
            <input value={dateOfBirthIso} onChange={(e) => setDateOfBirthIso(e.target.value)} type="date" style={inputStyle} />
            <input value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} placeholder="Parent / Guardian Email" type="email" style={inputStyle} />

            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b" }}>
                <span>Safety Confidence Slider</span>
                <span>{safetyLevel}%</span>
              </div>
              <input
                value={safetyLevel}
                onChange={(e) => setSafetyLevel(Number(e.target.value))}
                min={0}
                max={100}
                step={1}
                type="range"
                style={{ width: "100%", marginTop: 6 }}
              />
            </div>

            <button type="button" onClick={submit} style={submitStyle}>Create Teen Account</button>
            {message ? <div style={{ marginTop: 8, color: "#fcd34d", fontSize: 12 }}>{message}</div> : null}
          </section>

          <section style={cardStyle}>
            <h2 style={h2Style}>Capability Preview</h2>
            {!createdUserId && <div style={{ color: "#64748b", fontSize: 12 }}>Create an account to preview capability gating.</div>}
            {capabilityPreview.map((item) => (
              <div key={item.capability} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(51,65,85,0.35)", padding: "8px 0" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#e2e8f0" }}>{item.capability}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{item.reason}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: item.allowed ? "#22c55e" : "#f97316" }}>
                  {item.allowed ? "Allowed" : "Blocked"}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "rgba(2,6,23,0.95)",
  border: "1px solid rgba(51,65,85,0.6)",
  borderRadius: 14,
  padding: 14,
};

const h2Style: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginBottom: 8,
  borderRadius: 8,
  border: "1px solid rgba(51,65,85,0.5)",
  background: "rgba(15,23,42,0.85)",
  color: "#e2e8f0",
  padding: "9px 11px",
  fontSize: 12,
};

const submitStyle: React.CSSProperties = {
  marginTop: 10,
  width: "100%",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  padding: "10px 12px",
  color: "#0f172a",
  background: "linear-gradient(135deg,#00ffff,#22c55e)",
  fontWeight: 800,
  fontSize: 12,
};
