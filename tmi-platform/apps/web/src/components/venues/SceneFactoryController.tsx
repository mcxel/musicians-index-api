"use client";

/**
 * SceneFactoryController — admin unlock panel for existing VenueSceneFactory.
 * Does not invent SceneFactoryV2 or GLB geometry.
 */

import { useCallback, useEffect, useState } from "react";

type TemplateRow = {
  templateId: string;
  label: string;
  instantiable: boolean;
  blockers: string[];
};

type Snapshot = {
  controller?: { unlocked?: boolean; note?: string };
  liveInstanceCount?: number;
  cachedInstanceCount?: number;
};

export default function SceneFactoryController() {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/venues/templates", { cache: "no-store" });
      if (!res.ok) {
        setStatus(`Load failed (${res.status})`);
        return;
      }
      const data = (await res.json()) as {
        templates?: TemplateRow[];
        sceneFactory?: Snapshot;
      };
      setTemplates(data.templates ?? []);
      setSnapshot(data.sceneFactory ?? null);
      setStatus("");
    } catch {
      setStatus("Could not load venue templates.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const instantiate = async (templateId: string) => {
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/venues/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "instantiate", templateId }),
      });
      const data = (await res.json()) as { ok?: boolean; reason?: string; instance?: { id: string } };
      if (!res.ok || !data.ok) {
        setStatus(data.reason ?? `Instantiate denied (${res.status})`);
      } else {
        setStatus(`Instance ${data.instance?.id ?? "created"} via VenueSceneFactory`);
        await load();
      }
    } catch {
      setStatus("Instantiate request failed.");
    } finally {
      setBusy(false);
    }
  };

  const unlocked = snapshot?.controller?.unlocked === true;
  const instantiable = templates.filter((t) => t.instantiable);
  const locked = templates.filter((t) => !t.instantiable);

  return (
    <section
      style={{
        background: "rgba(0,0,0,0.4)",
        border: `1px solid ${unlocked ? "rgba(0,255,136,0.35)" : "rgba(255,68,68,0.35)"}`,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.22em",
          color: unlocked ? "#00FF88" : "#FF4444",
          fontWeight: 900,
          marginBottom: 8,
        }}
      >
        SCENE FACTORY CONTROLLER · {unlocked ? "UNLOCKED" : "LOCKED"}
      </div>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
        {snapshot?.controller?.note ??
          "Existing VenueSceneFactory only — no parallel generator, no GLB mill."}
      </p>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
        Live instances: {snapshot?.liveInstanceCount ?? 0} · Cached: {snapshot?.cachedInstanceCount ?? 0} ·
        Instantiable templates: {instantiable.length} · Honest-blocked: {locked.length}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {instantiable.slice(0, 8).map((t) => (
          <div
            key={t.templateId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid rgba(0,255,255,0.2)",
              background: "rgba(0,255,255,0.04)",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{t.label}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{t.templateId}</div>
            </div>
            <button
              type="button"
              disabled={busy || !unlocked}
              onClick={() => void instantiate(t.templateId)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid rgba(0,255,136,0.45)",
                background: "rgba(0,255,136,0.12)",
                color: "#00FF88",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: busy ? "wait" : "pointer",
              }}
            >
              REQUEST SCENE
            </button>
          </div>
        ))}
        {instantiable.length === 0 ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            No instantiable templates yet — geometry/capacity blockers remain (honest empty).
          </div>
        ) : null}
      </div>

      {locked.length > 0 ? (
        <div style={{ marginTop: 12, fontSize: 10, color: "rgba(255,215,0,0.7)" }}>
          {locked.length} template(s) stay non-instantiable (geometry MISSING / capacity blockers) —
          controller will refuse them.
        </div>
      ) : null}

      {status ? (
        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            color: status.includes("denied") || status.includes("failed") || status.includes("not")
              ? "#FF6B6B"
              : "#00FF88",
          }}
        >
          {status}
        </div>
      ) : null}
    </section>
  );
}
