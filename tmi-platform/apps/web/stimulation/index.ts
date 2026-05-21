import { StimulationEngine } from "@tmi/module-runtime";
import { MODULE_CONFIG, TMI_LOGIC_BEHAVIORS } from "../config/module.config";

/**
 * TMI stimulation engine.
 *
 * Continuously exercises TMI-native systems:
 *   - Homepage rotation, article delivery, magazine transitions
 *   - Ranking movement, crown assignments
 *   - Booking flows, ticket sales
 *   - NFT drops, billboard rotations
 *   - Fan social actions, cypher battles
 *   - Venue capacity and show events
 *
 * All stimulation is isolated — no impact on live user data.
 * Controlled via StimulationPanel or environment variables.
 */
export const tmiStimulation = new StimulationEngine(
  MODULE_CONFIG.id,
  {
    mode: MODULE_CONFIG.stimulation.defaultMode,
    intensity: MODULE_CONFIG.stimulation.defaultIntensity,
    traffic: true,    // simulate fans, artists, sponsors browsing
    logic: true,      // exercise all TMI-native engine flows
    failures: false,  // off by default — enable in STRESS/CHAOS mode
    bots: true,       // exercise watcher/repair/sentinel bots
    security: false,  // off by default — enable manually for security tests
  },
  TMI_LOGIC_BEHAVIORS
);

export { tmiStimulation as stimulation };
