'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';

interface MediaJob {
  id: string;
  type: string;
  prompt: string;
  directedBy: string;
  status: string;
  generatedUrl?: string;
  createdAt: number;
  botGeneratedInternalFlag: boolean;
}

export default function VisualQueuePage() {
  const [queue, setQueue] = useState<MediaJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/media/queue');
      const data = await res.json();
      setQueue(data.queue || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (jobId: string, action: 'APPROVE' | 'REJECT') => {
    setQueue(prev => prev.filter(job => job.id !== jobId));
    try {
      await fetch('/api/media/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action })
      });
    } catch (err) {
      console.error('Failed to process action');
    }
  };

  return (
    <AdminShell
      hubId="visual-queue"
      hubTitle="Media Approval Queue"
      hubSubtitle="Review & Publish Bot-Generated Assets"
      backHref="/admin"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(0,255,255,0.2)', paddingBottom: 20, marginBottom: 30 }}>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '0.2em', color: '#00FFFF', fontWeight: 900 }}>TMI MEDIA PIPELINE</p>
          <h1 style={{ margin: 0, fontSize: 32, fontFamily: 'var(--font-orbitron, Impact)' }}>VISUAL <span style={{ color: '#FF2DAA' }}>APPROVAL QUEUE</span></h1>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Pending Approval: <strong style={{ color: '#fff' }}>{queue.length}</strong></div>
      </div>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Scanning media queue...</p>
      ) : queue.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Queue is clear</h2>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Bots have not generated any new unapproved media.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {queue.map(job => (
            <div key={job.id} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,45,170,0.3)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 220, background: '#111', position: 'relative' }}>
                {job.generatedUrl ? (
                  <img src={job.generatedUrl} alt={job.type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Generating...</div>
                )}
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: 4, fontSize: 9, fontWeight: 900, color: '#00FFFF', letterSpacing: '0.1em' }}>{job.type}</div>
                {job.botGeneratedInternalFlag && <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,45,170,0.8)', padding: '4px 8px', borderRadius: 4, fontSize: 9, fontWeight: 900, color: '#fff' }}>BOT DIR.</div>}
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p style={{ margin: '0 0 16px', fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, flex: 1 }}><strong>Prompt:</strong> {job.prompt}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleAction(job.id, 'APPROVE')} style={{ flex: 1, background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.4)', color: '#00FF88', padding: '8px', borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>APPROVE</button>
                  <button onClick={() => handleAction(job.id, 'REJECT')} style={{ flex: 1, background: 'rgba(255,45,170,0.1)', border: '1px solid rgba(255,45,170,0.4)', color: '#FF2DAA', padding: '8px', borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>REJECT</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}