"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EosLifecycleState, EosRole, RuntimeManifest } from "@/core/eos/types";
import { EOS_LIFECYCLE_ORDER } from "@/core/eos/bootSequence";
import { validateExperienceDefinition } from "@/core/eos/RuntimeValidator";
import { resolveRuntimeManifest } from "@/registries/eos/resolveRuntimeManifest";
import { preloadAssetBundle } from "@/registries/eos/AssetRegistry";
import { ExperienceRuntimeProvider } from "@/components/eos/ExperienceRuntimeContext";
import ExperienceMount from "@/components/eos/ExperienceMount";
import EOSBootScreen from "./EOSBootScreen";

export interface StageLoaderProps {
  experienceId: string;
  role?: EosRole;
  venueId?: string;
  roomId?: string;
  /** When true, show launch panel instead of mounting experience */
  previewMode?: boolean;
  children?: React.ReactNode;
}

function logEos(step: EosLifecycleState | string, detail?: string) {
  if (typeof window === "undefined") return;
  const msg = detail ? `[EOS // ${step}] ${detail}` : `[EOS // ${step}]`;
  console.info(msg);
}

function logEosStep(n: number, label: string, detail?: string) {
  if (typeof window === "undefined") return;
  const msg = detail ? `[EOS] ${n}. ${label} — ${detail}` : `[EOS] ${n}. ${label}`;
  console.info(msg);
}

/** Force client HMR pickup when RoleRegistry categories change */
const EOS_ROLE_GATE_REV = "live-showcase-v2";

export default function StageLoader({
  experienceId,
  role = "fan",
  venueId,
  roomId,
  previewMode = false,
  children,
}: StageLoaderProps) {
  const [status, setStatus] = useState<EosLifecycleState>("BOOT");
  const [error, setError] = useState<string | null>(null);
  const [manifest, setManifest] = useState<RuntimeManifest | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function runPipeline() {
      setError(null);
      setManifest(null);
      setStatus("BOOT");

      try {
        let resolved: RuntimeManifest | null = null;
        let pipelineStep = "BOOT";

        logEosStep(0, "Starting pipeline", `${experienceId} · gate=${EOS_ROLE_GATE_REV}`);

        for (const step of EOS_LIFECYCLE_ORDER) {
          if (step === "RUNNING") break;
          if (cancelled) return;
          pipelineStep = step;
          setStatus(step);
          logEos(step);

          if (step === "VALIDATE") {
            logEosStep(1, "Resolving manifest", experienceId);
            resolved = resolveRuntimeManifest(experienceId, role);
            logEosStep(2, "Manifest resolved", `${resolved.experience.title} · widgets: ${resolved.experience.widgetIds.join(", ")}`);
            const contract = validateExperienceDefinition(resolved.experience);
            if (!contract.valid) {
              throw new Error(`[${step}] ${contract.errors.join("; ")}`);
            }
            if (contract.warnings.length) {
              console.warn("[EOS] Manifest warnings:", contract.warnings.join("; "));
            }
            logEosStep(3, "Contract validated");
            setManifest(resolved);
          }

          if (step === "LOAD_ASSETS" && resolved) {
            logEosStep(4, "Loading assets", resolved.experience.venueId);
            // Never block boot on slow/missing media — 3s hard ceiling
            await Promise.race([
              preloadAssetBundle(resolved.experience.venueId),
              new Promise<void>((r) => setTimeout(r, 3000)),
            ]);
            logEosStep(4, "Assets loaded (or timed out gracefully)");
          }

          if (step === "INITIALIZE_SERVICES") {
            logEosStep(5, "Services initialized");
          }

          if (step === "INITIALIZE_RUNTIME") {
            logEosStep(6, "Runtime initializing", experienceId);
            logEos("RUNTIME", experienceId);
          }

          if (step !== "READY") {
            await new Promise((r) => setTimeout(r, 40));
          }
        }

        if (cancelled) return;
        setStatus("READY");
        await new Promise((r) => setTimeout(r, 60));
        if (cancelled) return;
        setStatus("RUNNING");
        logEosStep(7, "DONE — runtime mounted", experienceId);
        logEos("RUNNING", `${experienceId} mounted`);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[EOS] CRITICAL FAILURE for "${experienceId}":`, msg);
        setError(msg);
        setStatus("CRITICAL_FAILURE");
      }
    }

    void runPipeline();
    return () => {
      cancelled = true;
    };
  }, [experienceId, role]);

  if (status !== "RUNNING") {
    return <EOSBootScreen state={status} error={error} />;
  }

  if (!manifest) return <EOSBootScreen state="CRITICAL_FAILURE" error="Manifest missing" />;

  if (previewMode) {
    return (
      <div
        style={{
          background: "rgba(5,5,16,0.92)",
          border: "1px solid rgba(0,255,255,0.25)",
          borderRadius: 12,
          padding: 20,
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#00FFFF", marginBottom: 8 }}>
          EOS RUNTIME
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{manifest.experience.title}</h2>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          {manifest.venue.displayName} · {manifest.experience.avatarMode} ·{" "}
          {manifest.experience.networkMode}
        </p>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
          Widgets: {manifest.widgets.map((w) => w.displayName).join(", ")}
        </div>
        <Link
          href={manifest.experience.entryRoute}
          style={{
            display: "inline-block",
            padding: "10px 18px",
            background: "linear-gradient(135deg,#AA2DFF,#FF2DAA)",
            borderRadius: 8,
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textDecoration: "none",
          }}
        >
          ENTER EXPERIENCE →
        </Link>
      </div>
    );
  }

  return (
    <ExperienceRuntimeProvider manifest={manifest}>
      {children ?? (
        <ExperienceMount
          experienceId={experienceId}
          roomId={roomId}
          venueId={venueId ?? manifest.experience.venueId}
        />
      )}
    </ExperienceRuntimeProvider>
  );
}
