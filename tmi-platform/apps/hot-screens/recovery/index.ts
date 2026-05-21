import { RecoveryController } from '@tmi/module-runtime';
export const moduleRecovery = new RecoveryController('hot-screens', 15);
export { moduleRecovery as recovery };
