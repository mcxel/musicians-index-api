/**
 * MediaBudget.ts + DeviceCapabilityDirector.ts — Device tiers + backpressure
 */

import type {
  MediaBudgetLimits,
  MediaBudgetUsage,
  BackpressureDecision,
  BackpressureAction,
  BudgetResource,
} from "./contracts/BudgetContracts";

export const DEFAULT_MEDIA_BUDGET: MediaBudgetLimits = {
  maxCpuPct: 85,
  maxGpuPct: 90,
  maxMemoryMb: 1024,
  maxBandwidthUpKbps: 6000,
  maxBandwidthDownKbps: 12000,
  maxDecodeSlots: 8,
  maxEncodeSlots: 2,
  maxConcurrentSources: 12,
  maxVoltronParticipants: 6,
};

export class MediaBudget {
  constructor(private limits: MediaBudgetLimits = { ...DEFAULT_MEDIA_BUDGET }) {}

  public getLimits(): MediaBudgetLimits {
    return { ...this.limits };
  }

  public scaleForDevice(tier: "LOW" | "MEDIUM" | "HIGH"): void {
    if (tier === "LOW") {
      this.limits = {
        ...this.limits,
        maxConcurrentSources: 4,
        maxDecodeSlots: 3,
        maxEncodeSlots: 1,
        maxVoltronParticipants: 0,
        maxBandwidthUpKbps: 1500,
        maxMemoryMb: 512,
      };
    } else if (tier === "MEDIUM") {
      this.limits = {
        ...this.limits,
        maxConcurrentSources: 8,
        maxDecodeSlots: 5,
        maxVoltronParticipants: 4,
        maxBandwidthUpKbps: 3500,
      };
    }
  }

  public evaluate(usage: MediaBudgetUsage): BackpressureDecision {
    const checks: Array<{ resource: BudgetResource; over: boolean; action: BackpressureAction }> = [
      {
        resource: "MEMORY",
        over: usage.memoryMb > this.limits.maxMemoryMb,
        action: "PARK_NON_PRIMARY",
      },
      {
        resource: "CPU",
        over: usage.cpuPct > this.limits.maxCpuPct,
        action: "REDUCE_QUALITY",
      },
      {
        resource: "GPU",
        over: usage.gpuPct > this.limits.maxGpuPct,
        action: "DISABLE_VOLTRON",
      },
      {
        resource: "BANDWIDTH_UP",
        over: usage.bandwidthUpKbps > this.limits.maxBandwidthUpKbps,
        action: "REDUCE_QUALITY",
      },
      {
        resource: "DECODE_SLOTS",
        over: usage.decodeSlots > this.limits.maxDecodeSlots,
        action: "DROP_SECONDARY",
      },
      {
        resource: "ENCODE_SLOTS",
        over: usage.encodeSlots > this.limits.maxEncodeSlots,
        action: "REJECT_NEW_SOURCE",
      },
    ];

    if (usage.concurrentSources > this.limits.maxConcurrentSources) {
      return {
        action: "REJECT_NEW_SOURCE",
        resource: "DECODE_SLOTS",
        reason: "MAX_CONCURRENT_SOURCES",
        usage: { ...usage },
        limits: this.getLimits(),
      };
    }

    for (const c of checks) {
      if (c.over) {
        return {
          action: c.action,
          resource: c.resource,
          reason: `${c.resource}_EXCEEDED`,
          usage: { ...usage },
          limits: this.getLimits(),
        };
      }
    }

    return {
      action: "NONE",
      resource: null,
      reason: "WITHIN_BUDGET",
      usage: { ...usage },
      limits: this.getLimits(),
    };
  }

  public allowsVoltron(participantCount: number, usage: MediaBudgetUsage): boolean {
    if (this.limits.maxVoltronParticipants <= 0) return false;
    if (participantCount > this.limits.maxVoltronParticipants) return false;
    const d = this.evaluate(usage);
    return d.action === "NONE" || d.action === "REDUCE_QUALITY";
  }
}

export interface DeviceCapabilityProfile {
  gpuTier: "LOW" | "MEDIUM" | "HIGH";
  cpuTier: "LOW" | "MEDIUM" | "HIGH";
  maxCameras: number;
  maxMicrophones: number;
  supportsScreenShare: boolean;
  supportsWebRTC: boolean;
  supportsCast: boolean;
  reducedMotionPreferred: boolean;
}

export class DeviceCapabilityDirector {
  private profile: DeviceCapabilityProfile;
  private readonly budget: MediaBudget;

  constructor(initial?: Partial<DeviceCapabilityProfile>) {
    this.profile = {
      gpuTier: "MEDIUM",
      cpuTier: "MEDIUM",
      maxCameras: 2,
      maxMicrophones: 1,
      supportsScreenShare: true,
      supportsWebRTC: true,
      supportsCast: true,
      reducedMotionPreferred: false,
      ...initial,
    };
    this.budget = new MediaBudget();
    this.budget.scaleForDevice(this.profile.gpuTier);
  }

  public getProfile(): DeviceCapabilityProfile {
    return { ...this.profile };
  }

  public getBudget(): MediaBudget {
    return this.budget;
  }

  public updateProfile(patch: Partial<DeviceCapabilityProfile>): void {
    this.profile = { ...this.profile, ...patch };
    this.budget.scaleForDevice(this.profile.gpuTier);
  }

  public probeFromUserAgent(ua: string, memoryGbHint?: number): DeviceCapabilityProfile {
    const mobile = /Android|iPhone|iPad/i.test(ua);
    if (mobile || (memoryGbHint != null && memoryGbHint <= 4)) {
      this.updateProfile({
        gpuTier: "LOW",
        cpuTier: "LOW",
        maxCameras: 1,
        supportsScreenShare: false,
        supportsCast: true,
      });
    } else if (memoryGbHint != null && memoryGbHint >= 16) {
      this.updateProfile({ gpuTier: "HIGH", cpuTier: "HIGH", maxCameras: 3 });
    }
    return this.getProfile();
  }
}
