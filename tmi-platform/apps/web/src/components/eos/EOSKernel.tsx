"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { EosLifecycleState, EosValidationResult } from "@/core/eos/types";
import { runEosBootSequence } from "@/core/eos/bootSequence";
import EOSBootScreen from "./EOSBootScreen";

export interface EOSContextValue {
  runtimeState: EosLifecycleState;
  validation: EosValidationResult | null;
  bootError: string | null;
  isReady: boolean;
}

const EOSContext = createContext<EOSContextValue | null>(null);

export function useEOS(): EOSContextValue {
  const ctx = useContext(EOSContext);
  if (!ctx) {
    throw new Error("useEOS must be used within EOSKernel");
  }
  return ctx;
}

export interface EOSKernelProps {
  children: ReactNode;
  /** Experience id used for certification boot (default: test) */
  certificationExperienceId?: string;
}

export default function EOSKernel({
  children,
  certificationExperienceId = "test",
}: EOSKernelProps) {
  const [runtimeState, setRuntimeState] = useState<EosLifecycleState>("BOOT");
  const [validation, setValidation] = useState<EosValidationResult | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    const result = runEosBootSequence(certificationExperienceId);
    setValidation(result.validation);
    setBootError(result.error ?? null);
    setRuntimeState(result.finalState);
  }, [certificationExperienceId]);

  const value = useMemo<EOSContextValue>(
    () => ({
      runtimeState,
      validation,
      bootError,
      isReady: runtimeState === "READY" || runtimeState === "RUNNING",
    }),
    [runtimeState, validation, bootError]
  );

  if (runtimeState === "CRITICAL_FAILURE") {
    return (
      <div style={{ minHeight: "100vh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <EOSBootScreen state={runtimeState} error={bootError} />
      </div>
    );
  }

  if (runtimeState !== "READY" && runtimeState !== "RUNNING") {
    return (
      <div style={{ minHeight: "100vh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <EOSBootScreen state={runtimeState} />
      </div>
    );
  }

  return <EOSContext.Provider value={value}>{children}</EOSContext.Provider>;
}
