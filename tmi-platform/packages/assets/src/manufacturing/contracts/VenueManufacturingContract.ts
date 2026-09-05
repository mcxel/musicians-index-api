import { ManufacturingContract } from "./ManufacturingContract";

export interface VenueManufacturingContract extends ManufacturingContract {
  assetType: "VENUE";
  requireCollision: true;
  requireSeatAnchors: true;
  requireSpawnAnchors: true;
  requireMediaSurfaces: true;
  requireCameraAnchors: true;
}
