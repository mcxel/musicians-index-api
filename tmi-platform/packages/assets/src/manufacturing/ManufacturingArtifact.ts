export type ManufacturingArtifactKind =
  | "INTENT"
  | "CONCEPT"
  | "BLEND"
  | "GLB"
  | "COLLISION_GLB"
  | "MANIFEST"
  | "REPORT"
  | "LOG";

export interface ManufacturingArtifact {
  id: string;
  kind: ManufacturingArtifactKind;
  path: string;
  createdAt: string;
  checksumSha256?: string;
  metadata?: Record<string, unknown>;
}
