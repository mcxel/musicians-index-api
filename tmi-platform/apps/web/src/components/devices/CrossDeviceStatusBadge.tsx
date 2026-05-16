"use client";

import React, { useEffect, useState } from "react";
import { offlineReconnectQueue } from "@/lib/devices/OfflineReconnectQueue";
import { deviceSessionBridge } from "@/lib/devices/DeviceSessionBridge";
import type { ConnectionState } from "@/lib/devices/OfflineReconnectQueue";

interface Props {
  showQueueSize?: boolean;
  showDeviceCount?: boolean;
  className?: string;
  /** compact = icon only, full = icon + label */
  variant?: "compact" | "full";
}

const STATE_CONFIG: Record<
  ConnectionState,
  { color: string; bg: string; label: string; pulse: boolean }
> = {
  online: {
    color: "#22d3ee",
    bg: "#22d3ee22",
    label: "Online",
    pulse: false,
  },
  reconnecting: {
    color: "#f59e0b",
    bg: "#f59e0b22",
    label: "Reconnecting…",
    pulse: true,
  },
  offline: {
    color: "#ef4444",
    bg: "#ef444422",
    label: "Offline",
    pulse: false,
  },
};

export function CrossDeviceStatusBadge({
  showQueueSize = true,
  showDeviceCount = true,
  className = "",
  variant = "full",
}: Props) {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    offlineReconnectQueue.getConnectionState(),
  );
  const [queueSize, setQueueSize] = useState(offlineReconnectQueue.getQueueSize());
  const [deviceCount, setDeviceCount] = useState(
    deviceSessionBridge.getActiveDevices().length,
  );

  useEffect(() => {
    const unsubConn = offlineReconnectQueue.onConnectionStateChange((state) => {
      setConnectionState(state);
      setQueueSize(offlineReconnectQueue.getQueueSize());
    });

    const unsubDevice = deviceSessionBridge.onDeviceChange(() => {
      setDeviceCount(deviceSessionBridge.getActiveDevices().length);
    });

    // Poll queue size (it changes as items are enqueued/replayed)
    const interval = setInterval(() => {
      setQueueSize(offlineReconnectQueue.getQueueSize());
    }, 2000);

    // Wire browser network events
    const detachNetwork = offlineReconnectQueue.attachBrowserNetworkListeners();

    return () => {
      unsubConn();
      unsubDevice();
      clearInterval(interval);
      detachNetwork();
    };
  }, []);

  const cfg = STATE_CONFIG[connectionState];

  if (variant === "compact") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${className}`}
        style={{ backgroundColor: cfg.bg, color: cfg.color }}
        title={`${cfg.label}${queueSize > 0 ? ` · ${queueSize} queued` : ""}`}
      >
        <span
          className={cfg.pulse ? "animate-pulse" : ""}
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: cfg.color,
          }}
        />
        {showQueueSize && queueSize > 0 && (
          <span>{queueSize}</span>
        )}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${className}`}
      style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}
    >
      {/* Status dot */}
      <span
        className={cfg.pulse ? "animate-pulse" : ""}
        style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: cfg.color,
          flexShrink: 0,
        }}
      />

      {/* Label */}
      <span>{cfg.label}</span>

      {/* Queue size */}
      {showQueueSize && queueSize > 0 && (
        <>
          <span style={{ color: cfg.color, opacity: 0.4 }}>·</span>
          <span style={{ color: "#f59e0b" }}>{queueSize} queued</span>
        </>
      )}

      {/* Device count */}
      {showDeviceCount && deviceCount > 0 && (
        <>
          <span style={{ color: cfg.color, opacity: 0.4 }}>·</span>
          <span style={{ color: cfg.color, opacity: 0.8 }}>
            {deviceCount} surface{deviceCount !== 1 ? "s" : ""}
          </span>
        </>
      )}
    </div>
  );
}

export default CrossDeviceStatusBadge;
