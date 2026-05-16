"use client";

import { useMemo, useState } from "react";
import { getTrustedDevices, revokeTrustedDevice, trustDevice } from "@/lib/auth/DeviceTrustEngine";

type Props = {
  email: string;
};

export default function DeviceTrustPanel({ email }: Props) {
  const [deviceId, setDeviceId] = useState("");
  const [label, setLabel] = useState("");

  const devices = useMemo(() => getTrustedDevices(email), [email, deviceId, label]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <input
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          placeholder="device-id"
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.45)",
            color: "#fff",
            padding: "10px 12px",
          }}
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Device label (optional)"
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.45)",
            color: "#fff",
            padding: "10px 12px",
          }}
        />
        <button
          onClick={() => {
            if (!deviceId.trim()) return;
            trustDevice({ email, deviceId: deviceId.trim(), label: label.trim() || undefined, ip: "ui-client", userAgent: "browser" });
            setDeviceId("");
            setLabel("");
          }}
          style={{
            borderRadius: 10,
            border: "1px solid rgba(0,255,255,0.45)",
            background: "rgba(0,255,255,0.12)",
            color: "#bafcff",
            padding: "10px 12px",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Trust this device
        </button>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {devices.length === 0 ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>No trusted devices yet.</div>
        ) : (
          devices.map((d) => (
            <div
              key={d.deviceId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                background: "rgba(255,255,255,0.03)",
                padding: "10px 12px",
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{d.label || d.deviceId}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Last seen: {new Date(d.lastSeenAt).toLocaleString()}</div>
              </div>
              <button
                onClick={() => revokeTrustedDevice(email, d.deviceId)}
                style={{
                  borderRadius: 8,
                  border: "1px solid rgba(239,68,68,0.45)",
                  background: "rgba(239,68,68,0.12)",
                  color: "#fecaca",
                  padding: "7px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Revoke
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
