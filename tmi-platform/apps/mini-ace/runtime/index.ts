import { BootController } from '@tmi/module-runtime';
import { MODULE_CONFIG, MINI_ACE_LOGIC_BEHAVIORS } from '@/config/module.config';
export const moduleRuntime = BootController.create(MODULE_CONFIG, { logicBehaviors: MINI_ACE_LOGIC_BEHAVIORS });
export const { runtime, stimulation, health, recovery, events } = moduleRuntime;
