import { listPlatformConnections } from "@/lib/core/tmiPlatformConnectionRegistry";
import { listSystemDependencies } from "@/lib/core/tmiSystemDependencyMap";
import { findDuplicateSystems } from "@/lib/core/tmiNoDuplicateSystemGuard";
import { enforceGlobalBackRouteLaw } from "@/lib/core/tmiGlobalBackRouteLaw";

export type TmiReadinessManifest = {
  totalSystems: number;
  totalDependencies: number;
  duplicateIssues: number;
  backRouteIssues: number;
  adminObservableSystems: number;
  lockedSystems: number;
};

export function buildPlatformReadinessManifest(): TmiReadinessManifest {
  const systems = listPlatformConnections();
  const dependencies = listSystemDependencies();
  const duplicates = findDuplicateSystems();
  const backRouteIssues = enforceGlobalBackRouteLaw();

  return {
    totalSystems: systems.length,
    totalDependencies: dependencies.length,
    duplicateIssues: duplicates.length,
    backRouteIssues: backRouteIssues.length,
    adminObservableSystems: systems.filter((s) => s.observableByAdmin).length,
    lockedSystems: systems.filter((s) => s.monitorFeed === "locked").length,
  };
}
