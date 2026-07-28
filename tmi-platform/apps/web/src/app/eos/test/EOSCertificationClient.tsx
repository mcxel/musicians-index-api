"use client";

import { useMemo } from "react";
import EOSKernel, { useEOS } from "@/components/eos/EOSKernel";
import StageLoader from "@/components/eos/StageLoader";
import { getAllExperiences } from "@/registries/eos/ExperienceRegistry";
import { validateAllExperiences } from "@/core/eos/RuntimeValidator";

function CertificationPanel() {
  const { runtimeState, validation, bootError, isReady } = useEOS();
  const experiences = useMemo(() => getAllExperiences().filter((e) => e.id !== "test"), []);
  const fullValidation = useMemo(() => validateAllExperiences(), []);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>
          PHASE 1 — EOS FOUNDATION
        </div>
        <h1 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, marginBottom: 8 }}>
          Experience Operating System Certification
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 28, maxWidth: 560 }}>
          Registry boot, contract validation, and StageLoader pipeline. Every blueprint experience is a registered module — not a video file.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Kernel State", value: runtimeState, color: isReady ? "#00FF88" : "#FFD700" },
            { label: "Registry Valid", value: fullValidation.valid ? "PASS" : "FAIL", color: fullValidation.valid ? "#00FF88" : "#FF4D4D" },
            { label: "Experiences", value: String(experiences.length + 1), color: "#00FFFF" },
            { label: "Errors", value: String(fullValidation.errors.length), color: fullValidation.errors.length ? "#FF4D4D" : "#00FF88" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color }}>{value}</div>
            </div>
          ))}
        </div>

        {bootError && (
          <div style={{ background: "rgba(255,77,77,0.08)", border: "1px solid #FF4D4D", borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 11, color: "#FF4D4D" }}>
            {bootError}
          </div>
        )}

        {validation && !validation.valid && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#FF4D4D", marginBottom: 8 }}>VALIDATION ERRORS</div>
            {validation.errors.map((e) => (
              <div key={e} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>• {e}</div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#FFD700", marginBottom: 12 }}>
            STAGE LOADER — TEST EXPERIENCE
          </div>
          <StageLoader experienceId="test" role="fan" previewMode />
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#FF2DAA", marginBottom: 12 }}>
            REGISTERED BLUEPRINT EXPERIENCES
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {experiences.map((exp) => (
              <div key={exp.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{exp.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
                  {exp.category} · {exp.avatarMode} · v{exp.version}
                </div>
                <StageLoader experienceId={exp.id} role="fan" previewMode />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EOSCertificationClient() {
  return (
    <EOSKernel certificationExperienceId="test">
      <CertificationPanel />
    </EOSKernel>
  );
}
