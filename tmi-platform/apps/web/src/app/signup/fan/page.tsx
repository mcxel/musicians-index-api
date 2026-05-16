"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OnboardingShell from "@/components/onboarding/OnboardingShell";
import AvatarQuickPick, { type AvatarTier } from "@/components/onboarding/AvatarQuickPick";
import SubscriptionTierRow, { type SubscriptionTier } from "@/components/onboarding/SubscriptionTierRow";

export default function FanSignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatarTier, setAvatarTier] = useState<AvatarTier>("FREE");
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("FREE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const { csrfToken } = await fetch("/api/auth/csrf").then((r) => r.json());
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        credentials: "include",
        body: JSON.stringify({ email, password, dateOfBirth, termsAccepted: true, originalityAccepted: true }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json().catch(() => null);
        setError((data as { message?: string })?.message ?? "Signup failed. Check your details.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  const perks = useMemo(
    () => [
      "Join live rooms + chat reactions",
      "Vote in contests + cyphers",
      "Earn points, badges, and sponsor drops",
    ],
    [],
  );

  const progression = useMemo(
    () => [
      "Step 1: Create fan identity",
      "Step 2: Pick avatar + tier",
      "Step 3: Enter lobbies and start earning XP",
    ],
    [],
  );

  const form = (
    <>
      <header style={{ display: "grid", gap: 8 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#FFD700", fontWeight: 900 }}>
          Fan Signup
        </p>
        <h1 style={{ fontSize: 28, lineHeight: 1.05, fontWeight: 900, color: "#fff", margin: 0 }}>
          Join the Crowd
        </h1>
      </header>

      <div style={{ display: "grid", gap: 10 }}>
        <label style={labelStyle}>Display Name</label>
        <input style={inputStyle} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your fan alias" />
        <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <label style={labelStyle}>Password</label>
        <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ characters" />
        <label style={labelStyle}>Date of Birth</label>
        <input style={inputStyle} type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
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

      <button type="button" style={ctaStyle} onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Creating Account…" : "Create Fan Account →"}
      </button>
      {error && <p style={{ fontSize: 11, color: "#FF4444", margin: 0 }}>{error}</p>}

      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
        Looking for another role?{" "}
        <Link href="/signup" style={{ color: "#00FFFF" }}>
          Back to role selector
        </Link>
      </div>
    </>
  );

  const extras = (
    <>
      <AvatarQuickPick value={avatarTier} onChange={setAvatarTier} />
      <SubscriptionTierRow value={subscriptionTier} onChange={setSubscriptionTier} />
    </>
  );

  return <OnboardingShell role="fan" form={form} extras={extras} />;
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
  color: "#FFD700",
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
  border: "1px solid rgba(255,215,0,0.5)",
  background: "linear-gradient(135deg,#FFD700,#FF2DAA)",
  color: "#050510",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "12px 14px",
  cursor: "pointer",
};
