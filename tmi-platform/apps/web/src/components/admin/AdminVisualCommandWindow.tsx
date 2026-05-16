'use client';

import { getCreativeProductionHealthSnapshot } from '@/lib/ai-visuals/CreativeProductionHealthEngine';
import { listVisualDestinations } from '@/lib/ai-visuals/VisualDestinationMapEngine';
import { listQualityReports } from '@/lib/ai-visuals/VisualQualityAuthorityEngine';
import { getVisualQueueDiagnosticsSnapshot } from '@/lib/ai-visuals/VisualQueueDiagnosticsEngine';
import { executeVisualRetryCycle } from '@/lib/ai-visuals/VisualRetryEscalationEngine';
import { getWorkerRoster } from '@/lib/ai-visuals/VisualWorkerControlEngine';
import { listVisualSlots } from '@/lib/visuals/TmiVisualSlotRegistry';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

function formatId(value: string | null | undefined): string {
  if (!value) return 'n/a';
  return value.length > 24 ? `${value.slice(0, 24)}...` : value;
}

function Badge({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        padding: '3px 8px',
        fontSize: 10,
        fontWeight: 700,
        color: tone,
        background: `${tone}18`,
        border: `1px solid ${tone}30`,
      }}
    >
      {children}
    </span>
  );
}

export default function AdminVisualCommandWindow() {
  const [tick, setTick] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const snapshot = useMemo(() => {
    void tick;
    const diagnostics = getVisualQueueDiagnosticsSnapshot();
    const health = getCreativeProductionHealthSnapshot();
    const destinations = listVisualDestinations();
    const slots = listVisualSlots();
    const quality = listQualityReports();
    const workerRoster = getWorkerRoster(diagnostics.workerTasks);
    const failedJobs = diagnostics.jobs.filter(
      (job) => job.status === 'failed' || job.status === 'stalled'
    );
    return { diagnostics, health, destinations, slots, quality, workerRoster, failedJobs };
  }, [tick]);

  const latestJob = snapshot.diagnostics.jobs[0] ?? null;
  const latestDeployment = snapshot.diagnostics.deployments[0] ?? null;

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, rgba(0,255,255,0.08), transparent 28%), #050510',
        color: '#fff',
        padding: 18,
      }}
    >
      <div style={{ maxWidth: 1500, margin: '0 auto', display: 'grid', gap: 14 }}>
        <header
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 16,
            background: 'rgba(0,0,0,0.35)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '0.34em',
                  textTransform: 'uppercase',
                  color: '#00FFFF',
                  fontWeight: 800,
                }}
              >
                Admin Visual Command Window
              </div>
              <h1 style={{ margin: '6px 0 0', fontSize: 30 }}>Live Creative Ops Console</h1>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                No hidden visual work. Queue, deploy, convert, and replace from a glass-window admin
                surface.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link
                href="/admin/visual-coverage"
                style={{ color: '#00FFFF', textDecoration: 'none', fontSize: 11 }}
              >
                Coverage
              </Link>
              <Link
                href="/admin/visual-production"
                style={{ color: '#FFD700', textDecoration: 'none', fontSize: 11 }}
              >
                Production
              </Link>
              <Link
                href="/admin/visual-workers"
                style={{ color: '#FF2DAA', textDecoration: 'none', fontSize: 11 }}
              >
                Workers
              </Link>
              <Link
                href="/admin/visual-quality"
                style={{ color: '#AA2DFF', textDecoration: 'none', fontSize: 11 }}
              >
                Quality
              </Link>
              <Link
                href="/admin/visual-slots"
                style={{ color: '#00FF88', textDecoration: 'none', fontSize: 11 }}
              >
                Slots
              </Link>
              <Link
                href="/admin/visual-command/failures"
                style={{ color: '#FF2DAA', textDecoration: 'none', fontSize: 11 }}
              >
                Failures
              </Link>
              <Link
                href="/admin/visual-command/retries"
                style={{ color: '#00FFFF', textDecoration: 'none', fontSize: 11 }}
              >
                Retries
              </Link>
              <Link
                href="/admin/visual-command/destinations"
                style={{ color: '#FFD700', textDecoration: 'none', fontSize: 11 }}
              >
                Destinations
              </Link>
              <Link
                href="/admin/visual-command/workers"
                style={{ color: '#AA2DFF', textDecoration: 'none', fontSize: 11 }}
              >
                Worker Health
              </Link>
              <Link
                href="/admin/visual-command/deployments"
                style={{ color: '#00FF88', textDecoration: 'none', fontSize: 11 }}
              >
                Deployments
              </Link>
            </div>
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
            gap: 10,
          }}
        >
          {[
            ['Queued', snapshot.diagnostics.summary.queued, '#FFD700'],
            ['Active', snapshot.diagnostics.summary.active, '#00FFFF'],
            ['Failed', snapshot.diagnostics.summary.failed, '#FF2DAA'],
            ['Completed', snapshot.diagnostics.summary.completed, '#00FF88'],
            ['Coverage', `${snapshot.health.coveragePercent}%`, '#FFFFFF'],
            ['Motion Ready', `${snapshot.health.motionReadyPercent}%`, '#AA2DFF'],
            ['Placeholder Leaks', snapshot.health.placeholderLeaks, '#FF9500'],
          ].map(([label, value, tone]) => (
            <div
              key={label as string}
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: 14,
                background: 'rgba(0,0,0,0.28)',
              }}
            >
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.42)' }}>{label as string}</div>
              <div style={{ marginTop: 6, fontSize: 26, fontWeight: 800, color: tone as string }}>
                {value as React.ReactNode}
              </div>
            </div>
          ))}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              background: 'rgba(0,0,0,0.32)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: 14,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.24em',
                    color: '#00FFFF',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                  }}
                >
                  Queue List
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.48)', marginTop: 4 }}>
                  job id · route · slot · worker · status · priority
                </div>
              </div>
              <Badge tone="#00FF88">{snapshot.diagnostics.jobs.length} jobs</Badge>
            </div>
            <div style={{ maxHeight: 470, overflow: 'auto' }}>
              {snapshot.diagnostics.jobs.map((job) => (
                <div
                  key={job.jobId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: 10,
                    padding: 12,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    fontSize: 11,
                  }}
                >
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700 }}>{job.jobId}</div>
                    <div style={{ color: 'rgba(255,255,255,0.44)' }}>{job.assetType}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.72)' }}>{job.targetPage}</div>
                    <div style={{ color: 'rgba(255,255,255,0.44)' }}>{job.targetRoute}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.72)' }}>{job.targetSlot}</div>
                    <div style={{ color: 'rgba(255,255,255,0.44)' }}>{job.assignedWorker}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Badge
                        tone={
                          job.status === 'failed' || job.status === 'stalled'
                            ? '#FF2DAA'
                            : job.status === 'deployed'
                            ? '#00FF88'
                            : '#00FFFF'
                        }
                      >
                        {job.status}
                      </Badge>
                      <Badge tone="#FFD700">{job.priority}</Badge>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.44)', marginTop: 4 }}>
                      wait {job.timeWaiting} · run {job.timeRunning} · fails {job.failureCount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                background: 'rgba(0,0,0,0.32)',
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.24em',
                  color: '#FFD700',
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                Destination Map
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {snapshot.destinations.slice(0, 10).map((entry) => (
                  <div
                    key={entry.destinationId}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: 8,
                      fontSize: 11,
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{entry.label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.42)' }}>{entry.routePath}</div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.72)' }}>{entry.slotName}</div>
                      <div style={{ color: 'rgba(255,255,255,0.42)' }}>slot</div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.72)' }}>{entry.entityOwner}</div>
                      <div style={{ color: 'rgba(255,255,255,0.42)' }}>{entry.assetFamily}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                background: 'rgba(0,0,0,0.32)',
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.24em',
                  color: '#00FF88',
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                Latest Output Preview
              </div>
              <div style={{ display: 'grid', gap: 8, fontSize: 11 }}>
                <div>current image: {formatId(latestJob?.currentImage)}</div>
                <div>failed image: {formatId(latestJob?.failedImage)}</div>
                <div>replacement image: {formatId(latestJob?.replacementImage)}</div>
                <div>motion seed: {formatId(latestJob?.motionSeed)}</div>
                <div>
                  latest deployment:{' '}
                  {latestDeployment
                    ? `${latestDeployment.deploymentId} v${latestDeployment.version}`
                    : 'none'}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              background: 'rgba(0,0,0,0.32)',
              padding: 14,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.24em',
                color: '#FF2DAA',
                textTransform: 'uppercase',
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              Failures
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {snapshot.failedJobs.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>No failures.</div>
              ) : (
                snapshot.failedJobs.slice(0, 8).map((job) => (
                  <div
                    key={job.jobId}
                    style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      padding: 10,
                      background: 'rgba(255,45,170,0.08)',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{job.jobId}</div>
                    <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: 10 }}>
                      failed at {job.targetRoute} {'->'} {job.targetSlot}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.52)', fontSize: 10, marginTop: 4 }}>
                      reason: {job.failureReason ?? 'unknown'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              background: 'rgba(0,0,0,0.32)',
              padding: 14,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.24em',
                color: '#00FFFF',
                textTransform: 'uppercase',
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              Worker Bots
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {snapshot.workerRoster.slice(0, 8).map((worker) => (
                <div
                  key={worker.workerId}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: 10,
                    background: worker.paused ? 'rgba(255,45,170,0.08)' : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{worker.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 10 }}>
                        {worker.specialty}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 10 }}>
                      <div style={{ color: '#00FF88' }}>{worker.successRate}% success</div>
                      <div style={{ color: '#FF2DAA' }}>{worker.failureRate}% fail</div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'rgba(255,255,255,0.48)',
                      fontSize: 10,
                    }}
                  >
                    <span>task: {worker.activeTask ?? 'idle'}</span>
                    <span>queue load: {worker.queueLoad}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
            gap: 10,
          }}
        >
          {[
            ['retry failed', '#00FFFF'],
            ['open failures', '#FF2DAA'],
            ['open retries', '#FFD700'],
            ['open workers', '#AA2DFF'],
            ['open deployments', '#00FF88'],
          ].map(([label, tone]) => (
            <button
              key={label as string}
              type="button"
              onClick={() => {
                if (label === 'retry failed') {
                  executeVisualRetryCycle();
                  setTick((value) => value + 1);
                  return;
                }

                if (label === 'open failures') router.push('/admin/visual-command/failures');
                if (label === 'open retries') router.push('/admin/visual-command/retries');
                if (label === 'open workers') router.push('/admin/visual-command/workers');
                if (label === 'open deployments') router.push('/admin/visual-command/deployments');
              }}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: `1px solid ${tone as string}44`,
                color: tone as string,
                background: 'rgba(255,255,255,0.03)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: 10,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {label as string}
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}
