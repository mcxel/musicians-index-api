"use client";

import { useEffect, useMemo, useState } from 'react';
import type { WorkspaceRole } from '@/components/shell/workspaceTypes';
import {
  type BroadcastQueueItem,
  type BroadcastRoomType,
  fetchBroadcastQueue,
} from '@/lib/broadcast/BroadcastQueueRegistry';
import { BroadcastQueueWall } from '@/components/broadcast/BroadcastQueueWall';
import { BroadcastOpportunityFeed } from '@/components/broadcast/BroadcastOpportunityFeed';
import { WorkspaceTemplate } from '@/components/shell/WorkspaceTemplate';

type LobbyWallWorkspaceProps = {
  role: WorkspaceRole;
};

export function LobbyWallWorkspace({ role }: LobbyWallWorkspaceProps) {
  const [items, setItems] = useState<BroadcastQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewRoomId, setPreviewRoomId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const queue = await fetchBroadcastQueue();
        if (!cancelled) setItems(queue);
      } catch {
        if (!cancelled) setError('Live rooms are currently unavailable. Retry in a moment.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const timer = window.setInterval(load, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const byType = useMemo(() => {
    const map = new Map<BroadcastRoomType, BroadcastQueueItem[]>();
    for (const item of items) {
      const list = map.get(item.roomType) ?? [];
      list.push(item);
      map.set(item.roomType, list);
    }
    return map;
  }, [items]);

  const isPerformer = role === 'performer' || role === 'artist' || role === 'producer';
  const isSponsor = role === 'sponsor' || role === 'advertiser';
  const isVenue = role === 'venue' || role === 'promoter';

  const liveCount = items.length;
  const status = loading
    ? { label: 'Loading', tone: 'neutral' as const }
    : error
      ? { label: 'Error', tone: 'warning' as const }
      : liveCount > 0
        ? { label: `${liveCount} live`, tone: 'live' as const }
        : { label: 'No active rooms', tone: 'neutral' as const };

  return (
    <WorkspaceTemplate
      icon="🧱"
      title="Live Lobby Wall"
      subtitle={isPerformer ? 'Challenge board and fast entry for performer flow.' : 'Fast room-entry wall for fan flow.'}
      status={status}
      toolbar={
        <button
          type="button"
          onClick={() => window.location.assign('/live/rooms')}
          style={{
            borderRadius: 10,
            border: '1px solid rgba(0,255,255,0.45)',
            background: 'rgba(0,255,255,0.14)',
            color: '#cffeff',
            padding: '8px 10px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Open Full Lobby
        </button>
      }
      statusStrip={
        previewRoomId
          ? `Preview target: ${previewRoomId}`
          : 'Hover a room tile to prime preview. If no feed is available, preview remains in empty-ready mode.'
      }
    >
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'grid', gap: 12, alignContent: 'start' }}>
        {loading ? (
          <Panel title="Loading Live Surfaces">Loading lobby media surfaces…</Panel>
        ) : error ? (
          <Panel title="Live Data Error">{error}</Panel>
        ) : items.length === 0 ? (
          <div style={{ display: 'grid', gap: 10 }}>
            <Panel title="No Active Rooms">
              No active rooms right now. Open lobby to create or join the next live surface.
            </Panel>
            <BroadcastOpportunityFeed />
          </div>
        ) : isPerformer ? (
          <PerformerBoard byType={byType} onPreview={setPreviewRoomId} />
        ) : isSponsor ? (
          <SponsorBoard byType={byType} onPreview={setPreviewRoomId} />
        ) : isVenue ? (
          <VenueBoard byType={byType} onPreview={setPreviewRoomId} />
        ) : (
          <BroadcastQueueWall items={items} onPreview={setPreviewRoomId} />
        )}
      </div>
    </WorkspaceTemplate>
  );
}

function Panel({ title, children }: { title: string; children: string }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px dashed rgba(255,255,255,0.22)',
        background: 'rgba(6, 10, 24, 0.62)',
        padding: 14,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 6, color: '#cefbff' }}>{title}</div>
      <div style={{ fontSize: 12, color: 'rgba(230, 230, 255, 0.75)' }}>{children}</div>
    </div>
  );
}

type BoardProps = {
  byType: Map<BroadcastRoomType, BroadcastQueueItem[]>;
  onPreview: (roomId: string) => void;
};

function PerformerBoard({ byType, onPreview }: BoardProps) {
  const allItems = [
    ...(byType.get('contest') ?? []),
    ...(byType.get('battle') ?? []),
    ...(byType.get('cypher') ?? []),
  ];

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {allItems.length > 0 ? (
        <BroadcastQueueWall items={allItems} onPreview={onPreview} />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          <Panel title="No Active Performer Rooms">No open challenges, battles, or cyphers right now. Use Go Live to start one.</Panel>
          <BroadcastOpportunityFeed />
        </div>
      )}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
        <QuickAction href="/home/5" label="Today Missions" />
        <QuickAction href="/account/subscription" label="Revenue" />
        <QuickAction href="/dashboard" label="Analytics" />
      </section>
    </div>
  );
}

function SponsorBoard({ byType, onPreview }: BoardProps) {
  const allItems = [...(byType.get('event') ?? []), ...(byType.get('battle') ?? [])];

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {allItems.length > 0 ? (
        <BroadcastQueueWall items={allItems} onPreview={onPreview} />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          <Panel title="No Sponsored-Eligible Rooms">No live rooms currently available for sponsorship overlays.</Panel>
          <BroadcastOpportunityFeed />
        </div>
      )}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8 }}>
        <QuickAction href="/sponsors/advertise" label="Available Placement Slots" />
        <QuickAction href="/sponsors" label="Campaign Performance" />
        <QuickAction href="/sponsors/advertise" label="Upload Creative" />
      </section>
    </div>
  );
}

function VenueBoard({ byType, onPreview }: BoardProps) {
  const venueItems = byType.get('venue') ?? [];

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {venueItems.length > 0 ? (
        <BroadcastQueueWall items={venueItems} onPreview={onPreview} />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          <Panel title="No Venue Rooms Live">No venue room is currently active.</Panel>
          <BroadcastOpportunityFeed />
        </div>
      )}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8 }}>
        <QuickAction href="/tickets" label="Ticketing" />
        <QuickAction href="/seating" label="Seating" />
        <QuickAction href="/dashboard" label="Staff Controls" />
        <QuickAction href="/bookings" label="Booking Opportunities" />
      </section>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      style={{
        textDecoration: 'none',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(255,255,255,0.05)',
        color: '#f4f1ff',
        padding: '10px 12px',
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label} →
    </a>
  );
}

export default LobbyWallWorkspace;
