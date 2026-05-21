import { BootController } from "@tmi/module-runtime";
import { MODULE_CONFIG, LAW_LOGIC_BEHAVIORS } from "@/config/module.config";

/**
 * Law module runtime singleton.
 * Import `lawRuntime` anywhere in the app to access controllers.
 */
export const lawRuntime = BootController.create(MODULE_CONFIG, {
  logicBehaviors: LAW_LOGIC_BEHAVIORS,
});

export const { runtime, stimulation, health, recovery, events } = lawRuntime;
