"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ReferralStats {
  pending: number;
  qualified: number;
  totalPoints: number;
  milestoneUnlocked: boolean;
}

interface Props {
  fanId: string;
  roomId: string;
  sessionStartMs: number;
  interactionCount: number;
  onReferralQualified?: (totalQualified: number, milestoneBonus: boolean) => void;
}

const UNLOCK_STAY_SECS = 60;
const UNLOCK_ACTIONS = 1;
const STATS_POLL_MS = 20_000;

export default function ShareButton({
  fanId,
  roomId,
  sessionStartMs,
  interactionCount,
  onReferralQualified,
}: Props) {
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({ qualified: 0, pending: 0, totalPoints: 0, milestoneUnlocked: false });
  const [toast, setToast] = useState<string | null>(null);

  const fetchedRef = useRef(false);
  const prevQualifiedRef = useRef(0);
  const prevMilestoneRef = useRef(false);

  // Tick elapsed time
  useEffect(() => {
    const id = setInterval(() => {
      setElapsedSecs(Math.floor((Date.now() - sessionStartMs) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [sessionStartMs]);

  const meetsRequirements =
    elapsedSecs >= UNLOCK_STAY_SECS && interactionCount >= UNLOCK_ACTIONS;

  // Fetch referral link once requirements are met
  useEffect(() => {
    if (!meetsRequirements || fetchedRef.current) return;
    fetchedRef.current = true;

    fetch("/api/referral/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fanId, roomId }),
    })
      .then((r) => r.json())
      .then((data: { url?: string }) => {
        if (data.url) {
          setLinkUrl(data.url);
          setUnlocked(true);
        }
      })
      .catch(() => {});
  }, [meetsRequirements, fanId, roomId]);

  // Poll stats after unlock
  const pollStats = useCallback(() => {
    fetch(`/api/referral/stats?fanId=${encodeURIComponent(fanId)}`)
      .then((r) => r.json())
      .then((data: ReferralStats) => {
        setStats(data);

        const newQualified = data.qualified - prevQualifiedRef.current;
        const newMilestone = data.milestoneUnlocked && !prevMilestoneRef.current;

        if (newMilestone) {
          setToast("🏆 MILESTONE — +5,000 points! 5 real invites in.");
          onReferralQualified?.(data.qualified, true);
        } else if (newQualified > 0) {
          const pts = newQualified * 500;
          setToast(`🔥 +${pts.toLocaleString()} pts — your invite joined the room`);
          onReferralQualified?.(data.qualified, false);
        }

        prevQualifiedRef.current = data.qualified;
        prevMilestoneRef.current = data.milestoneUnlocked;
      })
      .catch(() => {});
  }, [fanId, onReferralQualified]);

  useEffect(() => {
    if (!unlocked) return;
    pollStats();
    const id = setInterval(pollStats, STATS_POLL_MS);
    return () => clearInterval(id);
  }, [unlocked, pollStats]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCopy = useCallback(() => {
    if (!linkUrl) return;
    navigator.clipboard.writeText(linkUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [linkUrl]);

  const progressPct = Math.min(
    100,
    Math.round(
      (Math.min(elapsedSecs, UNLOCK_STAY_SECS) / UNLOCK_STAY_SECS) * 70 +
      (Math.min(interactionCount, UNLOCK_ACTIONS) / UNLOCK_ACTIONS) * 30,
    ),
  );

  return (
    <div style={{ position: "relative" }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
              background: "rgba(255,45,170,0.15)", border: "1px solid rgba(255,45,170,0.4)",
              borderRadius: 8, padding: "8px 12px",
              fontSize: 11, fontWeight: 700, color: "#FF2DAA",
              zIndex: 10,
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {!unlocked ? (
        <div style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, padding: 16,
        }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: "#888", fontWeight: 800, marginBottom: 10 }}>
            🔗 INVITE A FRIEND
          </div>
          <div style={{ fontSize: 10, color: "#555", marginBottom: 10, lineHeight: 1.5 }}>
            {interactionCount < UNLOCK_ACTIONS
              ? "Interact with the room to unlock"
              : elapsedSecs < UNLOCK_STAY_SECS
              ? `Stay ${UNLOCK_STAY_SECS - elapsedSecs}s more to unlock`
              : "Unlocking…"}
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 4, height: 4 }}>
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: "100%", background: "#FF2DAA44", borderRadius: 4 }}
            />
          </div>
        </div>
      ) : (
        <div style={{
          background: "rgba(255,45,170,0.04)", border: "1px solid rgba(255,45,170,0.2)",
          borderRadius: 12, padding: 16,
        }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: "#FF2DAA", fontWeight: 800, marginBottom: 10 }}>
            🔗 INVITE A FRIEND
          </div>

          {/* Stats row */}
          {(stats.qualified > 0 || stats.pending > 0) && (
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#00FF88" }}>{stats.qualified}</div>
                <div style={{ fontSize: 7, letterSpacing: 2, color: "#555" }}>QUALIFIED</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#FFD700" }}>{stats.totalPoints.toLocaleString()}</div>
                <div style={{ fontSize: 7, letterSpacing: 2, color: "#555" }}>POINTS</div>
              </div>
              {stats.milestoneUnlocked && (
                <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 700, alignSelf: "center" }}>
                  🏆 MILESTONE
                </div>
              )}
            </div>
          )}

          <div style={{ fontSize: 10, color: "#888", marginBottom: 10, lineHeight: 1.5 }}>
            Earn <span style={{ color: "#FFD700", fontWeight: 700 }}>500 pts</span> per real invite.
            Get <span style={{ color: "#FF2DAA", fontWeight: 700 }}>5,000 pts</span> bonus at 5.
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleCopy}
            style={{
              width: "100%", padding: "10px 0", borderRadius: 8, cursor: "pointer",
              background: copied
                ? "rgba(0,255,136,0.15)"
                : "linear-gradient(135deg, rgba(255,45,170,0.2), rgba(170,45,255,0.2))",
              border: `1px solid ${copied ? "#00FF88" : "rgba(255,45,170,0.4)"}`,
              color: copied ? "#00FF88" : "#FF2DAA",
              fontSize: 10, fontWeight: 900, letterSpacing: 2,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={copied ? "copied" : "copy"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                {copied ? "✓ LINK COPIED" : "COPY INVITE LINK"}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      )}
    </div>
  );
}
