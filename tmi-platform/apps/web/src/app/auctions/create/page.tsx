'use client';

import { useMemo, useState } from 'react';
import { AuctionListingEngine, type AuctionItemType } from '@/lib/auction/AuctionListingEngine';

const ITEM_TYPES: AuctionItemType[] = [
  'beats',
  'nfts',
  'tickets',
  'merch',
  'props',
  'sponsor-placements',
  'vip-seats',
  'venue-packages',
  'trophy-replicas',
  'backstage-passes',
];

export default function CreateAuctionPage() {
  const [title, setTitle] = useState('Neon Palace VIP Seat Bundle');
  const [itemType, setItemType] = useState<AuctionItemType>('vip-seats');
  const [reservePriceUSD, setReservePriceUSD] = useState(120);
  const [startPriceUSD, setStartPriceUSD] = useState(40);
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const canSubmit = useMemo(() => title.trim().length > 2 && startPriceUSD > 0 && reservePriceUSD >= startPriceUSD, [title, startPriceUSD, reservePriceUSD]);

  function handleCreate(): void {
    if (!canSubmit) return;
    const listing = AuctionListingEngine.createListing({
      sellerId: 'seller-demo',
      title,
      itemType,
      reservePriceUSD,
      startPriceUSD,
      durationMinutes,
    });
    setCreatedId(listing.id);
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #050510, #0f1b2e)', color: '#f3f4f6', padding: 24 }}>
      <section style={{ maxWidth: 760, margin: '0 auto', border: '1px solid rgba(0,255,255,0.3)', borderRadius: 14, padding: 18, background: 'rgba(5,10,25,0.78)' }}>
        <h1 style={{ marginTop: 0, color: '#00FFFF' }}>Create Auction</h1>
        <p style={{ color: '#a5b4fc' }}>Build listing, reserve, timer, and closure-ready auction metadata.</p>

        <label style={{ display: 'block', marginBottom: 10 }}>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #334155', background: '#0b1220', color: '#fff' }} />
        </label>

        <label style={{ display: 'block', marginBottom: 10 }}>
          Item Type
          <select value={itemType} onChange={(e) => setItemType(e.target.value as AuctionItemType)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #334155', background: '#0b1220', color: '#fff' }}>
            {ITEM_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          <label>
            Start Price
            <input type='number' value={startPriceUSD} onChange={(e) => setStartPriceUSD(Number(e.target.value))} style={{ display: 'block', width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #334155', background: '#0b1220', color: '#fff' }} />
          </label>
          <label>
            Reserve Price
            <input type='number' value={reservePriceUSD} onChange={(e) => setReservePriceUSD(Number(e.target.value))} style={{ display: 'block', width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #334155', background: '#0b1220', color: '#fff' }} />
          </label>
          <label>
            Duration (min)
            <input type='number' value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} style={{ display: 'block', width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #334155', background: '#0b1220', color: '#fff' }} />
          </label>
        </div>

        <button onClick={handleCreate} disabled={!canSubmit} style={{ marginTop: 14, padding: '10px 16px', borderRadius: 9, border: '1px solid rgba(255,45,170,0.6)', background: canSubmit ? 'rgba(255,45,170,0.2)' : 'rgba(100,116,139,0.3)', color: '#fff', cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
          Create Auction
        </button>

        {createdId && <p style={{ marginTop: 12, color: '#34d399' }}>Auction created: {createdId}</p>}
      </section>
    </main>
  );
}
