"use client";

import { useState } from "react";
import { requestFamilyVerification } from "@/lib/safety/FamilyVerificationEngine";

type FamilyVerificationPromptProps = {
  teenUserId: string;
};

export default function FamilyVerificationPrompt({ teenUserId }: FamilyVerificationPromptProps) {
  const [adultUserId, setAdultUserId] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);

  return (
    <section style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: 12, background: "rgba(12,14,24,0.85)" }}>
      <h3 style={{ marginTop: 0, fontSize: 13, color: "#f8fafc" }}>Family Verification</h3>
      <p style={{ fontSize: 11, color: "#94a3b8" }}>Submit a guardian-verified family request to unlock approved adult contact.</p>
      <div style={{ display: "grid", gap: 8 }}>
        <input
          value={adultUserId}
          onChange={(event) => setAdultUserId(event.target.value)}
          placeholder="Adult account id"
          style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "8px 10px" }}
        />
        <input
          value={guardianEmail}
          onChange={(event) => setGuardianEmail(event.target.value)}
          placeholder="Guardian email"
          style={{ borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "8px 10px" }}
        />
        <button
          type="button"
          disabled={!adultUserId.trim() || !guardianEmail.trim()}
          onClick={() => {
            const request = requestFamilyVerification(teenUserId, adultUserId.trim(), guardianEmail.trim());
            setRequestId(request.id);
          }}
          style={{ borderRadius: 8, border: "1px solid #0ea5e9", background: "#082f49", color: "#e0f2fe", padding: "8px 10px", cursor: "pointer" }}
        >
          Submit Verification Request
        </button>
      </div>
      {requestId ? <div style={{ marginTop: 8, fontSize: 11, color: "#cbd5e1" }}>Created request: {requestId}</div> : null}
    </section>
  );
}
