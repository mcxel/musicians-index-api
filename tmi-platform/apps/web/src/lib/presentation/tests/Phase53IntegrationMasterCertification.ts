/**
 * Phase53IntegrationMasterCertification.ts
 * Unified Master Runner for Phase 5.3 Cross-System Integration Certification.
 * Executes Tasks 1 through 5 in strict sequential order:
 * 1. Runtime Drawer Certification
 * 2. Command Bus Verification
 * 3. Active Performer Context Rebinding
 * 4. Ceremony Director & Championship Trigger Verification
 * 5. Observatory Real Health Telemetry
 */

import { runRuntimeDrawerCertification, RuntimeDrawerCertReport } from "./RuntimeDrawerCertification";
import { runCommandBusVerification, CommandBusVerificationReport } from "./CommandBusVerification";
import { runActivePerformerContextVerification, ActivePerformerContextReport } from "./ActivePerformerContextVerification";
import { runCeremonyDirectorVerification, CeremonyDirectorReport } from "./CeremonyDirectorVerification";
import { runObservatoryHealthVerification, ObservatoryHealthReport } from "./ObservatoryHealthVerification";

export interface MasterIntegrationCertResult {
  certified: boolean;
  executedAt: string;
  task1RuntimeDrawer: RuntimeDrawerCertReport;
  task2CommandBus: CommandBusVerificationReport;
  task3ActivePerformerContext: ActivePerformerContextReport;
  task4CeremonyDirector: CeremonyDirectorReport;
  task5ObservatoryHealth: ObservatoryHealthReport;
}

export async function runPhase53MasterCertification(): Promise<MasterIntegrationCertResult> {
  // Task 1: Runtime Drawer Certification
  const task1RuntimeDrawer = await runRuntimeDrawerCertification();

  // Task 2: Command Bus Verification
  const task2CommandBus = await runCommandBusVerification();

  // Task 3: Active Performer Context Rebinding
  const task3ActivePerformerContext = await runActivePerformerContextVerification("marcel-id");

  // Task 4: Ceremony Director & Championship Trigger
  const task4CeremonyDirector = await runCeremonyDirectorVerification("marcel-id", "Marcel ID", "WIN_BELT");

  // Task 5: Observatory Real Health Telemetry
  const task5ObservatoryHealth = await runObservatoryHealthVerification();

  const certified =
    task1RuntimeDrawer.certified &&
    task2CommandBus.certified &&
    task3ActivePerformerContext.certified &&
    task4CeremonyDirector.certified &&
    task5ObservatoryHealth.certified;

  return {
    certified,
    executedAt: new Date().toISOString(),
    task1RuntimeDrawer,
    task2CommandBus,
    task3ActivePerformerContext,
    task4CeremonyDirector,
    task5ObservatoryHealth,
  };
}
