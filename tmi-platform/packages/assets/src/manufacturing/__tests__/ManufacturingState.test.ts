import assert from "node:assert/strict";
import { canTransition, ManufacturingState } from "../ManufacturingState";

assert.equal(
  canTransition(ManufacturingState.REQUESTED, ManufacturingState.PLANNING),
  true,
);
assert.equal(
  canTransition(ManufacturingState.REQUESTED, ManufacturingState.CERTIFIED),
  false,
);
assert.equal(
  canTransition(ManufacturingState.VALIDATION_PASS, ManufacturingState.REPAIR_REQUIRED),
  true,
);
assert.equal(
  canTransition(ManufacturingState.CERTIFIED, ManufacturingState.REPAIR_REQUIRED),
  false,
);

console.log("ManufacturingState tests passed");
