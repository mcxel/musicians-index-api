"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type SummaryResponse = {
  ok: boolean;
  summary?: {
    honestState: "empty" | "real";
    detail: string;
    queueCount: number;
    relationshipCount: number;
    openCommitments: number;
    pendingHumanApprovals: number;
    sponsorProposalsPending: number;
    mailbox: {
      state: string;
      inboundConfigured: boolean;
      outboundConfigured: boolean;
      scopedAddresses: string[];
      identities?: Array<{ key: string; address: string; visibility: string }>;
      detail: string;
    };
    auditLast24h: { total: number };
    recentAudit: Array<{ at: number; action: string; agentId: string; detail: string }>;
  };
};

type LoadState = "loading" | "empty" | "real" | "error";

export default function BigAceBusinessActivityPanel() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryResponse["summary"] | null>(null);
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoResult, setDemoResult] = useState<string | null>(null);
  const [mailBusy, setMailBusy] = useState(false);
  const [mailResult, setMailResult] = useState<string | null>(null);
  const [testTo, setTestTo] = useState("");

  const refresh = useCallback(async () => {
    setLoadState("loading");
    setError(null);
    try {
      const r = await fetch("/api/admin/business-comms/summary", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as SummaryResponse;
      setSummary(data.summary ?? null);
      setLoadState(data.summary?.honestState === "real" ? "real" : "empty");
    } catch (e) {
      setError(String(e));
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function runMailPollTriage() {
    setMailBusy(true);
    setMailResult(null);
    try {
      const r = await fetch("/api/admin/business-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "poll-triage", limit: 20 }),
      });
      const data = await r.json();
      if (!data.ok) {
        setMailResult(data.error ?? `HTTP ${r.status}`);
      } else {
        setMailResult(
          `Polled ${data.polled ?? 0}, triaged ${data.triaged ?? 0} (queue ${data.queueSize ?? 0}).`,
        );
      }
      await refresh();
    } catch (e) {
      setMailResult(String(e));
    } finally {
      setMailBusy(false);
    }
  }

  async function runMailTestSend() {
    const to = testTo.trim();
    if (!to.includes("@")) {
      setMailResult("Enter a valid test recipient email above.");
      return;
    }
    setMailBusy(true);
    setMailResult(null);
    try {
      const r = await fetch("/api/admin/business-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-send", to, fromIdentity: "support" }),
      });
      const data = await r.json();
      setMailResult(
        data.ok
          ? `Sent via ${data.provider} (${data.messageId}). Run Poll + Triage to verify inbox.`
          : data.error ?? `HTTP ${r.status}`,
      );
    } catch (e) {
      setMailResult(String(e));
    } finally {
      setMailBusy(false);
    }
  }

  async function runSponsorDemo() {
    setDemoBusy(true);
    setDemoResult(null);
    try {
      const r = await fetch("/api/admin/business-comms/directive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "process_sponsor_inquiry",
          from: "partner.demo@example.com",
          contactName: "Demo Partner",
          organization: "Demo Brand Co",
          subject: "Sponsorship interest — homepage banner",
          body: "We want a sponsor placement on the homepage banner for Q4.",
          preferredZone: "home-1-homepageBanner",
          sendDraft: false,
        }),
      });
      const data = await r.json();
      setDemoResult(data.ok ? "Sponsor lane processed (draft held — no auto-send)." : `Error: ${data.error ?? "failed"}`);
      await refresh();
    } catch (e) {
      setDemoResult(String(e));
    } finally {
      setDemoBusy(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    border: "1px solid rgba(255,215,0,0.25)",
    borderRadius: 12,
    background: "rgba(10,8,20,0.85)",
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  };

  if (loadState === "loading") {
    return (
      <div style={cardStyle} data-testid="big-ace-business-activity">
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700" }}>
          BIG ACE · BUSINESS COMMS
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Loading activity summary…</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div style={cardStyle} data-testid="big-ace-business-activity">
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700" }}>
          BIG ACE · BUSINESS COMMS
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "#fca5a5" }}>Unable to load summary. {error}</p>
        <button type="button" onClick={() => void refresh()} style={btnStyle}>
          Retry
        </button>
      </div>
    );
  }

  const m = summary?.mailbox;

  return (
    <div style={cardStyle} data-testid="big-ace-business-activity">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700" }}>
            BIG ACE · BUSINESS COMMS
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.45 }}>
            {summary?.detail}
          </p>
        </div>
        <Link href="/admin/big-ace" style={{ fontSize: 9, color: "#67e8f9", textDecoration: "none" }}>
          Big Ace →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
        <Stat label="Queue" value={summary?.queueCount ?? 0} />
        <Stat label="Relationships" value={summary?.relationshipCount ?? 0} />
        <Stat label="Open commitments" value={summary?.openCommitments ?? 0} />
        <Stat label="Human approval" value={summary?.pendingHumanApprovals ?? 0} />
        <Stat label="Sponsor proposals" value={summary?.sponsorProposalsPending ?? 0} />
        <Stat label="Audit 24h" value={summary?.auditLast24h.total ?? 0} />
      </div>

      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
        Mailbox: {m?.state ?? "unknown"} · inbound {m?.inboundConfigured ? "yes" : "no"} · outbound{" "}
        {m?.outboundConfigured ? "yes" : "no"}
        {m?.identities?.length ? (
          <>
            <br />
            {m.identities.map((id) => (
              <span key={id.key}>
                {id.key}={id.address} ({id.visibility}){" "}
              </span>
            ))}
          </>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)" }}>
          HOSTINGER TWO-WAY TEST
        </div>
        <input
          type="email"
          value={testTo}
          onChange={(e) => setTestTo(e.target.value)}
          placeholder="Test send recipient"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
            fontSize: 11,
          }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" disabled={mailBusy} onClick={() => void runMailTestSend()} style={btnStyle}>
            {mailBusy ? "…" : "Test send (support@)"}
          </button>
          <button type="button" disabled={mailBusy} onClick={() => void runMailPollTriage()} style={btnStyle}>
            {mailBusy ? "…" : "Poll INBOX + triage"}
          </button>
        </div>
        {mailResult ? (
          <p style={{ margin: 0, fontSize: 10, color: mailResult.startsWith("Polled") || mailResult.startsWith("Sent") ? "#86efac" : "#fca5a5" }}>
            {mailResult}
          </p>
        ) : null}
      </div>

      {loadState === "empty" && (
        <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
          No triaged business mail yet. Configure IMAP/SMTP env vars or run a sponsor inquiry demo below.
        </p>
      )}

      {summary?.recentAudit && summary.recentAudit.length > 0 && (
        <div style={{ maxHeight: 120, overflow: "auto", fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
          {summary.recentAudit.map((a, i) => (
            <div key={i}>
              {new Date(a.at).toLocaleString()} · {a.action} · {a.detail}
            </div>
          ))}
        </div>
      )}

      <button type="button" disabled={demoBusy} onClick={() => void runSponsorDemo()} style={btnStyle}>
        {demoBusy ? "Processing…" : "Process demo sponsor inquiry (no send)"}
      </button>
      {demoResult ? (
        <p style={{ margin: 0, fontSize: 10, color: "#86efac" }}>{demoResult}</p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "8px 10px",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ fontSize: 8, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{value}</div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  borderRadius: 8,
  border: "1px solid rgba(255,215,0,0.35)",
  background: "rgba(255,215,0,0.08)",
  color: "#FFD700",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  padding: "8px 12px",
  cursor: "pointer",
};
