"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import SignupPolicyAcceptance, {
  AGE_REQUIRED_ERROR,
  POLICY_ACCEPTANCE_ERROR,
  allRequiredPoliciesAccepted,
  emptyPolicyChecks,
  isSignupAgeEligible,
} from "@/components/onboarding/SignupPolicyAcceptance";
import type { PolicyId } from "@/lib/messaging/policyCatalog";


export default function PerformerSignupPage() {
  const router = useRouter();
  const [stageName, setStageName] = useState("");
  const [email, setEmail] = useState("");
  const [genre, setGenre] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [policyChecks, setPolicyChecks] = useState<Record<PolicyId, boolean>>(emptyPolicyChecks);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const policiesOk = allRequiredPoliciesAccepted(policyChecks);
  const canSubmit = Boolean(email.trim() && password && dateOfBirth && policiesOk);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean }) => {
        if (active && d?.authenticated) {
          router.replace("/hub/performer");
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [router]);

  async function handleSubmit() {
    console.log("[TMI] handleSubmit entered. Performer Signup. Email:", email);
    if (!email.trim() || !password || !dateOfBirth) {
      setError("Email, password, and date of birth are required.");
      return;
    }
    if (!isSignupAgeEligible(dateOfBirth)) {
      setError(AGE_REQUIRED_ERROR);
      return;
    }
    if (!policiesOk) {
      setError(POLICY_ACCEPTANCE_ERROR);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { csrfToken } = await fetch("/api/auth/csrf").then((r) => r.json());
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          dateOfBirth,
          displayName: stageName,
          termsAccepted: true,
          originalityAccepted: true,
          roles: ["PERFORMER"],
        }),
      });
      if (res.ok) {
        router.replace("/hub/performer");
      } else {
        const data = await res.json().catch(() => null);
        setError((data as { error?: string; message?: string })?.error ?? (data as { message?: string })?.message ?? "Signup failed. Check your details.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  const perks = useMemo(
    () => [
      "Launch performer profile + media rail",
      "Enter cypher and battle rotations",
      "Unlock booking + audience growth surfaces",
    ],
    [],
  );

  const progression = useMemo(
    () => [
      "Step 1: Define performer identity",
      "Step 2: Select visual tier + subscription",
      "Step 3: Publish profile and go live",
    ],
    [],
  );

  const form = (
    <>
      <header style={{ display: "grid", gap: 8 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#FF2DAA", fontWeight: 900 }}>
          Performer Signup
        </p>
        <h1 style={{ fontSize: 28, lineHeight: 1.05, fontWeight: 900, color: "#fff", margin: 0 }}>
          Step Into the Spotlight
        </h1>
      </header>

      <div style={{ display: "grid", gap: 10 }}>
        <label style={labelStyle}>Stage Name <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>(Optional)</span></label>
        <input style={inputStyle} value={stageName} onChange={(e) => setStageName(e.target.value)} placeholder="Artist / performer name" />
        <label style={labelStyle}>Email *</label>
        <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        <label style={labelStyle}>Primary Genre <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>(Optional)</span></label>
        <input style={inputStyle} value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Hip-hop, R&B, Pop, etc." />
        <label style={labelStyle}>Password *</label>
        <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ characters" required />
        <label style={labelStyle}>Date of Birth *</label>
        <input style={inputStyle} type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
        <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Required — you must be 16+ to join TMI.</p>
        <SignupPolicyAcceptance checks={policyChecks} onChange={setPolicyChecks} accent="#FF2DAA" />
      </div>

      <div style={cardStyle}>
        <p style={microTitle}>Onboarding Benefits</p>
        <ul style={listStyle}>
          {perks.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>

      <div style={cardStyle}>
        <p style={microTitle}>Progression Path</p>
        <ul style={listStyle}>
          {progression.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>

      <button type="button" style={{ ...ctaStyle, opacity: submitting || !canSubmit ? 0.5 : 1, cursor: submitting || !canSubmit ? "not-allowed" : "pointer" }} onClick={handleSubmit} disabled={submitting || !canSubmit}>
        {submitting ? "Creating Account…" : "Create Performer Account →"}
      </button>
      {error && <p style={{ fontSize: 11, color: "#FF4444", margin: 0 }}>{error}</p>}

      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
        Need another role?{" "}
        <Link href="/signup" style={{ color: "#00FFFF" }}>
          Back to role selector
        </Link>
      </div>
    </>
  );

  return <OnboardingShell role="artist" form={form} />;
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.6)",
  fontWeight: 800,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  padding: "10px 12px",
  fontSize: 14,
};

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  padding: "10px 12px",
};

const microTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 9,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#FF2DAA",
  fontWeight: 900,
};

const listStyle: React.CSSProperties = {
  margin: "8px 0 0 16px",
  padding: 0,
  color: "rgba(255,255,255,0.78)",
  fontSize: 12,
  lineHeight: 1.5,
};

const ctaStyle: React.CSSProperties = {
  borderRadius: 10,
  border: "1px solid rgba(255,45,170,0.5)",
  background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)",
  color: "#050510",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "12px 14px",
  cursor: "pointer",
};
