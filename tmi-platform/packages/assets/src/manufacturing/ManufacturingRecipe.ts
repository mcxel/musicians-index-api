import { ManufacturingAssetType } from "./ManufacturingJob";
import { ManufacturingState } from "./ManufacturingState";

export interface ManufacturingStep {
  id: string;
  stateOnSuccess: ManufacturingState;
  script?: string;
  description: string;
  expectedArtifacts?: string[];
}

export interface ManufacturingRecipe {
  id: string;
  version: string;
  assetType: ManufacturingAssetType;
  intentTemplate: Record<string, unknown>;
  steps: ManufacturingStep[];
}
