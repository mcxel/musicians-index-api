import { ManufacturingContract } from "./ManufacturingContract";

export interface AvatarManufacturingContract extends ManufacturingContract {
  assetType: "AVATAR";
  rigVersion: "AvatarRig/1.0";
  motionPackageVersion: "AvatarMotionPackage/1.0";
  requireActualMorphTargetVertexDeltas: true;
  requireLods: ["LOD0", "LOD1", "LOD2"];
  requireCollisionMetadata: true;
  requireCanonicalSockets: true;
}
