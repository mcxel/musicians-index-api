"use client";

/**
 * Bounded YoPho create flow (§6266–§6267):
 * FORMAT → STARTER → PREVIEW → COMPOSE → LIGHTING/EFFECTS → SAVE
 * Quick path skips advanced compose. Unsaved design stays when leaving to MY YOPHOS.
 */

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import YoPhoFormatFirstCreator, {
  type YoPhoOwnerContent,
} from "@/components/yopho/YoPhoFormatFirstCreator";
import YoPhoPreviewWorkspace from "@/components/yopho/YoPhoPreviewWorkspace";
import YoPhoEffectsPanel from "@/components/yopho/YoPhoEffectsPanel";
import YoPhoAiSceneCompositor from "@/components/yopho/YoPhoAiSceneCompositor";
import YoPhoCanvasComposer from "@/components/yopho/YoPhoCanvasComposer";
import {
  loadCardComposition,
  saveCardComposition,
  withSyncedVisual,
  type YoPhoCardComposition,
} from "@/lib/yopho/YoPhoCardComposition";
import type { YoPhoFormat } from "@/lib/yopho/YoPhoFormatAuthority";
import { exportSizeForFormat } from "@/lib/yopho/YoPhoFormatAuthority";
import type { YoPhoStarterLayout } from "@/lib/yopho/YoPhoStarterRegistry";
import {
  createDefaultVisual,
  hydrateVisualFromMagicIds,
  type YoPhoPreviewWindowId,
  type YoPhoVisualState,
} from "@/lib/yopho/YoPhoVisualRuntime";
import { getScenePack } from "@/lib/yopho/YoPhoScenePack";
import { exportYoPhoStill, renderYoPhoFormatBlob } from "@/lib/yopho/exportYoPhoCard";
import { compositionToDraft, interactiveCardPath, publishYoPhoCard } from "@/lib/yopho/YoPhoCardRegistry";
import YoPhoMediaModuleComposer from "@/components/yopho/YoPhoMediaModuleComposer";
import YoPhoCardMediaPlayer from "@/components/yopho/YoPhoCardMediaPlayer";

const AvatarShowroomPreview = dynamic(
  () => import("@/components/avatar/AvatarShowroomPreview").then((mod) => mod.AvatarShowroomPreview),
  {
    ssr: false,
    loading: () => (
      <div data-testid="yopho-avatar-showroom-loading" style={{ minHeight: 220, color: "#00FFFF" }}>
        Opening avatar showroom…
      </div>
    ),
  },
);

type Step = "format" | "studio";

export default function YoPhoCreatorWorkspace({
  ownerId,
  ownerContent,
}: {
  ownerId: string;
  ownerContent?: YoPhoOwnerContent;
}) {
  const persistRole = "workspace";
  const [step, setStep] = useState<Step>("format");
  const [comp, setComp] = useState<YoPhoCardComposition>(() =>
    withSyncedVisual(loadCardComposition(persistRole, ownerId)),
  );
  const [format, setFormat] = useState<YoPhoFormat>(comp.primaryFormat ?? "TRADING_CARD");
  const [previewId, setPreviewId] = useState<YoPhoPreviewWindowId>("CARD_MOTION");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [publicHref, setPublicHref] = useState<string | null>(null);
  const [showroomOpen, setShowroomOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const visual = useMemo(
    () => hydrateVisualFromMagicIds(comp.magicEffects, comp.visual ?? createDefaultVisual({ primaryFormat: format })),
    [comp.magicEffects, comp.visual, format],
  );

  useEffect(() => {
    saveCardComposition(persistRole, ownerId, { ...comp, visual, primaryFormat: format });
  }, [comp, visual, format, ownerId]);

  const applyStarter = (composition: YoPhoCardComposition, nextFormat: YoPhoFormat, _starter: YoPhoStarterLayout) => {
    const next = withSyncedVisual({ ...composition, primaryFormat: nextFormat });
    setComp(next);
    setFormat(nextFormat);
    setPreviewId(nextFormat === "ALBUM_COVER" ? "COVER_MOTION" : "CARD_MOTION");
    setStep("studio");
    setSaveNote(null);
  };

  const patchVisual = (next: YoPhoVisualState) => {
    setComp((c) =>
      withSyncedVisual({
        ...c,
        visual: { ...next, primaryFormat: format },
        primaryFormat: format,
      }),
    );
  };

  const scene = getScenePack(comp.sceneId);

  if (step === "format") {
    return (
      <div data-testid="yopho-create-workspace">
        <YoPhoFormatFirstCreator ownerContent={ownerContent} onApply={applyStarter} />
        {comp.visual && (comp.magicEffects?.length || comp.updatedAt) ? (
          <button
            type="button"
            data-testid="yopho-resume-unsaved"
            onClick={() => setStep("studio")}
            style={ghostBtn}
          >
            Resume unsaved design
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div data-testid="yopho-create-workspace" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" data-testid="yopho-back-to-format" onClick={() => setStep("format")} style={ghostBtn}>
          ← Format / starter
        </button>
        <button
          type="button"
          data-testid="yopho-toggle-advanced"
          onClick={() => setShowAdvanced((v) => !v)}
          style={ghostBtn}
        >
          {showAdvanced ? "Hide advanced compose" : "Advanced compose"}
        </button>
        <button
          type="button"
          data-testid="yopho-play-toggle"
          onClick={() => patchVisual({ ...visual, motionPlaying: !visual.motionPlaying })}
          style={ghostBtn}
        >
          {visual.motionPlaying ? "Pause motion" : "Play motion"}
        </button>
        <button
          type="button"
          data-testid="yopho-switch-format"
          onClick={() => {
            const next = format === "TRADING_CARD" ? "ALBUM_COVER" : "TRADING_CARD";
            setFormat(next);
            setPreviewId(next === "ALBUM_COVER" ? "COVER_MOTION" : "CARD_MOTION");
            setComp((c) => withSyncedVisual({ ...c, primaryFormat: next, visual: { ...visual, primaryFormat: next } }));
          }}
          style={ghostBtn}
        >
          Format {format === "TRADING_CARD" ? "5:7 → 1:1" : "1:1 → 5:7"}
        </button>
        <button
          type="button"
          data-testid="yopho-save-design"
          onClick={() => {
            saveCardComposition(persistRole, ownerId, withSyncedVisual({ ...comp, visual, primaryFormat: format }));
            setSaveNote(`Saved on this device. ${comp.cardId ? `YOPHO_ID=${comp.cardId}` : "Draft has no public id yet."}`);
          }}
          style={{
            ...ghostBtn,
            background: "#FFD700",
            color: "#050510",
            borderColor: "#FFD700",
          }}
        >
          Save
        </button>
        <button
          type="button"
          data-testid="yopho-export-current"
          onClick={async () => {
            const node = exportRef.current;
            if (!node) return;
            const size = exportSizeForFormat(format);
            const rendered = await renderYoPhoFormatBlob(node, format);
            if (rendered.ok && rendered.blob) {
              const url = URL.createObjectURL(rendered.blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `yopho-${format === "ALBUM_COVER" ? "cover-3000x3000" : "card-1500x2100"}.png`;
              a.click();
              URL.revokeObjectURL(url);
              setSaveNote(`Static export ${format} ${size.width}×${size.height} created.`);
            } else {
              const fallback = await exportYoPhoStill(node, { displayName: ownerId });
              setSaveNote(fallback.ok ? `Static export downloaded.` : fallback.error ?? "Export failed");
            }
          }}
          style={ghostBtn}
        >
          Export {format === "ALBUM_COVER" ? "1:1" : "5:7"}
        </button>
        <button
          type="button"
          data-testid="yopho-publish-public"
          onClick={async () => {
            const draft = compositionToDraft(
              withSyncedVisual({ ...comp, visual, primaryFormat: format }),
              {
                role: "fan",
                displayName: ownerContent?.title ?? ownerId,
                subjectUrl: ownerContent?.artistImageUrl ?? ownerContent?.artworkUrl ?? "",
                ownerKey: ownerId,
              },
            );
            const published = await publishYoPhoCard(draft);
            setComp((c) => ({ ...c, cardId: published.cardId }));
            setPublicHref(interactiveCardPath(published.cardId));
            setSaveNote(`Public card ${published.cardId}${published.error ? ` · ${published.error}` : ""}`);
          }}
          style={ghostBtn}
        >
          Open public card
        </button>
      </div>

      <div ref={exportRef} data-testid="yopho-export-stage">
        <YoPhoPreviewWorkspace
          visual={visual}
          activeId={previewId}
          onSelect={setPreviewId}
          subjectUrl={ownerContent?.artistImageUrl ?? ownerContent?.artworkUrl}
          title={comp.textOverlay.text || ownerContent?.title}
          backdropCss={scene.backdropCss}
          composition={comp}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
        />
      </div>

      <div data-testid="yopho-showroom-slot" style={{ display: "grid", gap: 8 }}>
        <button
          type="button"
          data-testid="yopho-showroom-toggle"
          onClick={() => setShowroomOpen((open) => !open)}
          style={ghostBtn}
        >
          {showroomOpen ? "Hide avatar showroom" : "Avatar showroom"}
        </button>
        {showroomOpen ? (
          <AvatarShowroomPreview height={300} testId="yopho-avatar-showroom" />
        ) : null}
      </div>

      <YoPhoMediaModuleComposer
        role="fan"
        userKey={ownerId}
        accountTier="FREE"
        modules={comp.mediaModules ?? []}
        onChange={(modules) => {
          const playlist = modules.find(
            (mod) => (mod.type === "playlist" || mod.type === "album") && mod.sourceId,
          );
          setComp((current) => ({
            ...current,
            mediaModules: modules,
            playlistId: playlist?.sourceId ?? null,
          }));
        }}
      />
      <div data-testid="yopho-playlist-player" style={{ position: "relative", minHeight: 72 }}>
        <YoPhoCardMediaPlayer
          modules={(comp.mediaModules ?? []).map((mod) => ({ ...mod, autoplayPolicy: "off" as const }))}
          displayName={ownerContent?.title ?? ownerId}
          interactive
        />
      </div>

      <YoPhoCanvasComposer
        composition={comp}
        format={format}
        selectedId={selectedLayerId}
        onChange={(next) => setComp((current) => withSyncedVisual({
          ...next,
          visual,
          primaryFormat: format,
          mediaModules: next.mediaModules ?? current.mediaModules,
          playlistId: next.playlistId ?? current.playlistId,
        }))}
        onSelect={setSelectedLayerId}
      />

      <YoPhoEffectsPanel visual={visual} activeFormat={format} onChange={patchVisual} />

      {saveNote ? (
        <div data-testid="yopho-save-note" style={{ fontSize: 11, color: "#00FFFF" }}>
          {saveNote}
        </div>
      ) : null}
      {publicHref ? (
        <a data-testid="yopho-public-link" href={publicHref} style={{ fontSize: 11, color: "#FFD700" }}>
          Public render {publicHref}
        </a>
      ) : null}

      {showAdvanced ? <YoPhoAiSceneCompositor ownerId={ownerId} isDrawer visual={visual} onVisualChange={patchVisual} /> : null}
    </div>
  );
}

const ghostBtn: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "inherit",
};
