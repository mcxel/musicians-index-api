"use client";

import { runMinorSafetyTestSuite } from "@/lib/safety/safetyTestBotEngine";

export default function MinorSafetyMonitor() {
  const results = runMinorSafetyTestSuite();
  return (
    <section data-testid="minor-safety-monitor" style={{ display: "grid", gap: 10 }}>
      <h2 style={{ margin: 0, color: "#67e8f9", fontSize: 16 }}>Minor Safety Monitor</h2>
      {results.map((r) => (
        <div
          key={r.id}
          data-testid={`minor-safety-test-${r.id}`}
          style={{
            border: "1px solid rgba(148,163,184,0.35)",
            borderRadius: 8,
            background: "#0f172a",
            padding: 10,
            color: r.passed ? "#86efac" : "#fca5a5",
            fontSize: 12,
          }}
        >
          {r.name}: {r.passed ? "PASS" : "FAIL"} ({r.actual})
        </div>
      ))}
    </section>
  );
}
