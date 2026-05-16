"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import RecoveryStatusCard from "@/components/auth/RecoveryStatusCard";
import { verifyEmailToken } from "@/lib/auth/EmailVerificationEngine";

type Props = {
  params: { token: string };
  searchParams?: { email?: string };
};

export default function VerifyEmailTokenPage({ params, searchParams }: Props) {
  const email = useMemo(() => (searchParams?.email ?? "").trim().toLowerCase(), [searchParams]);
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "warning">("idle");
  const [message, setMessage] = useState("Ready to verify email token.");

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg,#04050c,#090b18)", color: "#fff", padding: "40px 20px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900 }}>Verify Email</h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.74)" }}>
          Confirm account email ownership with a single-use verification token.
        </p>

        {!done && (
          <button
            onClick={() => {
              const result = verifyEmailToken(email, params.token);
              setDone(true);
              if (result.ok) {
                setStatus("success");
                setMessage("Email verification complete.");
              } else if (result.reason === "expired") {
                setStatus("warning");
                setMessage("Verification token expired.");
              } else if (result.reason === "used") {
                setStatus("warning");
                setMessage("Verification token already used.");
              } else {
                setStatus("error");
                setMessage("Invalid verification token.");
              }
            }}
            style={{
              borderRadius: 10,
              border: "1px solid rgba(0,255,255,0.5)",
              background: "rgba(0,255,255,0.12)",
              color: "#bafcff",
              padding: "10px 12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Verify email
          </button>
        )}

        <RecoveryStatusCard title="Verification Status" status={status} message={message} />

        <Link href="/auth" style={{ color: "#93c5fd", fontSize: 13 }}>
          ← Back to auth
        </Link>
      </div>
    </main>
  );
}
