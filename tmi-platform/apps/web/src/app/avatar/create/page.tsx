'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import SectionTitle from '@/components/ui/SectionTitle';

type AvatarConfig = {
  skin: string;
  hair: string;
  outfit: string;
  headSize: number;
  name: string;
};

const SKIN_TONES = ['#FDBCB4', '#E8956D', '#C47A45', '#8D5524', '#4A2912', '#2C160A'];
const HAIR_STYLES = ['Short Fade', 'Afro', 'Locs', 'Braids', 'Buzz Cut', 'Long Curls', 'Mohawk', 'Bald'];
const OUTFITS = ['Street Fit', 'Stage Outfit', 'Crown Gear', 'Producer Drip', 'Cypher Uniform', 'Classic Tee'];

export default function AvatarCreatePage() {
  const [config, setConfig] = useState<AvatarConfig>({ skin: '#C47A45', hair: 'Afro', outfit: 'Street Fit', headSize: 1.4, name: '' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: POST to /api/avatar/save
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 80 }}>
          <div style={{ background: 'linear-gradient(160deg, #1a0528 0%, #050510 60%)', padding: '48px 32px 32px', borderBottom: '1px solid #AA2DFF33' }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: '#AA2DFF', marginBottom: 8 }}>AVATAR SYSTEM</div>
            <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', margin: 0 }}>CREATE YOUR AVATAR</h1>
          </div>

          <div style={{ padding: '48px 32px 0', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' }}>
            {/* Preview */}
            <div>
              <SectionTitle accent="#AA2DFF">PREVIEW</SectionTitle>
              <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 3 }} style={{ marginTop: 24, background: '#0a0a1a', border: '1px solid #AA2DFF33', borderRadius: 20, padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                {/* Bobblehead SVG-style preview */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Head */}
                  <div style={{ width: 80 * config.headSize, height: 80 * config.headSize, borderRadius: '50%', background: config.skin, border: '3px solid #AA2DFF44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: -10, zIndex: 2 }}>
                    😊
                  </div>
                  {/* Body */}
                  <div style={{ width: 60, height: 80, background: '#1a1a2e', borderRadius: '10px 10px 14px 14px', border: '2px solid #AA2DFF33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    👕
                  </div>
                  {/* Legs */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <div style={{ width: 22, height: 36, background: '#111', borderRadius: '4px 4px 8px 8px' }} />
                    <div style={{ width: 22, height: 36, background: '#111', borderRadius: '4px 4px 8px 8px' }} />
                  </div>
                </div>
                {config.name && <div style={{ marginTop: 20, color: '#AA2DFF', fontWeight: 800, letterSpacing: 2, fontSize: 14 }}>{config.name.toUpperCase()}</div>}
                <div style={{ marginTop: 8, color: '#444', fontSize: 11 }}>{config.hair} · {config.outfit}</div>
              </motion.div>
            </div>

            {/* Controls */}
            <div>
              <SectionTitle accent="#FF2DAA">CUSTOMIZE</SectionTitle>
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Name */}
                <div>
                  <div style={{ color: '#888', fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>AVATAR NAME</div>
                  <input value={config.name} onChange={(e) => setConfig((c) => ({ ...c, name: e.target.value }))} placeholder="Enter name…" maxLength={32} style={{ width: '100%', background: '#0a0a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Skin */}
                <div>
                  <div style={{ color: '#888', fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>SKIN TONE</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {SKIN_TONES.map((tone) => (
                      <button key={tone} onClick={() => setConfig((c) => ({ ...c, skin: tone }))} style={{ width: 36, height: 36, borderRadius: '50%', background: tone, border: config.skin === tone ? '3px solid #AA2DFF' : '3px solid transparent', cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>

                {/* Hair */}
                <div>
                  <div style={{ color: '#888', fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>HAIR STYLE</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {HAIR_STYLES.map((h) => (
                      <button key={h} onClick={() => setConfig((c) => ({ ...c, hair: h }))} style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${config.hair === h ? '#AA2DFF' : '#333'}`, background: config.hair === h ? '#AA2DFF22' : 'transparent', color: config.hair === h ? '#AA2DFF' : '#888', fontSize: 11, cursor: 'pointer' }}>{h}</button>
                    ))}
                  </div>
                </div>

                {/* Outfit */}
                <div>
                  <div style={{ color: '#888', fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>OUTFIT</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {OUTFITS.map((o) => (
                      <button key={o} onClick={() => setConfig((c) => ({ ...c, outfit: o }))} style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${config.outfit === o ? '#FF2DAA' : '#333'}`, background: config.outfit === o ? '#FF2DAA22' : 'transparent', color: config.outfit === o ? '#FF2DAA' : '#888', fontSize: 11, cursor: 'pointer' }}>{o}</button>
                    ))}
                  </div>
                </div>

                {/* Head Size */}
                <div>
                  <div style={{ color: '#888', fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>HEAD SIZE — {config.headSize.toFixed(1)}x</div>
                  <input type="range" min={1.0} max={2.0} step={0.1} value={config.headSize} onChange={(e) => setConfig((c) => ({ ...c, headSize: parseFloat(e.target.value) }))} style={{ width: '100%', accentColor: '#AA2DFF' }} />
                </div>

                {/* Save */}
                <button onClick={handleSave} style={{ background: saved ? '#22aa44' : '#AA2DFF', color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: 2, padding: '14px', borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'background .3s' }}>
                  {saved ? '✓ AVATAR SAVED' : 'SAVE AVATAR'}
                </button>
                <Link href="/avatar/shop" style={{ textAlign: 'center', color: '#AA2DFF88', fontSize: 12, letterSpacing: 1 }}>Browse the shop for more items →</Link>
              </div>
            </div>
          </div>
        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
