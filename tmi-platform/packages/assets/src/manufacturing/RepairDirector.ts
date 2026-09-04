import { FOUNDRY_CONFIG } from "./foundry.config";
import { ManufacturingError } from "./ManufacturingError";
import { ManufacturingErrorCode } from "./ManufacturingErrorCode";
import { ManufacturingJob } from "./ManufacturingJob";
import { ManufacturingState } from "./ManufacturingState";

export interface RepairPlan {
  strategy: string;
  retryState: ManufacturingState;
  automatic: boolean;
}

const REPAIR_PLANS: Partial<Record<ManufacturingErrorCode, RepairPlan>> = {
  [ManufacturingErrorCode.AV_3000]: {
    strategy: "regenerate-missing-arkit-targets",
    retryState: ManufacturingState.ARKIT_CREATED,
    automatic: true,
  },
  [ManufacturingErrorCode.AV_3100]: {
    strategy: "rebuild-zero-delta-morph-targets",
    retryState: ManufacturingState.ARKIT_CREATED,
    automatic: true,
  },
  [ManufacturingErrorCode.AV_5000]: {
    strategy: "decimate-and-regenerate-lods",
    retryState: ManufacturingState.LOD_CREATED,
    automatic: true,
  },
  [ManufacturingErrorCode.VN_3100]: {
    strategy: "reposition-seat-anchor-and-regenerate-local-collision",
    retryState: ManufacturingState.ANCHORS_CREATED,
    automatic: true,
  },
  [ManufacturingErrorCode.VN_3200]: {
    strategy: "renumber-and-regenerate-seat-anchors",
    retryState: ManufacturingState.ANCHORS_CREATED,
    automatic: true,
  },
};

export class RepairDirector {
  getPlan(error: ManufacturingError): RepairPlan | undefined {
    return REPAIR_PLANS[error.code];
  }

  prepareRepair(job: ManufacturingJob, error: ManufacturingError): RepairPlan {
    const nextAttempt = job.data.attempt + 1;
    if (nextAttempt > FOUNDRY_CONFIG.maxAutomaticRepairAttempts) {
      job.transition(ManufacturingState.BLOCKED);
      throw new Error(
        `[${ManufacturingErrorCode.MF_1400}] Repair budget exhausted for ${job.data.jobId}`,
      );
    }

    const plan = this.getPlan(error);
    if (!plan || !plan.automatic || error.humanInterventionRequired) {
      job.transition(ManufacturingState.BLOCKED);
      throw new Error(`No safe automatic repair plan for ${error.code}`);
    }

    job.transition(ManufacturingState.REPAIR_REQUIRED);
    job.transition(ManufacturingState.REPAIRING);
    job.recordRepair({
      errorCode: error.code,
      attempt: nextAttempt,
      timestamp: new Date().toISOString(),
      strategy: plan.strategy,
    });
    return plan;
  }
}
