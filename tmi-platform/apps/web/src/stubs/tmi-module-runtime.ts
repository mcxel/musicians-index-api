export interface ModuleConfig {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  routes?: string[];
  permissions?: string[];
}

export interface ModuleEnvironment {
  database: { url: string };
  redis?: { url: string };
  storage?: { bucket: string; region: string };
  services?: Record<string, string>;
}

export interface ModuleEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  source: string;
}
