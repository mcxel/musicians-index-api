/**
 * LiveTransportRouter.ts — Abstract transports; no hardcoded localhost ports
 */

import type {
  TransportKind,
  TransportEndpointPolicy,
  TransportRouteDecision,
} from "./contracts/CapabilityContracts";

function envOrNull(key: string | undefined): string | null {
  if (!key) return null;
  if (typeof process === "undefined" || !process.env) return null;
  const v = process.env[key];
  return v && v.length > 0 ? v : null;
}

/** Stub policies — resolve from env keys only; never embed :3002 / localhost literals as defaults. */
const DEFAULT_POLICIES: TransportEndpointPolicy[] = [
  {
    transportKind: "WEBRTC",
    requiresAuth: true,
    maxBitrateKbps: 6000,
    iceServersEnvKey: "TMI_LIVE_ICE_SERVERS_JSON",
    resolveUrl: (sessionId, roomId) => {
      const base = envOrNull("TMI_LIVE_WEBRTC_SIGNALING_URL");
      if (!base) return null;
      return `${base.replace(/\/$/, "")}/sessions/${encodeURIComponent(sessionId)}/rooms/${encodeURIComponent(roomId)}`;
    },
  },
  {
    transportKind: "HLS",
    requiresAuth: false,
    maxBitrateKbps: 8000,
    resolveUrl: (sessionId) => {
      const base = envOrNull("TMI_LIVE_HLS_BASE_URL");
      if (!base) return null;
      return `${base.replace(/\/$/, "")}/${encodeURIComponent(sessionId)}.m3u8`;
    },
  },
  {
    transportKind: "RTMP",
    requiresAuth: true,
    maxBitrateKbps: 8000,
    ingestEnvKey: "TMI_LIVE_RTMP_INGEST_URL",
    resolveUrl: (sessionId) => {
      const base = envOrNull("TMI_LIVE_RTMP_INGEST_URL");
      if (!base) return null;
      return `${base.replace(/\/$/, "")}/${encodeURIComponent(sessionId)}`;
    },
  },
  {
    transportKind: "LOCAL_LOOPBACK",
    requiresAuth: false,
    maxBitrateKbps: 2500,
    resolveUrl: () => envOrNull("TMI_LIVE_LOOPBACK_URL"),
  },
  {
    transportKind: "VENUE_RENDER",
    requiresAuth: false,
    maxBitrateKbps: 0,
    resolveUrl: () => "venue-renderer://local",
  },
  {
    transportKind: "DATA_CHANNEL",
    requiresAuth: true,
    maxBitrateKbps: 256,
    resolveUrl: (sessionId) => {
      const base = envOrNull("TMI_LIVE_DATA_CHANNEL_URL");
      if (!base) return null;
      return `${base.replace(/\/$/, "")}/${encodeURIComponent(sessionId)}`;
    },
  },
];

export class LiveTransportRouter {
  private readonly policies: Map<TransportKind, TransportEndpointPolicy>;

  constructor(extra: TransportEndpointPolicy[] = []) {
    this.policies = new Map();
    for (const p of [...DEFAULT_POLICIES, ...extra]) {
      this.policies.set(p.transportKind, p);
    }
  }

  public route(
    kind: TransportKind,
    sessionId: string,
    roomId: string
  ): TransportRouteDecision {
    const policy = this.policies.get(kind);
    if (!policy) {
      return {
        transportKind: kind,
        endpoint: null,
        reason: "UNKNOWN_TRANSPORT",
        allowed: false,
      };
    }
    const endpoint = policy.resolveUrl(sessionId, roomId);
    if (!endpoint) {
      return {
        transportKind: kind,
        endpoint: null,
        reason: "ENDPOINT_UNCONFIGURED",
        allowed: false,
      };
    }
    if (/localhost:\d+/i.test(endpoint) && !envOrNull("TMI_LIVE_ALLOW_LOCALHOST")) {
      return {
        transportKind: kind,
        endpoint: null,
        reason: "LOCALHOST_PORT_BLOCKED",
        allowed: false,
      };
    }
    return {
      transportKind: kind,
      endpoint,
      reason: "OK",
      allowed: true,
    };
  }

  public listConfigured(): TransportKind[] {
    return Array.from(this.policies.keys()).filter((k) => {
      const p = this.policies.get(k)!;
      return p.resolveUrl("probe", "probe") != null || k === "VENUE_RENDER";
    });
  }
}
