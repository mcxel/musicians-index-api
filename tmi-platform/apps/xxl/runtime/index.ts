import { BootController } from "@tmi/module-runtime";
import { MODULE_CONFIG, XXL_LOGIC_BEHAVIORS } from "@/config/module.config";

export const xxlRuntime = BootController.create(MODULE_CONFIG, {
  logicBehaviors: XXL_LOGIC_BEHAVIORS,
});

export const { runtime, stimulation, health, recovery, events } = xxlRuntime;
