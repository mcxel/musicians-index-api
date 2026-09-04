import { ManufacturingErrorCode } from "./ManufacturingErrorCode";

export type ManufacturingSeverity = "INFO" | "WARNING" | "ERROR" | "FATAL";

export interface ManufacturingError {
  code: ManufacturingErrorCode;
  severity: ManufacturingSeverity;
  message: string;
  diagnostic?: Record<string, unknown>;
  repairStrategy?: string;
  humanInterventionRequired: boolean;
  createdAt: string;
  resolvedAt?: string;
}
