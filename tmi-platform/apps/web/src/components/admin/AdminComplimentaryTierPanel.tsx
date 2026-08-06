"use client";

/**
 * AdminComplimentaryTierPanel — animated tier grant station.
 *
 * Marcel adds email addresses to the queue, picks a tier, hits GRANT.
 * Each email gets an animated status reveal (particle burst on success).
 *
 * Calls POST /api/admin/users/grant-tier
 */

import { useCallback, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TIERS = [
  { id: "FREE",     label: "FREE",     color: "#888",    icon: "⬜" },
  { id: "PRO",      label: "PRO",      color: "#00D4FF", icon: "🔵" },
  { id: "RUBY",     label: "RUBY",     color: "#FF2DAA", icon: "💎" },
  { id: "SILVER",   label: "SILVER",   color: "#C0C0C0", icon: "🥈" },
  { id: "GOLD",     label: "GOLD",     color: "#FFD700", icon: "🥇" },
  { id: "PLATINUM", label: "PLATINUM", color: "#E5E4E2", icon: "🏅" },
  { id: "DIAMOND",  label: "DIAMOND",  color: "#00FFFF", icon: "💠" },
] as const;

type TierId = (typeof TIERS)[number]["id"];

interface QueueEntry {
  id: string;
  email: string;
  status: "pending" | "granting" | "granted" | "not_found" | "error";
  resultTier?: string;
}

// ─── Particle burst (CSS keyframe animation) ─────────────────────────────────

const PARTICLE_CSS = `
@keyframes tmiTierBurst {
  0%   { transform: scale(0) rotate(0deg);   opacity: 1; }
  60%  { transform: scale(1.4) rotate(180deg); opacity: 0.8; }
  100% { transform: scale(2.2) rotate(360deg); opacity: 0; }
}
@keyframes tmiTierSlide {
  from { transform: translateX(-12px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}
@keyframes tmiTierPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(0,255,255,0.4); }
  50%     { box-shadow: 0 0 0 12px rgba(0,255,255,0); }
}
@keyframes tmiShimmer {
  from { background-position: -400px 0; }
  to   { background-position: 400px 0; }
}
`;

function StatusBadge({ status, tier }: { status: QueueEntry["status"]; tier?: string }) {
  const tierDef = TIERS.find((t) => t.id === tier);
  if (status === "granting") {
    return (
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#FFD700",
          letterSpacing: "0.1em",
          animation: "tmiTierPulse 1s infinite",
          borderRadius: 4,
          padding: "2px 8px",
          border: "1px solid #FFD70044",
          background: "#FFD70011",
        }}
      >
        GRANTING…
      </span>
    );
  }
  if (status === "granted" && tierDef) {
    return (
      <span
        style={{
          fontSize: 10,
          fontWeight: 900,
          color: tierDef.color,
          letterSpacing: "0.1em",
          borderRadius: 4,
          padding: "2px 8px",
          border: `1px solid ${tierDef.color}55`,
          background: `${tierDef.color}18`,
          animation: "tmiTierBurst 0.6s ease-out",
        }}
      >
        {tierDef.icon} {tierDef.label} GRANTED
      </span>
    );
  }
  if (status === "not_found") {
    return (
      <span style={{ fontSize: 10, fontWeight: 700, color: "#FF6B35", letterSpacing: "0.08em" }}>
        ⚠ NOT FOUND
      </span>
    );
  }
  if (status === "error") {
    return (
      <span style={{ fontSize: 10, fontWeight: 700, color: "#FF2DAA", letterSpacing: "0.08em" }}>
        ✗ ERROR
      </span>
    );
  }
  return (
    <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.06em" }}>PENDING</span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminComplimentaryTierPanel() {
  const [emailInput, setEmailInput] = useState("");
  const [selectedTier, setSelectedTier] = useState<TierId>("DIAMOND");
  const [note, setNote] = useState("");
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [isGranting, setIsGranting] = useState(false);
  const [grantedCount, setGrantedCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const tierDef = TIERS.find((t) => t.id === selectedTier)!;

  const addToQueue = useCallback(() => {
    const raw = emailInput.trim().toLowerCase();
    if (!raw || !raw.includes("@")) return;
    // deduplicate
    if (queue.some((e) => e.email === raw)) {
      setEmailInput("");
      return;
    }
    setQueue((prev) => [
      ...prev,
      { id: crypto.randomUUID(), email: raw, status: "pending" },
    ]);
    setEmailInput("");
    inputRef.current?.focus();
  }, [emailInput, queue]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") addToQueue();
    },
    [addToQueue],
  );

  const grantAll = useCallback(async () => {
    const pending = queue.filter((e) => e.status === "pending");
    if (pending.length === 0) return;

    setIsGranting(true);

    // Mark all as granting
    setQueue((prev) =>
      prev.map((e) => (e.status === "pending" ? { ...e, status: "granting" } : e)),
    );

    try {
      const res = await fetch("/api/admin/users/grant-tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grants: pending.map((e) => ({
            email: e.email,
            tier: selectedTier,
            note: note || undefined,
          })),
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setQueue((prev) =>
          prev.map((e) =>
            e.status === "granting" ? { ...e, status: "error" } : e,
          ),
        );
        return;
      }

      const resultMap = new Map(
        (data.results as { email: string; status: string; tier?: string }[]).map((r) => [
          r.email,
          r,
        ]),
      );

      setQueue((prev) =>
        prev.map((e) => {
          if (e.status !== "granting") return e;
          const result = resultMap.get(e.email);
          if (!result) return { ...e, status: "error" };
          return {
            ...e,
            status: result.status as QueueEntry["status"],
            resultTier: result.tier,
          };
        }),
      );

      setGrantedCount((c) => c + (data.grantedCount ?? 0));
    } catch {
      setQueue((prev) =>
        prev.map((e) =>
          e.status === "granting" ? { ...e, status: "error" } : e,
        ),
      );
    } finally {
      setIsGranting(false);
    }
  }, [queue, selectedTier, note]);

  const clearDone = useCallback(() => {
    setQueue((prev) => prev.filter((e) => e.status === "pending"));
  }, []);

  const pendingCount = queue.filter((e) => e.status === "pending").length;

  return (
    <>
      <style>{PARTICLE_CSS}</style>
      <div
        style={{
          background:
            "radial-gradient(circle at 0% 0%, rgba(0,255,255,0.06), transparent 50%)," +
            "radial-gradient(circle at 100% 100%, rgba(255,215,0,0.06), transparent 50%)," +
            "#06070d",
          border: `1px solid ${tierDef.color}44`,
          borderRadius: 16,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          transition: "border-color 0.3s ease",
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `${tierDef.color}22`,
              border: `2px solid ${tierDef.color}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              animation: grantedCount > 0 ? "tmiTierPulse 2s infinite" : undefined,
            }}
          >
            {tierDef.icon}
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: "0.12em",
                color: tierDef.color,
              }}
            >
              COMPLIMENTARY TIER GRANT
            </div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
              {grantedCount > 0
                ? `${grantedCount} tier${grantedCount === 1 ? "" : "s"} granted this session`
                : "Grant lifetime tier access to any account"}
            </div>
          </div>
        </div>

        {/* ── Tier selector ── */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.1em", marginBottom: 8 }}>
            SELECT TIER TO GRANT
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TIERS.map((tier) => {
              const active = tier.id === selectedTier;
              return (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  style={{
                    background: active ? `${tier.color}22` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? tier.color : "#333"}`,
                    borderRadius: 8,
                    padding: "6px 12px",
                    color: active ? tier.color : "#666",
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                    letterSpacing: "0.08em",
                    transition: "all 0.2s ease",
                    transform: active ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  {tier.icon} {tier.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Email input ── */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.1em", marginBottom: 8 }}>
            ADD EMAIL TO QUEUE
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="email@example.com"
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${tierDef.color}33`,
                borderRadius: 8,
                padding: "10px 14px",
                color: "#fff",
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={addToQueue}
              disabled={!emailInput.includes("@")}
              style={{
                background: `${tierDef.color}22`,
                border: `1px solid ${tierDef.color}55`,
                borderRadius: 8,
                padding: "10px 18px",
                color: tierDef.color,
                fontSize: 12,
                fontWeight: 800,
                cursor: emailInput.includes("@") ? "pointer" : "not-allowed",
                letterSpacing: "0.08em",
                opacity: emailInput.includes("@") ? 1 : 0.4,
              }}
            >
              + ADD
            </button>
          </div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 6 }}>
            Press Enter or click + ADD. You can queue multiple emails before granting.
          </div>
        </div>

        {/* ── Note field ── */}
        <div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional) — e.g. 'Founding member' or 'Marcel's personal grant'"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid #333",
              borderRadius: 8,
              padding: "8px 12px",
              color: "#aaa",
              fontSize: 12,
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* ── Queue ── */}
        {queue.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#888",
                letterSpacing: "0.1em",
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>QUEUE ({queue.length})</span>
              {queue.some((e) => e.status !== "pending") && (
                <button
                  onClick={clearDone}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#555",
                    fontSize: 10,
                    cursor: "pointer",
                    letterSpacing: "0.08em",
                  }}
                >
                  CLEAR DONE
                </button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {queue.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      entry.status === "granted"
                        ? `${tierDef.color}33`
                        : entry.status === "error" || entry.status === "not_found"
                        ? "#FF2DAA33"
                        : "#2a2a2a"
                    }`,
                    borderRadius: 8,
                    padding: "9px 12px",
                    animation: "tmiTierSlide 0.25s ease",
                  }}
                >
                  <div style={{ flex: 1, fontSize: 12, color: "#ccc", fontFamily: "monospace" }}>
                    {entry.email}
                  </div>
                  <StatusBadge status={entry.status} tier={entry.resultTier ?? selectedTier} />
                  {entry.status === "pending" && (
                    <button
                      onClick={() => removeFromQueue(entry.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#555",
                        fontSize: 14,
                        cursor: "pointer",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Grant button ── */}
        <button
          onClick={grantAll}
          disabled={isGranting || pendingCount === 0}
          style={{
            background:
              pendingCount === 0
                ? "rgba(255,255,255,0.04)"
                : `linear-gradient(135deg, ${tierDef.color}33, ${tierDef.color}18)`,
            border: `1px solid ${pendingCount === 0 ? "#333" : tierDef.color}`,
            borderRadius: 10,
            padding: "14px",
            color: pendingCount === 0 ? "#555" : tierDef.color,
            fontSize: 13,
            fontWeight: 900,
            cursor: pendingCount === 0 || isGranting ? "not-allowed" : "pointer",
            letterSpacing: "0.12em",
            transition: "all 0.2s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {isGranting ? (
            "GRANTING…"
          ) : pendingCount === 0 ? (
            "ADD EMAILS TO QUEUE"
          ) : (
            `${tierDef.icon} GRANT ${selectedTier} TO ${pendingCount} ACCOUNT${pendingCount === 1 ? "" : "S"}`
          )}
          {!isGranting && pendingCount > 0 && (
            <span
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(90deg, transparent, ${tierDef.color}18, transparent)`,
                backgroundSize: "400px 100%",
                animation: "tmiShimmer 2.5s linear infinite",
              }}
            />
          )}
        </button>
      </div>
    </>
  );
}
