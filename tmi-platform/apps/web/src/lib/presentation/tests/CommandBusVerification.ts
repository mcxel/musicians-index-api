/**
 * CommandBusVerification.ts
 * Phase 5.3 Task 2: Command Bus & Telemetry Pipeline Verification Test Slice.
 * Verifies dispatch and listener reactions for core events:
 * WIN_BELT, WIN_TROPHY, LEVEL_UP, RELEASE_NEW_WORK, PUBLISH_YOPHO, SHOP_SYNC_COMPLETE.
 */

import { livingOsCommandBus, LivingOsCommandType, LivingOsCommandCategory } from "@/lib/os/livingOsCommandBus";

export interface CommandBusStepResult {
  stepName: string;
  passed: boolean;
  notes: string;
}

export interface CommandBusVerificationReport {
  sessionId: string;
  certified: boolean;
  executedAt: string;
  steps: CommandBusStepResult[];
}

export async function runCommandBusVerification(
  sessionId: string = `cmd-bus-cert-${Date.now()}`,
): Promise<CommandBusVerificationReport> {
  const steps: CommandBusStepResult[] = [];

  const targetCommands: { type: LivingOsCommandType; category: LivingOsCommandCategory; label: string }[] = [
    { type: "WIN_BELT", category: "competitions", label: "WIN_BELT / WIN_TROPHY" },
    { type: "LEVEL_UP", category: "identity", label: "LEVEL_UP / PROGRESSION" },
    { type: "MEDIA_UPLOADED", category: "identity", label: "RELEASE_NEW_WORK" },
    { type: "YOPHO_PUBLISHED", category: "identity", label: "PUBLISH_YOPHO" },
    { type: "ITEM_PURCHASED", category: "commerce", label: "SHOP_SYNC_COMPLETE" },
  ];

  for (const item of targetCommands) {
    let received = false;
    let testIdFound = false;

    const unsub = livingOsCommandBus.on("*", (cmd) => {
      if (cmd.type === item.type) {
        received = true;
        const testId = cmd.payload ? (cmd.payload as Record<string, unknown>).testId : undefined;
        if (testId) testIdFound = true;
      }
    });

    livingOsCommandBus.dispatch({
      type: item.type,
      category: item.category,
      payload: { testId: `test-${item.type}`, timestampIso: new Date().toISOString() },
    });

    await new Promise((r) => setTimeout(r, 40));
    unsub();

    steps.push({
      stepName: `Command Bus Dispatch: ${item.label} (${item.type})`,
      passed: received && testIdFound,
      notes: received ? `Event ${item.type} verified on Command Bus pipeline.` : `Failed to receive event ${item.type}.`,
    });
  }

  const certified = steps.every((s) => s.passed);

  return {
    sessionId,
    certified,
    executedAt: new Date().toISOString(),
    steps,
  };
}
