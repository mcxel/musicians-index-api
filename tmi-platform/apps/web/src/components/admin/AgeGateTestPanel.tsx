"use client";

import { evaluateAgeGate } from "@/lib/safety/ageGateEngine";

export default function AgeGateTestPanel() {
  const adultToMinor = evaluateAgeGate("adult", {
    spaceId: "minor-safe-1",
    spaceType: "minor-only",
    requiresGuardian: true,
    sandboxMode: true,
  });

  const minorToMinor = evaluateAgeGate("test_minor", {
    spaceId: "minor-safe-1",
    spaceType: "minor-only",
    requiresGuardian: true,
    sandboxMode: true,
  });

  return (
    <section data-testid="age-gate-test-panel" style={{ border: "1px solid rgba(56,189,248,0.4)", borderRadius: 10, padding: 12, background: "#0f172a" }}>
      <h3 style={{ marginTop: 0, color: "#93c5fd" }}>Age Gate Test Panel</h3>
      <div data-testid="age-gate-adult-minor" style={{ color: adultToMinor.allowed ? "#86efac" : "#fca5a5", fontSize: 12 }}>
        adult {"->"} minor-only: {adultToMinor.allowed ? "ALLOW" : "BLOCK"}
      </div>
      <div data-testid="age-gate-minor-minor" style={{ color: minorToMinor.allowed ? "#86efac" : "#fca5a5", fontSize: 12 }}>
        test_minor {"->"} minor-only: {minorToMinor.allowed ? "ALLOW" : "BLOCK"}
      </div>
    </section>
  );
}
