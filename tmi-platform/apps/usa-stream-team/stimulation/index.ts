import { StimulationEngine } from '@tmi/module-runtime';
import { MODULE_CONFIG, STREAM_LOGIC_BEHAVIORS } from '@/config/module.config';
export const moduleStimulation = new StimulationEngine(
  MODULE_CONFIG.id,
  { mode: MODULE_CONFIG.stimulation.defaultMode, intensity: MODULE_CONFIG.stimulation.defaultIntensity, traffic: true, logic: true, failures: false, bots: true, security: false },
  STREAM_LOGIC_BEHAVIORS
);
export { moduleStimulation as stimulation };
