"use client";

import React, { useEffect, useMemo, useState } from "react";

type DiscoveryPopulationConfig = {
  enabled: boolean;
  realSessionThreshold: number;
  rotationIntervalSeconds: number;
  officialBotEnabled: boolean;
  maxBotCards: number;
  botCategoriesAllowed: string[];
  surfaceTargetCount: number;
};

const BOT_ROLE_OPTIONS = [
  "host-bot",
  "helper-bot",
  "discovery-bot",
  "route-watcher-bot",
  "hype-bot",
  "welcome-bot",
];

export default function DiscoveryPopulationControlCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<DiscoveryPopulationConfig | null>(null);

  const selectedBotRoleSet = useMemo(() => new Set(config?.botCategoriesAllowed ?? []), [config?.botCategoriesAllowed]);

  useEffect(() => {
    let stopped = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/discovery-population", { cache: "no-store" });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json() as { config?: DiscoveryPopulationConfig };
        if (!stopped && data.config) setConfig(data.config);
      } catch (e) {
        if (!stopped) setError(e instanceof Error ? e.message : "Failed to load discovery config");
      } finally {
        if (!stopped) setLoading(false);
      }
    }
    void load();
    return () => { stopped = true; };
  }, []);

  async function savePatch(patch: Partial<DiscoveryPopulationConfig>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/discovery-population", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const data = await res.json() as { config?: DiscoveryPopulationConfig };
      if (data.config) setConfig(data.config);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save discovery config");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !config) {
    return (
      <div style={{ border: "1px solid rgba(0,255,255,0.2)", borderRadius: 10, padding: 12, background: "rgba(0,255,255,0.04)" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "#00FFFF", fontWeight: 900, marginBottom: 8 }}>
          DISCOVERY POPULATION
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Loading configuration…</div>
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid rgba(0,255,255,0.2)", borderRadius: 10, padding: 12, background: "rgba(0,255,255,0.04)" }}>
      <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "#00FFFF", fontWeight: 900, marginBottom: 8 }}>
        DISCOVERY POPULATION
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, fontSize: 11 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Threshold (real public sessions)</span>
          <input
            type="number"
            value={config.realSessionThreshold}
            min={0}
            max={10000}
            onChange={(e) => setConfig({ ...config, realSessionThreshold: Number(e.target.value) || 0 })}
            onBlur={() => void savePatch({ realSessionThreshold: config.realSessionThreshold })}
            style={{ background: "#040812", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 8px" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Rotation interval (seconds)</span>
          <input
            type="number"
            value={config.rotationIntervalSeconds}
            min={5}
            max={120}
            onChange={(e) => setConfig({ ...config, rotationIntervalSeconds: Number(e.target.value) || 20 })}
            onBlur={() => void savePatch({ rotationIntervalSeconds: config.rotationIntervalSeconds })}
            style={{ background: "#040812", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 8px" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Maximum bot cards</span>
          <input
            type="number"
            value={config.maxBotCards}
            min={0}
            max={50}
            onChange={(e) => setConfig({ ...config, maxBotCards: Number(e.target.value) || 0 })}
            onBlur={() => void savePatch({ maxBotCards: config.maxBotCards })}
            style={{ background: "#040812", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 8px" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Surface target cards</span>
          <input
            type="number"
            value={config.surfaceTargetCount}
            min={1}
            max={100}
            onChange={(e) => setConfig({ ...config, surfaceTargetCount: Number(e.target.value) || 12 })}
            onBlur={() => void savePatch({ surfaceTargetCount: config.surfaceTargetCount })}
            style={{ background: "#040812", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 8px" }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap", fontSize: 11 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => {
              const next = e.target.checked;
              setConfig({ ...config, enabled: next });
              void savePatch({ enabled: next });
            }}
          />
          Discovery Population Enabled
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={config.officialBotEnabled}
            onChange={(e) => {
              const next = e.target.checked;
              setConfig({ ...config, officialBotEnabled: next });
              void savePatch({ officialBotEnabled: next });
            }}
          />
          Official Bot Population Enabled
        </label>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>Allowed bot categories</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {BOT_ROLE_OPTIONS.map((role) => (
            <label key={role} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, padding: "4px 8px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999 }}>
              <input
                type="checkbox"
                checked={selectedBotRoleSet.has(role)}
                onChange={(e) => {
                  const next = new Set(config.botCategoriesAllowed);
                  if (e.target.checked) next.add(role);
                  else next.delete(role);
                  const nextList = Array.from(next);
                  setConfig({ ...config, botCategoriesAllowed: nextList });
                  void savePatch({ botCategoriesAllowed: nextList });
                }}
              />
              {role}
            </label>
          ))}
        </div>
      </div>

      {error && <div style={{ marginTop: 10, fontSize: 11, color: "#FF2DAA" }}>{error}</div>}
      {!error && <div style={{ marginTop: 10, fontSize: 10, color: saving ? "#FFD700" : "rgba(255,255,255,0.55)" }}>{saving ? "Saving…" : "Changes are applied immediately to discovery feeds."}</div>}
    </div>
  );
}
