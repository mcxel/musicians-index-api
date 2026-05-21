import { StimulationEngine } from "@tmi/module-runtime";
import { MODULE_CONFIG, XXL_LOGIC_BEHAVIORS } from "@/config/module.config";

export const xxlStimulation = new StimulationEngine(
  MODULE_CONFIG.id,
  {
    mode: MODULE_CONFIG.stimulation.defaultMode,
    intensity: MODULE_CONFIG.stimulation.defaultIntensity,
    traffic: true,
    logic: true,
    failures: true,   // XXL stresses runtime events
    bots: true,
    security: false,
  },
  XXL_LOGIC_BEHAVIORS
);

export { xxlStimulation as stimulation };
