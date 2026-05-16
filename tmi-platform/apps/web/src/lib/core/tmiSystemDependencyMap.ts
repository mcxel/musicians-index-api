export type TmiSystemDependency = {
  systemId: string;
  dependsOn: string[];
  provides: string[];
};

const DEPENDENCIES = new Map<string, TmiSystemDependency>();

export function registerSystemDependency(entry: TmiSystemDependency): void {
  DEPENDENCIES.set(entry.systemId, entry);
}

export function listSystemDependencies(): TmiSystemDependency[] {
  return [...DEPENDENCIES.values()];
}

export function getSystemDependency(systemId: string): TmiSystemDependency | undefined {
  return DEPENDENCIES.get(systemId);
}
