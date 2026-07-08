"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface LiveFeed {
  id: string;
  slug: string;
  title: string;
  performerName: string;
  viewerCount: number;
  thumbnailUrl: string;
}

export default function AdminLiveFeedExplorer() {
  const [feeds, setFeeds] = useState<LiveFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        // TODO: This endpoint needs to be created and backed by the GlobalLiveSessionRegistry.
        const res = await fetch('/api/admin/observatory/feeds');
        if (!res.ok) throw new Error('Failed to fetch live feeds');
        const data = await res.json();
        setFeeds(data.feeds);
        setError(null);
      } catch (e) {
        setError('Unable to load feeds');
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
    const interval = setInterval(fetchFeeds, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-slate-400">Loading Live Feeds...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (feeds.length === 0) return <div className="text-slate-500">No active live rooms.</div>;

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">Live Feed Explorer</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* This section will be populated by the live feed data */}
      </div>
    </div>
  );
}