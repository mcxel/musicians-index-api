import { StimulationEngine } from "@tmi/module-runtime";
import { MODULE_CONFIG, SITE_LOGIC_BEHAVIORS } from "@/config/module.config";

/** Simulates: visitors browsing product catalog, press kit downloads, inquiry submissions */
export const siteStimulation = new StimulationEngine(
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
  SITE_LOGIC_BEHAVIORS
);

export { siteStimulation as stimulation };
