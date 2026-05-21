import { StimulationEngine } from "@tmi/module-runtime";
import { MODULE_CONFIG, LAW_LOGIC_BEHAVIORS } from "@/config/module.config";

/**
 * Law module stimulation singleton.
 * Continuously exercises module behavior to keep it behaviorally monitored.
 */
export const lawStimulation = new StimulationEngine(
  MODULE_CONFIG.id,
  {
    mode: MODULE_CONFIG.stimulation.defaultMode,
    intensity: MODULE_CONFIG.stimulation.defaultIntensity,
    traffic: true,
    logic: true,
    failures: false,
    bots: true,
    security: false,
  },
  LAW_LOGIC_BEHAVIORS
);

export { lawStimulation as stimulation };
