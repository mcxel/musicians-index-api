"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import StripeConnectPanel from "@/components/commerce/StripeConnectPanel";

type CategoryRow = { category: string; netCents: number; grossCents: number; count: number };
type TxRow = {
  id: string;
  createdAt: string;
  category: string;
  amount: number;
  netAmount: number;
  status: string;
  direction: string;
};
type PayoutRow = { id: string; amountCents: number; status: string; createdAt: string };
type Ledger = {
  authenticated?: boolean;
  error?: string;
  creditNetCents: number;
  creditGrossCents: number;
  feeCents: number;
  byCategory: CategoryRow[];
  availableBalanceCents: number;
  pendingBalanceCents: number;
  lifetimeEarningsCents: number;
  payouts: PayoutRow[];
  transactions: TxRow[];
  historyTruncated: boolean;
  reportingTimezone: string;
};

const RANGES: { id: string; label: string }[] = [
  { id: "today", label: "TODAY" },
  { id: "7d", label: "7 DAYS" },
  { id: "30d", label: "30 DAYS" },
  { id: "month", label: "THIS MONTH" },
  { id: "3m", label: "3 MONTHS" },
  { id: "6m", label: "6 MONTHS" },
  { id: "12m", label: "12 MONTHS" },
];

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function serverCents(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduce;
}

function DigitRoll({ value, reduce }: { value: string; reduce: boolean }) {
  return (
    <span aria-hidden style={{ display: "inline-flex", alignItems: "flex-end" }}>
      {value.split("").map((char, index) => {
        const digit = /\d/.test(char) ? Number(char) : null;
        if (digit == null || reduce) {
          return <span key={`${index}-${char}`}>{char}</span>;
        }
        return (
          <span key={index} style={{ display: "inline-block", height: "1em", overflow: "hidden", lineHeight: 1 }}>
            <span style={{ display: "block", transform: `translateY(-${digit}em)`, transition: "transform 280ms linear" }}>
              {"0123456789".split("").map((n) => (
                <span key={n} style={{ display: "block", height: "1em" }}>{n}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

function RollingMoney({ cents, reduce }: { cents: number; reduce: boolean }) {
  const last = useRef<number | null>(null);
  const [display, setDisplay] = useState(cents);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    const prev = last.current;
    if (prev != null && cents === prev) return;
    if (prev == null || cents < prev || reduce) {
      last.current = cents;
      setDisplay(cents);
      setRolling(false);
      return;
    }
    last.current = cents;
    setRolling(true);
    const frame = window.requestAnimationFrame(() => setDisplay(cents));
    const timer = window.setTimeout(() => setRolling(false), 360);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [cents, reduce]);

  const label = money(display);
  return (
    <span data-money-rolling={rolling ? "1" : "0"}>
      <DigitRoll value={label} reduce={reduce || !rolling} />
      <span className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>{label}</span>
    </span>
  );
}

function categoryLabel(category: string): string {
  if (category === "CREDIT_TIP") return "Tip";
  if (category === "CREDIT_BEAT_SALE") return "Beat sale";
  return category;
}

export default function PerformerEarningsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [scope, setScope] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const reduceMotion = useReducedMotion();

  const load = useCallback(async (nextScope: string, range?: { from: string; to: string }, silent = false) => {
    if (!silent) setState("loading");
    const params = new URLSearchParams({ scope: nextScope });
    if (nextScope === "custom" && range) {
      params.set("from", range.from);
      params.set("to", range.to);
    }
    try {
      const res = await fetch(`/api/account/earnings-today?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = (await res.json()) as Ledger;
      if (!res.ok || data.error) {
        if (!silent) {
          setLedger(null);
          setState("error");
        }
        return;
      }
      if (!data.authenticated) {
        router.replace("/auth");
        return;
      }
      setLedger(data);
      setState("ready");
    } catch {
      if (!silent) {
        setLedger(null);
        setState("error");
      }
    }
  }, [router]);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.authenticated) router.replace("/auth");
        else setReady(true);
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  useEffect(() => {
    if (ready) void load("today");
  }, [ready, load]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setInterval(() => {
      void load(scope, scope === "custom" ? { from, to } : undefined, true);
    }, 45000);
    return () => window.clearInterval(timer);
  }, [ready, scope, from, to, load]);

  if (!ready) return (
    <div style={{ minHeight: "100vh", background: "#05060c", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#AA2DFF", fontSize: 12, letterSpacing: 4 }}>LOADING...</span>
    </div>
  );

  const tips = ledger?.byCategory.find((row) => row.category === "CREDIT_TIP");
  const beats = ledger?.byCategory.find((row) => row.category === "CREDIT_BEAT_SALE");
  const other = ledger?.byCategory.filter((row) => row.category !== "CREDIT_TIP" && row.category !== "CREDIT_BEAT_SALE") ?? [];

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/dashboard/performer" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Performer Hub</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#AA2DFF", fontWeight: 800, marginBottom: 4 }}>PERFORMER EARNINGS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>Wallet ledger</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 0 }}>
          Completed wallet credits. UTC. This net total is not withdrawable cash.
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {RANGES.map((range) => (
            <button
              key={range.id}
              type="button"
              onClick={() => {
                setScope(range.id);
                void load(range.id);
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: `1px solid ${scope === range.id ? "#AA2DFF" : "rgba(255,255,255,0.15)"}`,
                background: "transparent",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {range.label}
            </button>
          ))}
        </div>

        <form
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}
          onSubmit={(event) => {
            event.preventDefault();
            setScope("custom");
            void load("custom", { from, to });
          }}
        >
          <label style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
            FROM
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} style={{ display: "block", marginTop: 4 }} />
          </label>
          <label style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
            TO
            <input type="date" value={to} onChange={(event) => setTo(event.target.value)} style={{ display: "block", marginTop: 4 }} />
          </label>
          <button type="submit" style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #00FFFF55", background: "transparent", color: "#00FFFF", fontWeight: 800, cursor: "pointer" }}>
            CUSTOM RANGE
          </button>
        </form>

        {state === "loading" && !ledger && <p style={{ color: "#AA2DFF" }}>Loading ledger…</p>}
        {state === "error" && <p>Unable to load the wallet ledger. Retry.</p>}

        {ledger && state !== "error" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 24 }}>
              <Card label="Net credits" cents={serverCents(ledger.creditNetCents)} color="#AA2DFF" reduce={reduceMotion} />
              <Card label="Gross credits" cents={serverCents(ledger.creditGrossCents)} color="#00FFFF" reduce={reduceMotion} />
              <Card label="Fees withheld" cents={serverCents(ledger.feeCents)} color="#FFD700" reduce={reduceMotion} />
              <Card label="Available" cents={serverCents(ledger.availableBalanceCents)} color="#22c55e" reduce={reduceMotion} />
              <Card label="Pending" cents={serverCents(ledger.pendingBalanceCents)} color="#f59e0b" reduce={reduceMotion} />
              <Card label="Total earned" cents={serverCents(ledger.lifetimeEarningsCents)} color="#FF2DAA" reduce={reduceMotion} />
              <Card label="Paid out" cents={null} color="#888" reduce={reduceMotion} />
              {tips ? <Card label="Tip credits" cents={serverCents(tips.netCents)} color="#AA2DFF" reduce={reduceMotion} /> : null}
              {beats ? <Card label="Beat sale credits" cents={serverCents(beats.netCents)} color="#00FFFF" reduce={reduceMotion} /> : null}
              {other.map((row) => (
                <Card key={row.category} label={categoryLabel(row.category)} cents={serverCents(row.netCents)} color="#888" reduce={reduceMotion} />
              ))}
            </div>

            {ledger.byCategory.length === 0 && (
              <p style={{ color: "rgba(255,255,255,0.55)" }}>No completed credits in this UTC range.</p>
            )}

            <h2 style={{ fontSize: 14, letterSpacing: 2 }}>TRANSACTIONS</h2>
            {ledger.historyTruncated && (
              <p style={{ fontSize: 12, color: "#FFD700" }}>Showing the latest 40. The totals above are the full server sum.</p>
            )}
            {ledger.transactions.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.55)" }}>No transactions in this range.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {ledger.transactions.map((row) => (
                  <li key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "10px 0", fontSize: 12 }}>
                    <div>{row.createdAt.slice(0, 16).replace("T", " ")} UTC · {categoryLabel(row.category)} · {row.status}</div>
                    <div style={{ color: "rgba(255,255,255,0.65)" }}>
                      Gross {money(row.amount)} · Net {money(row.netAmount)}
                      {row.amount !== row.netAmount ? ` · Fee ${money(row.amount - row.netAmount)}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <h2 style={{ fontSize: 14, letterSpacing: 2 }}>LATEST PAYOUTS</h2>
            {ledger.payouts.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.55)" }}>No payouts on this wallet.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {ledger.payouts.map((row) => (
                  <li key={row.id} style={{ fontSize: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {row.createdAt.slice(0, 10)} · {money(row.amountCents)} · {row.status}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <div style={{ marginTop: 28 }}>
          <StripeConnectPanel accentColor="#AA2DFF" />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
          {[
            { label: "Go Live", href: "/hub/performer", color: "#FF2DAA" },
            { label: "Transactions", href: "/transactions", color: "#00FFFF" },
            { label: "NFT Studio", href: "/nft", color: "#FFD700" },
          ].map((a) => (
            <Link key={a.href} href={a.href} style={{
              padding: "10px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: `${a.color}12`, border: `1px solid ${a.color}33`,
              color: a.color, textDecoration: "none",
            }}>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function Card({ label, cents, color, reduce }: { label: string; cents: number | null; color: string; reduce: boolean }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}28`, borderRadius: 10, padding: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color }} />
      <div style={{ fontSize: 20, fontWeight: 900, color, position: "relative" }}>
        {cents == null ? "NOT_FOUND" : <RollingMoney cents={cents} reduce={reduce} />}
      </div>
      <div style={{ fontSize: 10, letterSpacing: 2, color: "#555", marginTop: 4, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}
