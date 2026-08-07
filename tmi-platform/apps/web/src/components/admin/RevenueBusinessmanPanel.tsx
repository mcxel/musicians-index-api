"use client";

/**
 * Observatory panel — Revenue Businessman status, checkpoints, deals, Stripe health.
 * Voice readout via Web Speech (honest empty if nothing to say).
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

type Checkpoint = { id: string; label: string; status: "PASS" | "FAIL" | "BLOCKED"; detail: string };
type Directive = {
  id: string;
  title: string;
  percentComplete: number;
  achievement?: string;
  checkpoints: Checkpoint[];
};
type Deal = {
  id: string;
  title: string;
  state: string;
  zone: string;
  valueBandUsd: { min: number; max: number };
};
type Proposal = { id: string; title: string; status: string; kind: string };
type Report = { id: string; at: number; botLabel: string; headline: string; body: string; voiceText: string };
type StripeHealth = {
  status: string;
  stripeMode: string;
  summaryLines: string[];
  repairRecommendations: string[];
  voiceText: string;
};

type Dashboard = {
  ok?: boolean;
  directives?: Directive[];
  checkpoints?: Checkpoint[];
  goals?: Record<string, number>;
  openDeals?: Deal[];
  closedDeals?: Deal[];
  proposals?: Proposal[];
  blocked?: Array<{ id: string; detail: string }>;
  stripeHealth?: StripeHealth;
  reports?: Report[];
  voiceText?: string;
  dryRun?: boolean;
  coverage?: Array<{ zone: string; status: string; note: string }>;
};

export default function RevenueBusinessmanPanel() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [state, setState] = useState<"loading" | "data" | "empty" | "error">("loading");
  const [speaking, setSpeaking] = useState(false);
  const [busy, setBusy] = useState("");
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const load = useCallback(async () => {
    try {
      setState("loading");
      const res = await fetch("/api/commerce/revenue-business", { cache: "no-store" });
      if (!res.ok) throw new Error("load_failed");
      const json = (await res.json()) as Dashboard;
      setData(json);
      const has =
        (json.reports?.length ?? 0) > 0 ||
        (json.openDeals?.length ?? 0) > 0 ||
        (json.checkpoints?.length ?? 0) > 0;
      setState(has ? "data" : "empty");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 20_000);
    return () => clearInterval(t);
  }, [load]);

  const stopVoice = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    utterRef.current = null;
    setSpeaking(false);
  }, []);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    stopVoice();
    const text =
      data?.voiceText?.trim() ||
      data?.reports?.[0]?.voiceText ||
      "No revenue businessman report yet. Idle — nothing to say.";
    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }, [data, stopVoice]);

  async function runObserve() {
    setBusy("observe");
    try {
      await fetch("/api/commerce/revenue-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "observe", botId: "revenue-business-bot-001" }),
      });
      await load();
    } finally {
      setBusy("");
    }
  }

  async function approveProposal(proposalId: string) {
    setBusy(proposalId);
    try {
      await fetch("/api/commerce/revenue-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "write",
          type: "approve_and_apply",
          proposalId,
          actor: "admin",
        }),
      });
      await load();
    } finally {
      setBusy("");
    }
  }

  async function rejectProposal(proposalId: string) {
    setBusy(proposalId);
    try {
      await fetch("/api/commerce/revenue-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "write",
          type: "reject",
          proposalId,
          actor: "admin",
          reason: "rejected_from_observatory",
        }),
      });
      await load();
    } finally {
      setBusy("");
    }
  }

  async function closeDeal(dealId: string, won: boolean) {
    setBusy(dealId);
    try {
      await fetch("/api/commerce/revenue-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "close_deal",
          dealId,
          outcome: won ? "won" : "rejected",
          paymentOrContractSignal: won,
          actor: "admin",
        }),
      });
      await load();
    } finally {
      setBusy("");
    }
  }

  if (state === "loading" && !data) {
    return <div style={pad}>Loading Revenue Businessman…</div>;
  }
  if (state === "error") {
    return (
      <div style={pad}>
        Unable to load businessman dashboard.{" "}
        <button type="button" style={btn("#FF2DAA")} onClick={() => void load()}>
          Retry
        </button>
      </div>
    );
  }

  const stripe = data?.stripeHealth;
  const pending = (data?.proposals ?? []).filter((p) => p.status === "PROPOSAL");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 10, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", color: "#FFD700" }}>
          [BOT] REVENUE BUSINESSMAN
        </div>
        <button type="button" style={btn("#00FFFF")} onClick={() => void runObserve()} disabled={busy === "observe"}>
          {busy === "observe" ? "Ticking…" : "Run OBSERVE"}
        </button>
        <button type="button" style={btn("#AA2DFF")} onClick={speaking ? stopVoice : speak}>
          {speaking ? "Stop voice" : "Hear report"}
        </button>
        {data?.dryRun ? <span style={{ fontSize: 9, color: "#FFD700" }}>DRY-RUN</span> : null}
      </div>

      {/* Stripe health */}
      <div style={card(stripe?.status === "PASS" ? "#00FF88" : "#FF4444")}>
        <div style={hdr(stripe?.status === "PASS" ? "#00FF88" : "#FF4444")}>
          STRIPE HEALTH · {stripe?.status ?? "unknown"} · {stripe?.stripeMode ?? "—"}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", lineHeight: 1.5, marginTop: 6 }}>
          {(stripe?.summaryLines ?? ["No Stripe health yet."]).map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
        {(stripe?.repairRecommendations?.length ?? 0) > 0 ? (
          <div style={{ marginTop: 6, fontSize: 9, color: "#FFD700" }}>
            Repair: {stripe!.repairRecommendations.join(" · ")}
          </div>
        ) : null}
      </div>

      {/* Directives */}
      <div style={card("#00FFFF")}>
        <div style={hdr("#00FFFF")}>DIRECTIVES</div>
        {(data?.directives ?? []).length === 0 ? (
          <div style={empty}>No directives yet — run OBSERVE.</div>
        ) : (
          (data?.directives ?? []).map((d) => (
            <div key={d.id} style={{ marginTop: 6, fontSize: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ color: "#fff", fontWeight: 700 }}>{d.title}</span>
                <span style={{ color: d.percentComplete === 100 ? "#00FF88" : "#FFD700" }}>
                  {d.percentComplete}%{d.achievement ? ` · ${d.achievement}` : ""}
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  marginTop: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div style={{ width: `${d.percentComplete}%`, height: "100%", background: "#00FFFF" }} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Checkpoints */}
      <div style={card("#FFD700")}>
        <div style={hdr("#FFD700")}>CHECKPOINTS</div>
        {(data?.checkpoints ?? []).map((c) => (
          <div key={c.id} style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 10 }}>
            <span
              style={{
                color: c.status === "PASS" ? "#00FF88" : c.status === "BLOCKED" ? "#FF4444" : "#FFD700",
                fontWeight: 900,
                minWidth: 56,
              }}
            >
              {c.status}
            </span>
            <span style={{ color: "rgba(255,255,255,0.75)" }}>
              {c.label} — {c.detail}
            </span>
          </div>
        ))}
      </div>

      {/* Reports */}
      <div style={card("#FF2DAA")}>
        <div style={hdr("#FF2DAA")}>STATUS REPORTS (read + hear)</div>
        {(data?.reports ?? []).length === 0 ? (
          <div style={empty}>Idle — no reports yet. Run OBSERVE.</div>
        ) : (
          (data?.reports ?? []).slice(0, 8).map((r) => (
            <div key={r.id} style={{ marginTop: 6, fontSize: 10, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 4 }}>
              <div style={{ color: "#FF2DAA", fontWeight: 800 }}>{r.botLabel}</div>
              <div style={{ color: "#fff", fontWeight: 700 }}>{r.headline}</div>
              <div style={{ color: "rgba(255,255,255,0.55)" }}>{r.body}</div>
            </div>
          ))
        )}
      </div>

      {/* Prospect / proposal queue */}
      <div style={card("#AA2DFF")}>
        <div style={hdr("#AA2DFF")}>PROPOSAL QUEUE (approve / reject)</div>
        {pending.length === 0 ? (
          <div style={empty}>No proposals awaiting human approve.</div>
        ) : (
          pending.slice(0, 8).map((p) => (
            <div key={p.id} style={{ marginTop: 6, fontSize: 10 }}>
              <div style={{ color: "#fff", fontWeight: 700 }}>{p.title}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
                {p.kind} · {p.status}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  style={btn("#00FF88")}
                  disabled={busy === p.id}
                  onClick={() => void approveProposal(p.id)}
                >
                  Approve+Apply
                </button>
                <button
                  type="button"
                  style={btn("#FF4444")}
                  disabled={busy === p.id}
                  onClick={() => void rejectProposal(p.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Deals */}
      <div style={card("#00FF88")}>
        <div style={hdr("#00FF88")}>OPEN DEALS</div>
        {(data?.openDeals ?? []).length === 0 ? (
          <div style={empty}>No open deals.</div>
        ) : (
          (data?.openDeals ?? []).slice(0, 6).map((d) => (
            <div key={d.id} style={{ marginTop: 6, fontSize: 10 }}>
              <div style={{ fontWeight: 800, color: "#fff" }}>
                {d.title} · {d.state}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)" }}>
                {d.zone} · ${d.valueBandUsd.min}–${d.valueBandUsd.max}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <button type="button" style={btn("#00FF88")} disabled={!!busy} onClick={() => void closeDeal(d.id, true)}>
                  Close WON (contract+pay)
                </button>
                <button type="button" style={btn("#FF4444")} disabled={!!busy} onClick={() => void closeDeal(d.id, false)}>
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {(data?.blocked?.length ?? 0) > 0 ? (
        <div style={card("#FF4444")}>
          <div style={hdr("#FF4444")}>BLOCKED — NEEDS HUMAN</div>
          {(data?.blocked ?? []).map((b) => (
            <div key={b.id} style={{ fontSize: 10, marginTop: 4, color: "rgba(255,255,255,0.7)" }}>
              {b.id}: {b.detail}
            </div>
          ))}
        </div>
      ) : null}

      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
        Goals:{" "}
        {data?.goals
          ? Object.entries(data.goals)
              .map(([k, v]) => `${k}=${v}`)
              .join(" · ")
          : "—"}
      </div>
    </div>
  );
}

const pad: CSSProperties = { padding: 12, fontSize: 11, color: "rgba(255,255,255,0.5)" };
const empty: CSSProperties = { fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 6 };

function card(color: string): CSSProperties {
  return {
    border: `1px solid ${color}44`,
    borderRadius: 10,
    padding: 10,
    background: "rgba(0,0,0,0.35)",
  };
}
function hdr(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.1em",
    color,
  };
}
function btn(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 800,
    padding: "4px 8px",
    borderRadius: 6,
    border: `1px solid ${color}`,
    background: `${color}22`,
    color: "#fff",
    cursor: "pointer",
  };
}
