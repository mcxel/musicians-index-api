'use client';
import { ImageSlotWrapper } from '@/components/visual-enforcement';
// SharedPreviewStagePanel.tsx — THE staple platform feature
// Used in: live streams, arena, cypher, producer room, watch room, venue
// Modes: artist | producer | sponsor | prize | venue | event
// NON-INTERFERENCE LAW: never covers performer face, stage center, or turn timer
// Copilot wires: useSharedPreview(), useTurnQueue() for turn lock
// Proof: all room participants see same source simultaneously
export interface SharedPreviewStagePanelProps {
  mode?: 'artist'|'producer'|'sponsor'|'prize'|'venue'|'event';
  isOpen?: boolean;
  ownerName?: string;
  mediaTitle?: string;
  mediaThumbnail?: string;
  sourceType?: string;
  sourceUrl?: string;
}
export function SharedPreviewStagePanel({
  mode = 'artist', isOpen = false, ownerName, mediaTitle, mediaThumbnail, sourceType,
}: SharedPreviewStagePanelProps) {
  if (!isOpen) return null;
  const modeLabel = { artist:'🎤 Artist Preview', producer:'🎵 Beat Preview', sponsor:'📢 Sponsored', prize:'🏆 Prize', venue:'🏟️ Venue', event:'📅 Event' }[mode];
  return (
    <div className={`tmi-preview-stage tmi-preview-stage--${mode}`} role="complementary" aria-label="Shared Preview">
      <div className="tmi-preview-stage__mode-badge">{modeLabel}</div>
      {ownerName && <div className="tmi-preview-stage__owner">Shared by <strong>{ownerName}</strong></div>}
      <div className="tmi-preview-stage__media">
        {mediaThumbnail
          ? <ImageSlotWrapper imageId="img-589bvh" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
          : <div className="tmi-placeholder tmi-placeholder--preview"><span>▶</span></div>}
        {/* Copilot wires actual embed here based on sourceType */}
        <div data-slot="embed-target" data-source-type={sourceType} />
      </div>
      {mediaTitle && <div className="tmi-preview-stage__title">{mediaTitle}</div>}
      {/* Voice + media audio: SEPARATE channels — see VOICE_MEDIA_MIX_ARCHITECTURE.md */}
    </div>
  );
}
