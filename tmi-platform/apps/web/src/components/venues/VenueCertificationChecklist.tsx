"use client";

/**
 * Certification checklist — DRAFT → PREVIEW → CERTIFIED → PRODUCTION.
 * Gates must pass before production registry promotion.
 */

import { useMemo, useState } from "react";
import {
  VENUE_CERT_GATES,
  certGateProgress,
  getCertRecord,
  setCertGate,
  setCertStatus,
  type VenueCertGateId,
  type VenueCertStatus,
} from "@/lib/venues/VenuePreviewCertification";
import { setVenueSkinCertificationStatus } from "@/lib/venue/venueSkinEngine";

const GOLD = "#FFD700";
const GREEN = "#00FF88";
const CYAN = "#00FFFF";

const STATUS_FLOW: VenueCertStatus[] = ["DRAFT", "PREVIEW", "CERTIFIED", "PRODUCTION"];

export interface VenueCertificationChecklistProps {
  skinId: string;
  onStatusChange?: (status: VenueCertStatus) => void;
}

export default function VenueCertificationChecklist({
  skinId,
  onStatusChange,
}: VenueCertificationChecklistProps) {
  const [tick, setTick] = useState(0);
  const record = useMemo(() => getCertRecord(skinId), [skinId, tick]);
  const progress = useMemo(() => certGateProgress(skinId), [skinId, tick]);

  const toggleGate = (gateId: VenueCertGateId) => {
    const next = !(record.checkedGates[gateId] === true);
    setCertGate(skinId, gateId, next);
    setTick((t) => t + 1);
  };

  const promote = (status: VenueCertStatus) => {
    const updated = setCertStatus(skinId, status);
    if (updated.status === status) {
      setVenueSkinCertificationStatus(skinId, status);
      onStatusChange?.(status);
    }
    setTick((t) => t + 1);
  };

  return (
    <div
      data-venue-cert-checklist="true"
      style={{
        padding: "12px 14px",
        background: "rgba(5,5,16,0.94)",
        border: `1px solid ${CYAN}44`,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: CYAN }}>
          CERTIFICATION GATE
        </span>
        <span style={{ fontSize: 10, fontWeight: 800, color: GOLD }}>
          {record.status} · {progress.checked}/{progress.total}
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {STATUS_FLOW.map((s) => {
          const active = record.status === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => promote(s)}
              disabled={
                (s === "CERTIFIED" || s === "PRODUCTION") && !progress.canCertify
              }
              style={{
                padding: "4px 8px",
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.08em",
                cursor: progress.canCertify || s === "DRAFT" || s === "PREVIEW" ? "pointer" : "not-allowed",
                opacity: (s === "CERTIFIED" || s === "PRODUCTION") && !progress.canCertify ? 0.4 : 1,
                borderRadius: 6,
                border: active ? `1px solid ${GREEN}` : "1px solid rgba(255,255,255,0.15)",
                background: active ? "rgba(0,255,136,0.15)" : "rgba(255,255,255,0.04)",
                color: active ? GREEN : "rgba(255,255,255,0.7)",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
        Geometry: {record.geometryStatus}
        {record.geometryStatus !== "PRESENT"
          ? " — no production GLB/navmesh yet (honest gap; canvas/skin runtime still certifiable)"
          : ""}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {VENUE_CERT_GATES.map((g) => {
          const checked = record.checkedGates[g.id] === true;
          return (
            <label
              key={g.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                color: checked ? GREEN : "rgba(255,255,255,0.75)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleGate(g.id)}
              />
              {g.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
