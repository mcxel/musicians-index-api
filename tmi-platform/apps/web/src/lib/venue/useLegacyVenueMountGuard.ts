"use client";

import { useEffect } from "react";
import {
  legacyCodeForComponent,
  reportLegacyVenueMount,
  type LegacyVenueErrorCode,
} from "@/lib/venue/LegacyVenueReachabilityDetector";

/** Emit LEGACY-VENUE-00x when a legacy venue panel mounts outside VENUE TOOLS. */
export function useLegacyVenueMountGuard(
  componentId: string,
  sourceFile: string,
  code?: LegacyVenueErrorCode,
): void {
  useEffect(() => {
    reportLegacyVenueMount(code ?? legacyCodeForComponent(componentId), componentId, sourceFile);
  }, [componentId, sourceFile, code]);
}
