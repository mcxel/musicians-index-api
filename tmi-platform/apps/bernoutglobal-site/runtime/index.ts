import { BootController } from "@tmi/module-runtime";
import { MODULE_CONFIG, SITE_LOGIC_BEHAVIORS } from "@/config/module.config";

export const siteRuntime = BootController.create(MODULE_CONFIG, {
  logicBehaviors: SITE_LOGIC_BEHAVIORS,
});

export const { runtime, stimulation, health, recovery, events } = siteRuntime;
