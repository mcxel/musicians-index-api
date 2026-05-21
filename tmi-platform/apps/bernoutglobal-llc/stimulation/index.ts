import { StimulationEngine } from "@tmi/module-runtime";
import { MODULE_CONFIG, LLC_LOGIC_BEHAVIORS } from "@/config/module.config";

/**
 * LLC stimulation: simulates revenue aggregation, payout scheduling, contract events.
 * Intensity kept low — financial system should not be stress-tested in prod.
 */
export const llcStimulation = new StimulationEngine(
  MODULE_CONFIG.id,
  {
    mode: MODULE_CONFIG.stimulation.defaultMode,
    intensity: MODULE_CONFIG.stimulation.defaultIntensity,
    traffic: false,    // no fake traffic on financial system
    logic: true,
    failures: false,   // never inject financial failures in non-chaos mode
    bots: true,
    security: true,   // always probe auth boundaries on financial system
  },
  LLC_LOGIC_BEHAVIORS
);

export { llcStimulation as stimulation };
