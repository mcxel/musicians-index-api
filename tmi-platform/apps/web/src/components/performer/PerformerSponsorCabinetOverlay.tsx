'use client';

/**
 * PerformerSponsorCabinetOverlay.tsx
 *
 * Interactive Performer Sponsor Overlay Cabinet
 *
 * Pre-routed sponsor controls allowing the performer to broadcast approved
 * commercials and overlays to the Jumbotron and Universal Media Player with one tap.
 */

import React, { useState, useEffect } from 'react';
import {
  PerformerSponsorCabinetEngine,
  CabinetSlot,
  ValidatedSponsorAsset,
} from '../../lib/sponsor/PerformerSponsorCabinetEngine';
import { VenueContentPriority } from '../../lib/ads/VenueAdSurfaceRegistry';

interface PerformerSponsorCabinetOverlayProps {
  performerId: string;
  liveSessionId: string;
  onBroadcastTriggered?: (slotIndex: number, target: string) => void;
}

export const PerformerSponsorCabinetOverlay: React.FC<PerformerSponsorCabinetOverlayProps> = ({
  performerId,
  liveSessionId,
  onBroadcastTriggered,
}) => {
  const [engine] = useState(() => {
    const e = new PerformerSponsorCabinetEngine(performerId);

    // Pre-populate with approved sponsor assets delivered by the system
    const sampleAssets: ValidatedSponsorAsset[] = [
      {
        assetId: 'ast-logo-01',
        campaignId: 'camp-audio-brand-01',
        sponsorName: 'ElectroPulse Audio',
        assetType: 'SPONSOR_LOGO',
        title: 'Corner Bug Logo',
        creativeUrl: 'https://cdn.tmi.live/sponsors/electropulse-logo.png',
        durationSec: 6,
        cooldownSec: 15,
        allowedTargets: ['PLAYER_OVERLAY'],
        preferredTarget: 'PLAYER_OVERLAY',
        campaignPriority: VenueContentPriority.P4_DIRECT_AD_CAMPAIGN,
        approvedAtMs: Date.now() - 3600000,
        expiresAtMs: Date.now() + 86400000 * 30,
      },
      {
        assetId: 'ast-comm-02',
        campaignId: 'camp-tour-merch-02',
        sponsorName: 'TMI Apparel',
        assetType: 'SPONSOR_COMMERCIAL',
        title: '15s Arena Jumbotron Ad',
        creativeUrl: 'https://cdn.tmi.live/sponsors/apparel-tour-15s.mp4',
        durationSec: 15,
        cooldownSec: 60,
        allowedTargets: ['JUMBOTRON_FACE', 'JUMBOTRON_MULTI_FACE'],
        preferredTarget: 'JUMBOTRON_FACE',
        campaignPriority: VenueContentPriority.P3_CONTRACTED_SPONSOR,
        approvedAtMs: Date.now() - 3600000,
        expiresAtMs: Date.now() + 86400000 * 30,
      },
      {
        assetId: 'ast-card-03',
        campaignId: 'camp-hoodie-merch-03',
        sponsorName: 'Official Tour Merch',
        assetType: 'SPONSOR_PRODUCT_CARD',
        title: 'Tour Hoodie $45 Drop',
        creativeUrl: 'https://cdn.tmi.live/products/tour-hoodie.png',
        durationSec: 12,
        cooldownSec: 30,
        allowedTargets: ['PLAYER_OVERLAY', 'JUMBOTRON_FACE'],
        preferredTarget: 'PLAYER_OVERLAY',
        campaignPriority: VenueContentPriority.P4_DIRECT_AD_CAMPAIGN,
        commercePayload: {
          interactionType: 'ADD_TO_CART',
          productId: 'prod-hoodie-tour-2026',
        },
        approvedAtMs: Date.now() - 3600000,
        expiresAtMs: Date.now() + 86400000 * 30,
      },
      {
        assetId: 'ast-lower-04',
        campaignId: 'camp-energy-drink-04',
        sponsorName: 'Volt Energy',
        assetType: 'SPONSOR_LOWER_THIRD',
        title: 'Presented By Volt',
        creativeUrl: 'https://cdn.tmi.live/sponsors/volt-lower-third.png',
        durationSec: 8,
        cooldownSec: 20,
        allowedTargets: ['PLAYER_OVERLAY'],
        preferredTarget: 'PLAYER_OVERLAY',
        campaignPriority: VenueContentPriority.P4_DIRECT_AD_CAMPAIGN,
        approvedAtMs: Date.now() - 3600000,
        expiresAtMs: Date.now() + 86400000 * 30,
      },
    ];

    sampleAssets.forEach((ast, idx) => e.deliverAssetToCabinet(ast, idx + 1));
    return e;
  });

  const [slots, setSlots] = useState<CabinetSlot[]>(() => engine.getCabinetSlots());
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState<string>('Sponsor cabinet ready.');

  useEffect(() => {
    const interval = setInterval(() => {
      setSlots(engine.getCabinetSlots());
    }, 1000);
    return () => clearInterval(interval);
  }, [engine]);

  const handleTriggerSlot = (slotIndex: number) => {
    const result = engine.triggerSponsorAction(slotIndex, liveSessionId);
    setBroadcastMessage(result.message);
    if (result.status === 'LIVE_NOW' && result.eventId) {
      setActiveEventId(result.eventId);
      if (onBroadcastTriggered && result.targetSurface) {
        onBroadcastTriggered(slotIndex, result.targetSurface);
      }
    }
    setSlots(engine.getCabinetSlots());
  };

  const handleStopSponsor = () => {
    if (activeEventId) {
      engine.stopActiveSponsor(activeEventId, 'MANUAL_STOP');
      setActiveEventId(null);
      setBroadcastMessage('Broadcasting stopped. Returned to canonical live stream.');
      setSlots(engine.getCabinetSlots());
    }
  };

  return (
    <div
      data-testid="performer-sponsor-cabinet-overlay"
      style={{
        background: 'rgba(6, 7, 13, 0.95)',
        border: '1px solid #00FFFF',
        borderRadius: '12px',
        padding: '16px',
        color: '#FFFFFF',
        fontFamily: 'sans-serif',
        maxWidth: '560px',
        boxShadow: '0 8px 32px rgba(0, 255, 255, 0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
          paddingBottom: '8px',
        }}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00FFFF' }}>
            MY SPONSORS · OVERLAY CABINET
          </div>
          <div style={{ fontSize: '10px', color: '#8E929E' }}>
            Pre-routed approved creatives · Non-destructive broadcast
          </div>
        </div>
        {activeEventId && (
          <button
            onClick={handleStopSponsor}
            data-testid="stop-sponsor-button"
            style={{
              background: '#FF2DAA',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(255, 45, 170, 0.4)',
            }}
          >
            ⏹ STOP SPONSOR / RESUME
          </button>
        )}
      </div>

      {/* Slots Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '12px',
        }}
      >
        {slots.map((slot) => {
          const isReady = slot.status === 'READY';
          const isPlaying = slot.status === 'PLAYING';
          const isCooldown = slot.status === 'COOLDOWN';

          return (
            <div
              key={slot.slotIndex}
              data-testid={`sponsor-slot-${slot.slotIndex}`}
              style={{
                background: isPlaying
                  ? 'rgba(255, 45, 170, 0.15)'
                  : 'rgba(255, 255, 255, 0.04)',
                border: isPlaying
                  ? '1px solid #FF2DAA'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '10px',
                position: 'relative',
              }}
            >
              {slot.asset ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background:
                          slot.asset.preferredTarget === 'JUMBOTRON_FACE'
                            ? '#AA2DFF'
                            : '#00FFFF',
                        color: '#06070d',
                        fontWeight: 'bold',
                      }}
                    >
                      {slot.asset.preferredTarget === 'JUMBOTRON_FACE'
                        ? 'JUMBOTRON'
                        : 'PLAYER OVERLAY'}
                    </span>
                    <span style={{ fontSize: '9px', color: '#FFD700' }}>
                      {slot.asset.durationSec}s
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#FFFFFF' }}>
                    {slot.asset.sponsorName}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#8E929E',
                      marginBottom: '8px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {slot.asset.title}
                  </div>

                  <button
                    onClick={() => handleTriggerSlot(slot.slotIndex)}
                    disabled={!isReady}
                    data-testid={`trigger-slot-${slot.slotIndex}-button`}
                    style={{
                      width: '100%',
                      background: isPlaying
                        ? '#FF2DAA'
                        : isCooldown
                        ? 'rgba(255, 255, 255, 0.1)'
                        : '#00FFFF',
                      color: isCooldown ? '#8E929E' : '#06070d',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: isReady ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isPlaying
                      ? '🔴 BROADCASTING'
                      : isCooldown
                      ? `⏳ COOLDOWN (${slot.cooldownRemainingSec}s)`
                      : '▶ SEND TO SCREEN'}
                  </button>
                </>
              ) : (
                <div
                  style={{
                    height: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255, 255, 255, 0.3)',
                    fontSize: '11px',
                  }}
                >
                  <span>SLOT {slot.slotIndex}</span>
                  <span style={{ fontSize: '9px' }}>EMPTY SPONSOR SPACE</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Real Broadcast Feedback Banner */}
      <div
        data-testid="broadcast-status-banner"
        style={{
          background: 'rgba(0, 255, 255, 0.08)',
          border: '1px solid rgba(0, 255, 255, 0.2)',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '11px',
          color: '#00FFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>📡</span>
        <span>{broadcastMessage}</span>
      </div>
    </div>
  );
};
