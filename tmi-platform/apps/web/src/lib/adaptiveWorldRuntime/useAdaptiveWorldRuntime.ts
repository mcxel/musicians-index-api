"use client";

import { useEffect } from "react";
import type { AwrQualityContractId } from "./types";
import { getAdaptiveWorldRuntime } from "./TMIAdaptiveExperienceRuntime";

/** Start frame budget + register a quality contract while a wall surface is mounted. */
export function useAdaptiveWorldRuntime(contractId: AwrQualityContractId): void {
  useEffect(() => {
    const awr = getAdaptiveWorldRuntime();
    return awr.attachConsumer(contractId);
  }, [contractId]);
}
