export interface ManufacturingCoordinateContract {
  blenderAuthoringUpAxis: "Z";
  gltfUpAxis: "Y";
  metersPerUnit: 1;
  runtimeForwardAxis: "-Y";
}

export interface ManufacturingContract {
  contractVersion: string;
  coordinateSystem: ManufacturingCoordinateContract;
  generatedAssetMustContainProvenance: true;
  externallySuppliedMeshPermittedForProof001: false;
}
