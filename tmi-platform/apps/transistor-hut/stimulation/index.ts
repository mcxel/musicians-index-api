import { StimulationEngine } from '@tmi/module-runtime';
import { MODULE_CONFIG, TRANSISTOR_HUT_LOGIC_BEHAVIORS } from '@/config/module.config';

export const transistorHutStimulation = new StimulationEngine(
  MODULE_CONFIG.id,
  {
    mode: MODULE_CONFIG.stimulation.defaultMode,
    intensity: MODULE_CONFIG.stimulation.defaultIntensity,
    traffic: true,
    logic: true,
    failures: false,
    bots: true,
    security: true,
  },
  TRANSISTOR_HUT_LOGIC_BEHAVIORS
);

export { transistorHutStimulation as stimulation };
