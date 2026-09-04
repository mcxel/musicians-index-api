import { ManufacturingArtifact } from "./ManufacturingArtifact";
import { ManufacturingError } from "./ManufacturingError";
import { ManufacturingErrorCode } from "./ManufacturingErrorCode";
import { ManufacturingState, assertTransition } from "./ManufacturingState";

export type ManufacturingAssetType = "AVATAR" | "VENUE";

export interface RepairHistoryEntry {
  errorCode: ManufacturingErrorCode;
  attempt: number;
  timestamp: string;
  strategy: string;
  outcome?: "SUCCESS" | "FAILED";
}

export interface ManufacturingJobData {
  jobId: string;
  assetId: string;
  assetType: ManufacturingAssetType;
  recipeId: string;
  recipeVersion: string;
  state: ManufacturingState;
  attempt: number;
  createdAt: string;
  updatedAt: string;
  intentPath: string;
  artifacts: ManufacturingArtifact[];
  errors: ManufacturingError[];
  repairHistory: RepairHistoryEntry[];
  provenance: {
    rigVersion?: string;
    motionPackageVersion?: string;
    generator: string;
    generatorVersion: string;
    sourceIntent: string;
  };
}

export class ManufacturingJob {
  constructor(public readonly data: ManufacturingJobData) {}

  transition(next: ManufacturingState): void {
    assertTransition(this.data.state, next);
    this.data.state = next;
    this.touch();
  }

  addArtifact(artifact: ManufacturingArtifact): void {
    this.data.artifacts.push(artifact);
    this.touch();
  }

  addError(error: ManufacturingError): void {
    this.data.errors.push(error);
    this.touch();
  }

  recordRepair(entry: RepairHistoryEntry): void {
    this.data.repairHistory.push(entry);
    this.data.attempt = Math.max(this.data.attempt, entry.attempt);
    this.touch();
  }

  private touch(): void {
    this.data.updatedAt = new Date().toISOString();
  }

  toJSON(): ManufacturingJobData {
    return structuredClone(this.data);
  }

  static create(input: Omit<ManufacturingJobData,
    "state" | "attempt" | "createdAt" | "updatedAt" | "artifacts" | "errors" | "repairHistory"
  >): ManufacturingJob {
    const now = new Date().toISOString();
    return new ManufacturingJob({
      ...input,
      state: ManufacturingState.REQUESTED,
      attempt: 0,
      createdAt: now,
      updatedAt: now,
      artifacts: [],
      errors: [],
      repairHistory: [],
    });
  }
}
