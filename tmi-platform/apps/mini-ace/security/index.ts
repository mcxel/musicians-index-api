import { MODULE_CONFIG } from '@/config/module.config';
export function checkOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return MODULE_CONFIG.isolation.allowedOrigins.some((o) => origin.startsWith(o));
}
