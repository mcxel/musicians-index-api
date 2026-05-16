export type VisualPerformancePolicy = {
  compressionQuality: number;
  lazyLoad: boolean;
  preloadCritical: boolean;
  cacheTtlSeconds: number;
  priorityLoading: boolean;
};

const defaultPolicy: VisualPerformancePolicy = {
  compressionQuality: 82,
  lazyLoad: true,
  preloadCritical: true,
  cacheTtlSeconds: 3600,
  priorityLoading: true,
};

const slotPolicy = new Map<string, VisualPerformancePolicy>();

export function setPerformancePolicy(slotId: string, policy: Partial<VisualPerformancePolicy>): VisualPerformancePolicy {
  const next: VisualPerformancePolicy = {
    ...(slotPolicy.get(slotId) ?? defaultPolicy),
    ...policy,
  };
  slotPolicy.set(slotId, next);
  return next;
}

export function getPerformancePolicy(slotId: string): VisualPerformancePolicy {
  return slotPolicy.get(slotId) ?? defaultPolicy;
}

export function optimizeAssetRef(assetRef: string, slotId: string): string {
  const policy = getPerformancePolicy(slotId);
  const params = new URLSearchParams();
  params.set("q", String(policy.compressionQuality));
  params.set("lazy", String(policy.lazyLoad));
  params.set("preload", String(policy.preloadCritical));
  params.set("cacheTtl", String(policy.cacheTtlSeconds));
  params.set("priority", String(policy.priorityLoading));
  return `${assetRef}${assetRef.includes("?") ? "&" : "?"}${params.toString()}`;
}
