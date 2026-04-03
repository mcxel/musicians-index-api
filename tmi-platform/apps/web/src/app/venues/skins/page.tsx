"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/layout/HUDFrame';
import FooterHUD from '@/components/layout/FooterHUD';
import { listVenueSkins, getVenueSkinsByTag, applyVenueSkin, type VenueSkin } from '@/lib/venue/venueSkinEngine';

const ALL_SKINS = listVenueSkins();
const ALL_TAGS = Array.from(new Set(ALL_SKINS.flatMap(s => s.tags)));

export default function VenueSkinsPage() {
  const router = useRouter();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [preview, setPreview] = useState<VenueSkin | null>(null);
  const [applied, setApplied] = useState<string | null>(null);

  const filtered = activeTag ? getVenueSkinsByTag(activeTag) : ALL_SKINS;

  function handleApply(skin: VenueSkin) {
    applyVenueSkin(document.body, skin);
    setApplied(skin.id);
    setTimeout(() => setApplied(null), 2500);
  }

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', padding: '24px 20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 28, fontWeight: 900, letterSpacing: 4, color: '#AA2DFF', margin: 0 }}
            >
              VENUE SKINS
            </motion.h1>
            <p style={{ color: '#555', fontSize: 13, marginTop: 6 }}>
              Choose the visual identity for any room
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/venues/designer')}
                style={{
                  padding: '7px 18px', background: 'transparent',
                  border: '1px solid #AA2DFF', borderRadius: 6, color: '#AA2DFF',
                  fontSize: 11, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                + CREATE CUSTOM SKIN
              </motion.button>
            </div>
          </div>

          {applied && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)',
                borderRadius: 8, padding: '10px 16px', marginBottom: 20, textAlign: 'center',
                color: '#00FF88', fontSize: 13,
              }}
            >
              ✓ Venue skin applied
            </motion.div>
          )}

          {/* Tag filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, justifyContent: 'center' }}>
            {[null, ...ALL_TAGS].map(tag => (
              <motion.button
                key={tag ?? 'all'}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTag(tag)}
                style={{
                  padding: '5px 14px',
                  background: activeTag === tag ? 'rgba(170,45,255,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeTag === tag ? '#AA2DFF' : '#222'}`,
                  borderRadius: 20, color: activeTag === tag ? '#AA2DFF' : '#555',
                  fontSize: 11, letterSpacing: 1, cursor: 'pointer',
                }}
              >
                {tag ?? 'ALL'}
              </motion.button>
            ))}
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16, maxWidth: 1100, margin: '0 auto',
          }}>
            {filtered.map((skin, i) => (
              <motion.div
                key={skin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.03, y: -4 }}
                style={{
                  background: `linear-gradient(135deg, ${skin.colorPalette.primary}22, ${skin.colorPalette.accent}11)`,
                  border: `1px solid ${skin.colorPalette.primary}55`,
                  borderRadius: 12, padding: 16,
                }}
              >
                <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                  {Object.values(skin.colorPalette).slice(0, 5).map((color, ci) => (
                    <div key={ci} style={{
                      width: 20, height: 20, borderRadius: 4, background: color as string,
                      border: '1px solid rgba(255,255,255,0.1)',
                    }} />
                  ))}
                </div>
                <h3 style={{ color: skin.colorPalette.text as string, fontSize: 13, fontWeight: 800, letterSpacing: 2, margin: '0 0 4px' }}>
                  {skin.name.toUpperCase()}
                </h3>
                <p style={{ color: '#555', fontSize: 11, margin: '0 0 8px' }}>
                  {skin.lightingPreset} · {skin.stageLayout}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {skin.tags.map(tag => (
                    <span key={tag} style={{
                      padding: '2px 6px', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #1a1a1a', borderRadius: 4,
                      color: '#444', fontSize: 10, letterSpacing: 1,
                    }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPreview(skin)}
                    style={{
                      flex: 1, padding: '7px 0', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #2a2a2a', borderRadius: 6, color: '#666',
                      fontSize: 11, letterSpacing: 1, cursor: 'pointer',
                    }}
                  >
                    DETAILS
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApply(skin)}
                    style={{
                      flex: 1, padding: '7px 0',
                      background: `linear-gradient(135deg, ${skin.colorPalette.primary}, ${skin.colorPalette.accent})`,
                      border: 'none', borderRadius: 6, color: '#fff',
                      fontSize: 11, letterSpacing: 1, cursor: 'pointer', fontWeight: 700,
                    }}
                  >
                    APPLY
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail modal */}
          {preview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setPreview(null)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(5,5,16,0.92)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, padding: 20,
              }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                onClick={e => e.stopPropagation()}
                style={{
                  background: `linear-gradient(135deg, ${preview.colorPalette.primary}22, #050510 60%)`,
                  border: `2px solid ${preview.colorPalette.primary}`,
                  borderRadius: 16, padding: 28, maxWidth: 460, width: '100%',
                }}
              >
                <h2 style={{ color: preview.colorPalette.text as string, fontSize: 20, fontWeight: 900, letterSpacing: 3, marginBottom: 16 }}>
                  {preview.name.toUpperCase()}
                </h2>

                <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
                  {Object.entries(preview.colorPalette).map(([key, color]) => (
                    <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: color, border: '1px solid rgba(255,255,255,0.08)' }} />
                      <span style={{ color: '#333', fontSize: 8, letterSpacing: 1 }}>{key.slice(0, 4).toUpperCase()}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                  {([
                    ['Lighting', preview.lightingPreset],
                    ['Stage Layout', preview.stageLayout],
                    ['Crowd Layout', preview.crowdLayout],
                    ['Floor Pattern', preview.floorPattern],
                    ['Sponsor Wall', preview.sponsorWallPlacement],
                    ['Camera Angles', preview.cameraAngles.join(', ')],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px 10px' }}>
                      <div style={{ color: '#333', fontSize: 10, letterSpacing: 2 }}>{label.toUpperCase()}</div>
                      <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>{val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 18 }}>
                  <div style={{ color: '#333', fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>PARTICLE EFFECTS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {preview.particleEffects.map(fx => (
                      <span key={fx} style={{
                        padding: '3px 8px', background: `${preview.colorPalette.glow}22`,
                        border: `1px solid ${preview.colorPalette.glow}44`,
                        borderRadius: 4, color: preview.colorPalette.glow as string, fontSize: 11,
                      }}>{fx}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { handleApply(preview); setPreview(null); }}
                    style={{
                      flex: 1, padding: '11px 0',
                      background: `linear-gradient(135deg, ${preview.colorPalette.primary}, ${preview.colorPalette.accent})`,
                      border: 'none', borderRadius: 8, color: '#fff',
                      fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: 'pointer',
                    }}
                  >
                    APPLY SKIN
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setPreview(null)}
                    style={{
                      padding: '11px 20px', background: 'transparent',
                      border: '1px solid #333', borderRadius: 8, color: '#555',
                      fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    CLOSE
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
