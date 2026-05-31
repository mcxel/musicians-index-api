'use client';

import { useState } from 'react';

const SEED_NFTS = [
  { id: 1, name: 'Crown Moment #001', price: 500, creator: 'DJ Phantom', image: '👑' },
  { id: 2, name: 'Fire Verse #07', price: 250, creator: 'Lena Voss', image: '🔥' },
  { id: 3, name: 'Beat Genesis Alpha', price: 1200, creator: 'BeatMaestro', image: '🎹' },
  { id: 4, name: 'Stage Legend #12', price: 800, creator: 'CypherKing', image: '🏆' },
  { id: 5, name: 'Midnight Cipher', price: 350, creator: 'Rhyme Prophet', image: '🌙' },
  { id: 6, name: 'Platinum Flow EP', price: 2000, creator: 'Soulstrike', image: '💿' },
];

export default function NftPage() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [royalty, setRoyalty] = useState('10');
  const [minting, setMinting] = useState(false);
  const [mintDone, setMintDone] = useState(false);

  async function handleMint(e: React.FormEvent) {
    e.preventDefault();
    setMinting(true);
    try {
      await fetch('/api/nft/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc, royaltyPct: Number(royalty) }),
      });
      setMintDone(true);
      setTitle('');
      setDesc('');
    } catch {
      // silently fail — API may not exist yet
    }
    setMinting(false);
  }

  return (
    <div style={{ background: '#07071a', minHeight: '100vh', color: '#fff', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: 3, color: '#AA2DFF', marginBottom: 4, margin: 0 }}>
          NFT STUDIO
        </h1>
        <p style={{ color: '#666', marginBottom: 48, marginTop: 8 }}>
          NFTs on TMI represent moments, beats, and achievements minted by artists.
        </p>

        {/* Mint Form */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, color: '#AA2DFF', marginBottom: 20 }}>
            MINT NEW NFT
          </h2>
          {mintDone && (
            <div style={{ background: '#1a0a2a', border: '1px solid #AA2DFF', borderRadius: 8, padding: '12px 18px', marginBottom: 20, color: '#CC88FF' }}>
              Mint request submitted! Your NFT will appear in your collection shortly.
            </div>
          )}
          <form onSubmit={handleMint} style={{
            background: '#0d0d2a', border: '1px solid #2a1a4a', borderRadius: 12,
            padding: 28, maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{
              background: '#1a0a2a', border: '2px dashed #3a1a5a', borderRadius: 8,
              padding: 32, textAlign: 'center', color: '#666', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
              <span>Drop artwork here or </span>
              <span style={{ color: '#AA2DFF', fontWeight: 600 }}>browse files</span>
              <div style={{ fontSize: 12, color: '#444', marginTop: 6 }}>PNG, JPG, GIF, MP4 supported</div>
            </div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="NFT Title"
              required
              style={{ background: '#111130', border: '1px solid #2a1a4a', borderRadius: 6, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' }}
            />
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Description"
              rows={3}
              style={{ background: '#111130', border: '1px solid #2a1a4a', borderRadius: 6, padding: '10px 14px', color: '#fff', fontSize: 14, resize: 'vertical', outline: 'none' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ color: '#aaa', fontSize: 13, whiteSpace: 'nowrap' }}>Royalty %</label>
              <input
                type="number"
                min="0"
                max="50"
                value={royalty}
                onChange={e => setRoyalty(e.target.value)}
                style={{ width: 70, background: '#111130', border: '1px solid #2a1a4a', borderRadius: 6, padding: '8px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
              />
              <span style={{ color: '#555', fontSize: 12 }}>Earned on every resale</span>
            </div>
            <button
              type="submit"
              disabled={minting}
              style={{
                background: minting ? '#4a1a7a' : '#AA2DFF',
                color: '#fff', border: 'none', borderRadius: 8,
                padding: '12px 0', fontWeight: 700, fontSize: 15,
                cursor: minting ? 'not-allowed' : 'pointer', letterSpacing: 1,
              }}
            >
              {minting ? 'MINTING...' : 'MINT NFT'}
            </button>
          </form>
        </section>

        {/* Marketplace */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, color: '#AA2DFF', marginBottom: 20 }}>
            MARKETPLACE
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
            {SEED_NFTS.map(nft => (
              <div key={nft.id} style={{ background: '#0d0d2a', border: '1px solid #2a1a4a', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: '#1a0a2a', padding: '32px 0', textAlign: 'center', fontSize: 52 }}>
                  {nft.image}
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{nft.name}</div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>{nft.creator}</div>
                  <div style={{ color: '#AA2DFF', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                    {nft.price.toLocaleString()} credits
                  </div>
                  <button style={{
                    background: '#AA2DFF', color: '#fff', border: 'none', borderRadius: 6,
                    padding: '7px 0', fontWeight: 700, cursor: 'pointer', width: '100%', fontSize: 13,
                  }}>
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* My Collection */}
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, color: '#AA2DFF', marginBottom: 16 }}>
            MY COLLECTION
          </h2>
          <div style={{
            background: '#0d0d2a', border: '1px solid #2a1a4a', borderRadius: 12,
            padding: 48, textAlign: 'center', color: '#444',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
            <div style={{ fontSize: 15 }}>No NFTs yet. Mint your first one above!</div>
          </div>
        </section>
      </div>
    </div>
  );
}
