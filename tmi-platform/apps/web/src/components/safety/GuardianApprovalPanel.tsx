"use client";

import { useState } from "react";
import { approveFamilyVerification, rejectFamilyVerification } from "@/lib/safety/FamilyVerificationEngine";

type GuardianApprovalPanelProps = {
  requestId: string;
};

export default function GuardianApprovalPanel({ requestId }: GuardianApprovalPanelProps) {
  const [status, setStatus] = useState<string>("pending");

  return (
    <section style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: 12, background: "rgba(12,14,24,0.85)" }}>
      <h3 style={{ marginTop: 0, fontSize: 13, color: "#f8fafc" }}>Guardian Approval</h3>
      <p style={{ fontSize: 11, color: "#94a3b8" }}>Guardian approval is required before teen-adult contact is enabled.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => {
            const record = approveFamilyVerification(requestId);
            setStatus(record?.status ?? "missing-request");
          }}
          style={{ borderRadius: 8, border: "1px solid #22c55e", background: "#052e16", color: "#bbf7d0", padding: "8px 10px", cursor: "pointer" }}
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => {
            const record = rejectFamilyVerification(requestId);
            setStatus(record?.status ?? "missing-request");
          }}
          style={{ borderRadius: 8, border: "1px solid #ef4444", background: "#450a0a", color: "#fecaca", padding: "8px 10px", cursor: "pointer" }}
        >
          Reject
        </button>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: "#cbd5e1" }}>Status: {status}</div>
    </section>
  );
}
