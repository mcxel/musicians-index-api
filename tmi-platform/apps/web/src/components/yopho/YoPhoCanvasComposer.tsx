"use client";

/**
 * Layer panel + add/transform for the existing YoPho composition document.
 * Reuses /api/upload/media, /api/media/locker, and WebRTCCapture — no V2 engines.
 */

import { useRef, useState, type CSSProperties } from "react";
import WebRTCCapture from "@/components/media/WebRTCCapture";
import { uploadCanonicalMediaFile } from "@/lib/media/clientMediaUpload";
import { getYoPhoImageCapacity } from "@/lib/yopho/YoPhoImageCapacity";
import {
  addCanvasLayer,
  createCanvasLayer,
  duplicateCanvasLayer,
  listCanvasLayers,
  removeCanvasLayer,
  reorderCanvasLayer,
  setLayerFormatOverride,
  updateCanvasLayer,
  type YoPhoCanvasLayer,
  type YoPhoCanvasLayerKind,
  type YoPhoCardComposition,
} from "@/lib/yopho/YoPhoCardComposition";
import type { YoPhoFormat } from "@/lib/yopho/YoPhoFormatAuthority";

type IngestStatus = { tone: "ok" | "warn" | "err"; text: string } | null;

export default function YoPhoCanvasComposer({
  composition,
  format,
  selectedId,
  tierOrRole = "FREE",
  onChange,
  onSelect,
}: {
  composition: YoPhoCardComposition;
  format: YoPhoFormat;
  selectedId: string | null;
  tierOrRole?: string;
  onChange: (next: YoPhoCardComposition) => void;
  onSelect: (id: string | null) => void;
}) {
  const capacity = getYoPhoImageCapacity(tierOrRole);
  const layers = listCanvasLayers(composition);
  const used = layers.filter((layer) => layer.srcUrl || layer.mediaAssetId).length;
  const selected = layers.find((layer) => layer.id === selectedId) ?? null;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [pendingKind, setPendingKind] = useState<YoPhoCanvasLayerKind>("image");
  const [status, setStatus] = useState<IngestStatus>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showLocker, setShowLocker] = useState(false);
  const [lockerItems, setLockerItems] = useState<Array<{ id: string; url: string; title: string; type: string }>>([]);
  const [lockerNote, setLockerNote] = useState<string | null>(null);

  const applyAdd = (layer: YoPhoCanvasLayer) => {
    const next = addCanvasLayer(composition, layer, capacity.maxImages);
    if (!next) {
      setStatus({ tone: "warn", text: `Image slot limit ${used}/${capacity.maxImages}. Upgrade for more layers.` });
      return;
    }
    onChange(next);
    onSelect(layer.id);
  };

  const ingestFile = async (file: File, kind: YoPhoCanvasLayerKind) => {
    const isVideo = file.type.startsWith("video/");
    if (isVideo && !/video\/(mp4|webm|quicktime)/i.test(file.type)) {
      setStatus({ tone: "err", text: `This container (${file.type || "unknown"}) is not a supported MP4/WebM motion source.` });
      return;
    }
    setStatus({ tone: "warn", text: isVideo ? "Uploading motion through canonical media…" : "Adding image…" });
    if (isVideo) {
      const uploaded = await uploadCanonicalMediaFile(file, { title: file.name, persistVia: "/api/upload/media" });
      if (!uploaded.ok) {
        setStatus({
          tone: "err",
          text: uploaded.status === 401
            ? "Sign in to store motion on the canonical media library. Draft kept."
            : uploaded.error,
        });
        return;
      }
      applyAdd(
        createCanvasLayer("motion", {
          label: file.name.replace(/\.[^/.]+$/, ""),
          mediaType: "video",
          mediaAssetId: uploaded.id,
          srcUrl: uploaded.url,
        }),
      );
      setStatus({ tone: "ok", text: `Motion layer references media ${uploaded.id}` });
      return;
    }
    const dataUrl = await readAsDataUrl(file);
    applyAdd(
      createCanvasLayer(kind, {
        label: file.name.replace(/\.[^/.]+$/, ""),
        mediaType: "image",
        srcUrl: dataUrl,
      }),
    );
    setStatus({ tone: "ok", text: `${kind.replace("_", " ")} added` });
  };

  const openLocker = async () => {
    setShowLocker(true);
    setLockerNote("Loading creator media…");
    try {
      const res = await fetch("/api/media/locker?type=all", { credentials: "include", cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        items?: Array<{ id: string; url?: string; title?: string; mediaType?: string }>;
        videos?: Array<{ id: string; url?: string; title?: string }>;
        error?: string;
      };
      const items = [
        ...(data.items ?? []),
        ...(data.videos ?? []).map((video) => ({ ...video, mediaType: "video" })),
      ]
        .filter((item) => item.id && item.url)
        .map((item) => ({
          id: item.id,
          url: item.url!,
          title: item.title ?? item.id,
          type: item.mediaType ?? "video",
        }));
      setLockerItems(items);
      setLockerNote(res.ok ? (items.length ? null : "No creator media yet.") : data.error ?? "Creator media unavailable until signed in.");
    } catch {
      setLockerItems([]);
      setLockerNote("Creator media unavailable.");
    }
  };

  return (
    <div data-testid="yopho-canvas-composer" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 11, color: "#00FFFF", fontWeight: 800 }}>
        CANVAS LAYERS · {used}/{capacity.maxImages} image slots
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <button type="button" data-testid="yopho-add-image" style={btn} onClick={() => { setPendingKind("image"); imageInputRef.current?.click(); }}>
          Add image
        </button>
        <button type="button" data-testid="yopho-add-background" style={btn} onClick={() => { setPendingKind(layers.some((l) => l.kind === "base_background") ? "background" : "base_background"); imageInputRef.current?.click(); }}>
          Add background
        </button>
        <button type="button" data-testid="yopho-add-motion" style={btn} onClick={() => videoInputRef.current?.click()}>
          Add motion / MP4
        </button>
        <button type="button" data-testid="yopho-add-camera" style={btn} onClick={() => setShowCamera((v) => !v)}>
          {showCamera ? "Hide camera" : "Capture camera"}
        </button>
        <button type="button" data-testid="yopho-add-creator-media" style={btn} onClick={() => void openLocker()}>
          Creator media
        </button>
      </div>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void ingestFile(file, pendingKind);
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void ingestFile(file, "motion");
        }}
      />

      {showCamera ? (
        <div data-testid="yopho-camera-capture" style={{ border: "1px solid rgba(0,255,255,0.25)", borderRadius: 8, padding: 8 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>
            Existing TMI camera. Record, then the clip is ingested as a motion layer on this same YoPho.
          </div>
          <WebRTCCapture
            accentColor="#00FFFF"
            showRecordingControls
            onRecordingComplete={(file) => {
              setShowCamera(false);
              void ingestFile(file, "motion");
            }}
          />
        </div>
      ) : null}

      {showLocker ? (
        <div data-testid="yopho-creator-media" style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: 8 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{lockerNote ?? "Choose an existing video or image."}</div>
          {lockerItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                applyAdd(
                  createCanvasLayer(item.type === "video" ? "motion" : "image", {
                    label: item.title,
                    mediaType: item.type === "video" ? "video" : "image",
                    mediaAssetId: item.id,
                    srcUrl: item.url,
                  }),
                );
                setShowLocker(false);
                setStatus({ tone: "ok", text: `Referenced creator media ${item.id}` });
              }}
              style={{ ...btn, display: "block", width: "100%", textAlign: "left", marginTop: 6 }}
            >
              {item.type} · {item.title}
            </button>
          ))}
        </div>
      ) : null}

      <div data-testid="yopho-layer-panel" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {[...layers].reverse().map((layer) => (
          <button
            key={layer.id}
            type="button"
            data-testid={`yopho-layer-row-${layer.id}`}
            onClick={() => onSelect(layer.id)}
            style={{
              ...btn,
              textAlign: "left",
              borderColor: selectedId === layer.id ? "#00FFFF" : "rgba(255,255,255,0.15)",
              opacity: layer.visible ? 1 : 0.45,
            }}
          >
            {layer.kind} · {layer.label} {layer.locked ? "· locked" : ""} {layer.mediaType === "video" ? "· motion" : ""}
          </button>
        ))}
        {layers.length === 0 ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>No extra layers yet. Add images, backgrounds, or motion.</div>
        ) : null}
      </div>

      {selected ? (
        <LayerControls
          layer={selected}
          format={format}
          onChange={(next) => onChange(next)}
          composition={composition}
          maxImages={capacity.maxImages}
        />
      ) : null}

      {status ? (
        <div data-testid="yopho-ingest-status" style={{ fontSize: 11, color: status.tone === "err" ? "#ff6b9d" : status.tone === "warn" ? "#FFD700" : "#00FFFF" }}>
          {status.text}
        </div>
      ) : null}
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
        Beat Capture motion-video authority is not in this repository. Camera, MP4 upload, and Creator Media reuse existing TMI paths.
      </div>
    </div>
  );
}

function LayerControls({
  layer,
  format,
  composition,
  maxImages,
  onChange,
}: {
  layer: YoPhoCanvasLayer;
  format: YoPhoFormat;
  composition: YoPhoCardComposition;
  maxImages: number;
  onChange: (next: YoPhoCardComposition) => void;
}) {
  const nudge = (patch: Partial<YoPhoCanvasLayer["transform"]>) => {
    onChange(
      setLayerFormatOverride(composition, layer.id, format, patch),
    );
  };
  return (
    <div data-testid="yopho-layer-controls" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <button type="button" style={btn} onClick={() => onChange(updateCanvasLayer(composition, layer.id, { visible: !layer.visible }))}>
          {layer.visible ? "Hide" : "Show"}
        </button>
        <button type="button" style={btn} onClick={() => onChange(updateCanvasLayer(composition, layer.id, { locked: !layer.locked }))}>
          {layer.locked ? "Unlock" : "Lock"}
        </button>
        <button type="button" style={btn} onClick={() => onChange(reorderCanvasLayer(composition, layer.id, "forward"))}>
          Forward
        </button>
        <button type="button" style={btn} onClick={() => onChange(reorderCanvasLayer(composition, layer.id, "backward"))}>
          Backward
        </button>
        <button type="button" style={btn} onClick={() => onChange(reorderCanvasLayer(composition, layer.id, "front"))}>
          Front
        </button>
        <button type="button" style={btn} onClick={() => onChange(reorderCanvasLayer(composition, layer.id, "back"))}>
          Back
        </button>
        <button
          type="button"
          style={btn}
          onClick={() => {
            const next = duplicateCanvasLayer(composition, layer.id, maxImages);
            if (next) onChange(next);
          }}
        >
          Duplicate
        </button>
        <button type="button" style={{ ...btn, color: "#ff6b9d" }} onClick={() => onChange(removeCanvasLayer(composition, layer.id))}>
          Delete layer
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6 }}>
        <Nudge label="X" onMinus={() => nudge({ x: layer.transform.x - 4 })} onPlus={() => nudge({ x: layer.transform.x + 4 })} />
        <Nudge label="Y" onMinus={() => nudge({ y: layer.transform.y - 4 })} onPlus={() => nudge({ y: layer.transform.y + 4 })} />
        <Nudge label="Scale" onMinus={() => nudge({ scale: Math.max(0.2, layer.transform.scale - 0.05) })} onPlus={() => nudge({ scale: Math.min(3, layer.transform.scale + 0.05) })} />
        <Nudge label="Rotate" onMinus={() => nudge({ rotation: layer.transform.rotation - 5 })} onPlus={() => nudge({ rotation: layer.transform.rotation + 5 })} />
        <Nudge label="Opacity" onMinus={() => nudge({ opacity: Math.max(0.05, layer.transform.opacity - 0.05) })} onPlus={() => nudge({ opacity: Math.min(1, layer.transform.opacity + 0.05) })} />
        <select
          aria-label="Object fit"
          value={layer.transform.objectFit}
          onChange={(event) =>
            nudge({ objectFit: event.target.value as YoPhoCanvasLayer["transform"]["objectFit"] })
          }
          style={{ ...btn, background: "#0a0614" }}
        >
          <option value="contain">Contain</option>
          <option value="cover">Cover</option>
          <option value="fill">Fill</option>
        </select>
      </div>
    </div>
  );
}

function Nudge({ label, onMinus, onPlus }: { label: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <button type="button" style={btn} onClick={onMinus}>-</button>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", minWidth: 48, textAlign: "center" }}>{label}</span>
      <button type="button" style={btn} onClick={onPlus}>+</button>
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

const btn: CSSProperties = {
  padding: "7px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "inherit",
};
