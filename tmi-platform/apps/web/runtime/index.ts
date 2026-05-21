import { BootController } from "@tmi/module-runtime";
import { MODULE_CONFIG, TMI_LOGIC_BEHAVIORS } from "../config/module.config";

/**
 * TMI module runtime singleton.
 * Wires together all runtime controllers for The Musicians Index.
 */
export const tmiRuntime = BootController.create(MODULE_CONFIG, {
  logicBehaviors: TMI_LOGIC_BEHAVIORS,
});

export const { runtime, stimulation, health, recovery, events } = tmiRuntime;
