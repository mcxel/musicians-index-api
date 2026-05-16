"use client";

import { useMemo, useState } from "react";
import { addFamilyCircleMember } from "@/lib/safety/FamilyCircleEngine";

type FamilyMemberRequestPanelProps = {
  teenUserId: string;
};

export default function FamilyMemberRequestPanel({ teenUserId }: FamilyMemberRequestPanelProps) {
  const [adultUserId, setAdultUserId] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const disabled = useMemo(() => adultUserId.trim().length === 0, [adultUserId]);

  return (
    <section style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: 12, background: "rgba(12,14,24,0.85)" }}>
      <h3 style={{ marginTop: 0, fontSize: 13, color: "#f8fafc" }}>Family Member Request</h3>
      <p style={{ fontSize: 11, color: "#94a3b8" }}>Only guardian-verified adults can be added to a teen family circle.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={adultUserId}
          onChange={(event) => setAdultUserId(event.target.value)}
          placeholder="Adult account id"
          style={{ flex: 1, borderRadius: 8, border: "1px solid #334155", background: "#020617", color: "#e2e8f0", padding: "8px 10px" }}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const outcome = addFamilyCircleMember(teenUserId, adultUserId.trim());
            setResult(outcome.reason);
          }}
          style={{ borderRadius: 8, border: "1px solid #0ea5e9", background: "#082f49", color: "#e0f2fe", padding: "8px 10px", cursor: disabled ? "not-allowed" : "pointer" }}
        >
          Add
        </button>
      </div>
      {result ? <div style={{ marginTop: 8, fontSize: 11, color: "#cbd5e1" }}>{result}</div> : null}
    </section>
  );
}
