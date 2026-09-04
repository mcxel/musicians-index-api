"use client";

import { useEffect, useState } from "react";
import {
  REQUIRED_MESSAGING_POLICIES,
  type PolicyId,
} from "@/lib/messaging/policyCatalog";

type MessagingEligibilityState =
  | "NOT_ELIGIBLE"
  | "AGE_VERIFICATION_REQUIRED"
  | "POLICY_ACCEPTANCE_REQUIRED"
  | "ELIGIBLE"
  | "RESTRICTED"
  | "SUSPENDED";

type AgeVerificationStatus =
  | "UNVERIFIED"
  | "VERIFIED_16_17"
  | "VERIFIED_18_20"
  | "VERIFIED_21_PLUS"
  | "REJECTED_UNDERAGE";

export type MessagingPendingIntent = {
  recipientId: string;
  recipientName?: string;
  body?: string;
  returnPath?: string;
  kind?: string;
};

const PENDING_KEY = "tmi_messaging_pending_intent";

export function saveMessagingPendingIntent(intent: MessagingPendingIntent): void {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(intent));
  } catch {
    /* ignore */
  }
}

export function loadMessagingPendingIntent(): MessagingPendingIntent | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MessagingPendingIntent;
  } catch {
    return null;
  }
}

export function clearMessagingPendingIntent(): void {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

type GateMode = "age" | "policy" | "both" | "blocked";

type Props = {
  open: boolean;
  mode: GateMode;
  code?: string;
  message?: string;
  eligibilityState?: MessagingEligibilityState;
  onClose: () => void;
  /** Called after successful gate completion — resume original conversation. */
  onComplete: () => void;
};

export default function AgePolicyGateModal({
  open,
  mode,
  code,
  message,
  onClose,
  onComplete,
}: Props) {
  const [dob, setDob] = useState("");
  const [checks, setChecks] = useState<Record<PolicyId, boolean>>({
    TOS: false,
    PRIVACY: false,
    COMMUNITY_GUIDELINES: false,
    MESSAGING_CONDUCT: false,
    LIABILITY_ACK: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ageStatus, setAgeStatus] = useState<AgeVerificationStatus | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const needAge = mode === "age" || mode === "both";
  const needPolicy = mode === "policy" || mode === "both";
  const allPoliciesChecked = REQUIRED_MESSAGING_POLICIES.every((p) => checks[p.policyId]);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (needAge) {
        if (!dob.trim()) {
          setError("Enter your date of birth.");
          setBusy(false);
          return;
        }
        const ageRes = await fetch("/api/account/update-age", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ dateOfBirth: dob }),
        });
        const ageData = (await ageRes.json()) as {
          ok?: boolean;
          error?: string;
          ageStatus?: AgeVerificationStatus;
        };
        if (!ageRes.ok || !ageData.ok) {
          setError(ageData.error ?? "Age verification failed.");
          setAgeStatus(ageData.ageStatus ?? null);
          setBusy(false);
          return;
        }
        setAgeStatus(ageData.ageStatus ?? null);
      }

      if (needPolicy) {
        if (!allPoliciesChecked) {
          setError("Accept all required policies to continue.");
          setBusy(false);
          return;
        }
        const polRes = await fetch("/api/account/policy-accept", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            acceptAll: true,
            liabilityAcknowledged: checks.LIABILITY_ACK === true,
          }),
        });
        const polData = (await polRes.json()) as { ok?: boolean; error?: string };
        if (!polRes.ok || !polData.ok) {
          setError(polData.error ?? "Policy acceptance failed.");
          setBusy(false);
          return;
        }
      }

      onComplete();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(5,5,16,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#0a0614",
          border: "1px solid rgba(0,255,255,0.28)",
          borderRadius: 14,
          padding: 20,
          color: "#fff",
          boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#00FFFF", marginBottom: 8 }}>
          {mode === "blocked" ? "MESSAGING BLOCKED" : "MESSAGING ACCESS GATE"}
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 900 }}>
          {needAge && needPolicy
            ? "Verify age & accept policies"
            : needAge
              ? "Age verification required"
              : needPolicy
                ? "Policy acceptance required"
                : "Unable to message"}
        </h2>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
          {message ??
            (code
              ? `Code: ${code}`
              : "Complete this one-time step to message within allowed groups.")}
        </p>

        {mode === "blocked" ? (
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        ) : (
          <>
            {needAge && (
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)" }}>
                  DATE OF BIRTH
                </span>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: 6,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    boxSizing: "border-box",
                  }}
                />
              </label>
            )}

            {needPolicy && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {REQUIRED_MESSAGING_POLICIES.map((p) => (
                  <label
                    key={p.policyId}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      fontSize: 12,
                      lineHeight: 1.4,
                      color: "rgba(255,255,255,0.8)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checks[p.policyId]}
                      onChange={(e) =>
                        setChecks((prev) => ({ ...prev, [p.policyId]: e.target.checked }))
                      }
                      style={{ marginTop: 2 }}
                    />
                    <span>
                      <strong style={{ color: "#FFD700" }}>{p.title}</strong> — {p.summary}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {error && (
              <p style={{ margin: "0 0 10px", fontSize: 11, color: "#fca5a5" }}>{error}</p>
            )}
            {ageStatus && (
              <p style={{ margin: "0 0 10px", fontSize: 10, color: "rgba(0,255,255,0.7)" }}>
                Age status: {ageStatus}
              </p>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit()}
                style={{
                  flex: 2,
                  padding: "11px 0",
                  borderRadius: 10,
                  border: "none",
                  background: busy
                    ? "rgba(255,255,255,0.1)"
                    : "linear-gradient(135deg,#FF2DAA,#AA2DFF)",
                  color: "#fff",
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  cursor: busy ? "wait" : "pointer",
                }}
              >
                {busy ? "SAVING…" : "CONTINUE & RESUME MESSAGE"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function gateModeFromCode(code?: string | null): GateMode {
  if (code === "AGE_VERIFICATION_REQUIRED") return "age";
  if (code === "POLICY_ACCEPTANCE_REQUIRED") return "policy";
  if (
    code === "AGE_POLICY_RESTRICTED" ||
    code === "BLOCKED" ||
    code === "ACCOUNT_RESTRICTED" ||
    code === "RECIPIENT_MESSAGES_DISABLED" ||
    code === "RECIPIENT_AGE_UNVERIFIED" ||
    code === "RATE_LIMITED"
  ) {
    return "blocked";
  }
  return "both";
}

