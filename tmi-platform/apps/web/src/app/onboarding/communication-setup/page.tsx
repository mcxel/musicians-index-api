"use client";

/**
 * Post-OAuth (and incomplete-account) communication consent gate.
 * Reuses SignupPolicyAcceptance + the same /api/account/update-age and
 * /api/account/policy-accept paths as AgePolicyGateModal.
 * Does not silently set termsAccepted — only policy-accept after checkboxes.
 */

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SignupPolicyAcceptance, {
  AGE_REQUIRED_ERROR,
  allRequiredPoliciesAccepted,
  emptyPolicyChecks,
  isSignupAgeEligible,
  POLICY_ACCEPTANCE_ERROR,
} from "@/components/onboarding/SignupPolicyAcceptance";
import type { PolicyId } from "@/lib/messaging/policyCatalog";
import { gateModeFromCode } from "@/components/messaging/AgePolicyGateModal";

type EligibilityState =
  | "NOT_ELIGIBLE"
  | "AGE_VERIFICATION_REQUIRED"
  | "POLICY_ACCEPTANCE_REQUIRED"
  | "ELIGIBLE"
  | "RESTRICTED"
  | "SUSPENDED";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/hub/fan";
  return raw;
}

function CommunicationSetupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => safeNextPath(searchParams?.get("next") ?? null),
    [searchParams],
  );

  const [loading, setLoading] = useState(true);
  const [dob, setDob] = useState("");
  const [policyChecks, setPolicyChecks] = useState<Record<PolicyId, boolean>>(emptyPolicyChecks);
  const [needAge, setNeedAge] = useState(true);
  const [needPolicy, setNeedPolicy] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  const refreshEligibility = useCallback(async () => {
    try {
      const res = await fetch("/api/messaging/eligibility", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.status === 401) {
        router.replace(`/auth?next=${encodeURIComponent(`/onboarding/communication-setup?next=${nextPath}`)}`);
        return;
      }
      const data = (await res.json()) as {
        eligibility?: { state?: EligibilityState; reason?: string };
      };
      const state = data.eligibility?.state ?? "NOT_ELIGIBLE";
      if (state === "ELIGIBLE") {
        router.replace(nextPath);
        return;
      }
      if (state === "RESTRICTED" || state === "SUSPENDED") {
        setBlocked(true);
        setBlockedMessage(data.eligibility?.reason ?? "Account cannot use messaging.");
        setLoading(false);
        return;
      }
      const mode = gateModeFromCode(state);
      setNeedAge(mode === "age" || mode === "both");
      setNeedPolicy(mode === "policy" || mode === "both");
      setLoading(false);
    } catch {
      setNeedAge(true);
      setNeedPolicy(true);
      setLoading(false);
    }
  }, [nextPath, router]);

  useEffect(() => {
    void refreshEligibility();
  }, [refreshEligibility]);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (needAge) {
        if (!isSignupAgeEligible(dob)) {
          setError(AGE_REQUIRED_ERROR);
          setBusy(false);
          return;
        }
        const ageRes = await fetch("/api/account/update-age", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ dateOfBirth: dob }),
        });
        const ageData = (await ageRes.json()) as { ok?: boolean; error?: string };
        if (!ageRes.ok || !ageData.ok) {
          setError(ageData.error ?? "Age verification failed.");
          setBusy(false);
          return;
        }
      }

      if (needPolicy) {
        if (!allRequiredPoliciesAccepted(policyChecks)) {
          setError(POLICY_ACCEPTANCE_ERROR);
          setBusy(false);
          return;
        }
        const polRes = await fetch("/api/account/policy-accept", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            acceptAll: true,
            liabilityAcknowledged: policyChecks.LIABILITY_ACK === true,
          }),
        });
        const polData = (await polRes.json()) as { ok?: boolean; error?: string };
        if (!polRes.ok || !polData.ok) {
          setError(polData.error ?? "Policy acceptance failed.");
          setBusy(false);
          return;
        }
      }

      router.replace(nextPath);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050510",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          fontSize: 12,
          letterSpacing: "0.12em",
        }}
      >
        CHECKING ACCOUNT…
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #1a0033 0%, #050510 55%)",
        color: "#fff",
        padding: "48px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#00FFFF",
            marginBottom: 8,
          }}
        >
          COMMUNICATION SETUP
        </div>
        <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900 }}>
          {blocked
            ? "Messaging unavailable"
            : needAge && needPolicy
              ? "Verify age & accept policies"
              : needAge
                ? "Age verification required"
                : "Policy acceptance required"}
        </h1>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.5,
          }}
        >
          {blocked
            ? blockedMessage
            : "Complete this required step before messaging. Google sign-in does not skip age or policy consent."}
        </p>

        {blocked ? (
          <button
            type="button"
            onClick={() => router.replace(nextPath)}
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
            Continue to hub
          </button>
        ) : (
          <>
            {needAge && (
              <label style={{ display: "block", marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
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
              <div style={{ marginBottom: 16 }}>
                <SignupPolicyAcceptance
                  checks={policyChecks}
                  onChange={setPolicyChecks}
                  accent="#00FFFF"
                />
              </div>
            )}

            {error && (
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#fca5a5" }}>{error}</p>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={() => void submit()}
              style={{
                width: "100%",
                padding: "13px 0",
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
              {busy ? "SAVING…" : "COMPLETE & CONTINUE"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function CommunicationSetupPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            background: "#050510",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            letterSpacing: "0.12em",
          }}
        >
          LOADING…
        </main>
      }
    >
      <CommunicationSetupInner />
    </Suspense>
  );
}
