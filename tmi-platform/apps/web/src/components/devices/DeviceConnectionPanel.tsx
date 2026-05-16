"use client";

import React, { useEffect, useState, useCallback } from "react";
import { deviceRegistry } from "@/lib/devices/DeviceCapabilityRegistry";
import { deviceSessionBridge } from "@/lib/devices/DeviceSessionBridge";
import { websiteAppHandshake } from "@/lib/devices/WebsiteAppHandshake";
import { offlineReconnectQueue } from "@/lib/devices/OfflineReconnectQueue";
import type { DeviceClass } from "@/lib/devices/DeviceCapabilityRegistry";
import type { DeviceSessionRecord } from "@/lib/devices/DeviceSessionBridge";
import type { HandshakeSession } from "@/lib/devices/WebsiteAppHandshake";
import type { ConnectionState } from "@/lib/devices/OfflineReconnectQueue";

interface Props {
  targetPath?: string;
  className?: string;
}

const DEVICE_ICONS: Record<DeviceClass, string> = {
  phone: "📱",
  tablet: "📟",
  desktop: "🖥️",
  "smart-tv": "📺",
  "venue-screen": "🎬",
  kiosk: "🏧",
  controller: "🎮",
  remote: "📡",
  webview: "🌐",
  "mobile-app": "📲",
  "desktop-app": "💻",
};

const CONNECTION_COLORS: Record<ConnectionState, string> = {
  online: "#22d3ee",
  offline: "#ef4444",
  reconnecting: "#f59e0b",
};

export function DeviceConnectionPanel({ targetPath = "/", className = "" }: Props) {
  const [currentDevice, setCurrentDevice] = useState<DeviceClass>("desktop");
  const [activeDevices, setActiveDevices] = useState<DeviceSessionRecord[]>([]);
  const [handshake, setHandshake] = useState<HandshakeSession | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("online");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [pairTarget, setPairTarget] = useState<DeviceClass>("phone");

  useEffect(() => {
    const detected = deviceRegistry.detectDeviceClass();
    setCurrentDevice(detected);

    setActiveDevices(deviceSessionBridge.getActiveDevices());
    const unsub = deviceSessionBridge.onDeviceChange(() => {
      setActiveDevices(deviceSessionBridge.getActiveDevices());
    });

    setConnectionState(offlineReconnectQueue.getConnectionState());
    const unsubConn = offlineReconnectQueue.onConnectionStateChange(setConnectionState);

    return () => {
      unsub();
      unsubConn();
    };
  }, []);

  const startPairing = useCallback(() => {
    const session = websiteAppHandshake.startHandshake(pairTarget, targetPath);
    setHandshake(session);
    if (session.pairingToken) {
      const url = websiteAppHandshake.encodeQRPayload(
        session.pairingToken,
        typeof window !== "undefined" ? window.location.origin : "https://tmi.themusiciansindex.com",
      );
      setQrUrl(url);
    }
    const unsub = websiteAppHandshake.onHandshakeChange(session.id, (updated) => {
      setHandshake({ ...updated });
      if (updated.state === "paired" || updated.state === "expired" || updated.state === "failed") {
        unsub();
        if (updated.state !== "paired") setQrUrl(null);
      }
    });
  }, [pairTarget, targetPath]);

  const cancelPairing = useCallback(() => {
    setHandshake(null);
    setQrUrl(null);
  }, []);

  const profile = deviceRegistry.getProfile(currentDevice);

  return (
    <div
      className={`rounded-xl border border-white/10 bg-[#0a0a1a] p-5 text-white ${className}`}
      style={{ fontFamily: "monospace" }}
    >
      {/* Current device */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">{DEVICE_ICONS[currentDevice]}</span>
        <div>
          <div className="text-sm font-bold text-cyan-400">{profile.label}</div>
          <div className="text-xs text-white/40">This device</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: CONNECTION_COLORS[connectionState] }}
          />
          <span className="text-xs capitalize text-white/50">{connectionState}</span>
        </div>
      </div>

      {/* Capabilities */}
      <div className="mb-4 flex flex-wrap gap-1">
        {profile.surfaceCapabilities.map((cap) => (
          <span
            key={cap}
            className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50"
          >
            {cap}
          </span>
        ))}
      </div>

      {/* Connected devices */}
      {activeDevices.length > 0 && (
        <div className="mb-4">
          <div className="mb-1 text-xs font-semibold text-white/40 uppercase tracking-wider">
            Connected Surfaces
          </div>
          <div className="space-y-1">
            {activeDevices.map((rec) => (
              <div
                key={rec.deviceId}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2"
              >
                <span>{DEVICE_ICONS[rec.deviceClass]}</span>
                <span className="text-xs text-white/70">{rec.deviceClass}</span>
                <span className="ml-auto text-[10px] text-white/30">
                  {rec.deviceId.slice(0, 8)}…
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pairing UI */}
      {!handshake || handshake.state === "expired" || handshake.state === "failed" ? (
        <div className="mt-2">
          <div className="mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
            Pair a Device
          </div>
          <div className="flex gap-2">
            <select
              value={pairTarget}
              onChange={(e) => setPairTarget(e.target.value as DeviceClass)}
              className="flex-1 rounded-lg bg-white/10 px-2 py-1.5 text-xs text-white outline-none"
            >
              {(["phone", "tablet", "smart-tv", "mobile-app", "desktop-app"] as DeviceClass[]).map(
                (dc) => (
                  <option key={dc} value={dc} className="bg-[#0a0a1a]">
                    {DEVICE_ICONS[dc]} {dc}
                  </option>
                ),
              )}
            </select>
            <button
              onClick={startPairing}
              className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-cyan-400"
            >
              Generate QR
            </button>
          </div>
        </div>
      ) : handshake.state === "paired" ? (
        <div className="mt-2 rounded-lg bg-green-500/10 p-3 text-center text-xs text-green-400">
          Paired successfully
        </div>
      ) : (
        <div className="mt-2">
          <div className="mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
            Scan with {DEVICE_ICONS[pairTarget]} {pairTarget}
          </div>
          {qrUrl && (
            <div className="mb-2 break-all rounded-lg bg-white/5 p-2 text-[10px] text-white/30">
              {qrUrl}
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-white/40">
            <span>Expires in 5 minutes</span>
            <button onClick={cancelPairing} className="text-red-400 hover:text-red-300">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeviceConnectionPanel;
