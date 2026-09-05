export enum ManufacturingState {
  REQUESTED = "REQUESTED",
  PLANNING = "PLANNING",
  CONCEPT_CREATED = "CONCEPT_CREATED",
  MESH_CREATED = "MESH_CREATED",
  UV_CREATED = "UV_CREATED",
  RIG_CREATED = "RIG_CREATED",
  SKINNING_CREATED = "SKINNING_CREATED",
  ARKIT_CREATED = "ARKIT_CREATED",
  MATERIALS_CREATED = "MATERIALS_CREATED",
  ANIMATIONS_ATTACHED = "ANIMATIONS_ATTACHED",
  LOD_CREATED = "LOD_CREATED",
  COLLISION_CREATED = "COLLISION_CREATED",
  ANCHORS_CREATED = "ANCHORS_CREATED",
  NORMALIZATION_PASS = "NORMALIZATION_PASS",
  VALIDATION_PASS = "VALIDATION_PASS",
  EXPORT_COMPLETE = "EXPORT_COMPLETE",
  INGESTION_COMPLETE = "INGESTION_COMPLETE",
  CERTIFICATION_READY = "CERTIFICATION_READY",
  CERTIFIED = "CERTIFIED",

  REPAIR_REQUIRED = "REPAIR_REQUIRED",
  REPAIRING = "REPAIRING",
  BLOCKED = "BLOCKED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

const HAPPY_PATH: ManufacturingState[] = [
  ManufacturingState.REQUESTED,
  ManufacturingState.PLANNING,
  ManufacturingState.CONCEPT_CREATED,
  ManufacturingState.MESH_CREATED,
  ManufacturingState.UV_CREATED,
  ManufacturingState.RIG_CREATED,
  ManufacturingState.SKINNING_CREATED,
  ManufacturingState.ARKIT_CREATED,
  ManufacturingState.MATERIALS_CREATED,
  ManufacturingState.ANIMATIONS_ATTACHED,
  ManufacturingState.LOD_CREATED,
  ManufacturingState.COLLISION_CREATED,
  ManufacturingState.ANCHORS_CREATED,
  ManufacturingState.NORMALIZATION_PASS,
  ManufacturingState.VALIDATION_PASS,
  ManufacturingState.EXPORT_COMPLETE,
  ManufacturingState.INGESTION_COMPLETE,
  ManufacturingState.CERTIFICATION_READY,
  ManufacturingState.CERTIFIED,
];

const TERMINAL = new Set([
  ManufacturingState.CERTIFIED,
  ManufacturingState.FAILED,
  ManufacturingState.CANCELLED,
]);

export function isTerminalState(state: ManufacturingState): boolean {
  return TERMINAL.has(state);
}

export function canTransition(
  from: ManufacturingState,
  to: ManufacturingState,
): boolean {
  if (from === to) return true;
  if (isTerminalState(from)) return false;

  if (to === ManufacturingState.CANCELLED) return true;
  if (to === ManufacturingState.REPAIR_REQUIRED) return true;
  if (from === ManufacturingState.REPAIR_REQUIRED && to === ManufacturingState.REPAIRING) return true;
  if (from === ManufacturingState.REPAIRING) {
    return to !== ManufacturingState.CERTIFIED && to !== ManufacturingState.REQUESTED;
  }
  if (to === ManufacturingState.BLOCKED || to === ManufacturingState.FAILED) return true;
  if (from === ManufacturingState.BLOCKED) return false;

  const fromIndex = HAPPY_PATH.indexOf(from);
  const toIndex = HAPPY_PATH.indexOf(to);
  return fromIndex >= 0 && toIndex === fromIndex + 1;
}

export function assertTransition(
  from: ManufacturingState,
  to: ManufacturingState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`[TMI-MF-1002] Illegal manufacturing state transition: ${from} -> ${to}`);
  }
}
