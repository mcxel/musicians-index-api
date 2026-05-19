'use client';
import { useState, useCallback, useEffect } from 'react';
import type { MetricSnapshot, PlatformEvolutionState } from '@/types/evolution';

const INITIAL_STATE: PlatformEvolutionState = {
  generationCycle: 1,
  optimizedGenreFocus: 'Industrial Drill',
  topPerformingLayoutSlug: 'kreach-multimedia-shards',
  systemAlertsProcessed: 0,
};

export function usePlatformEvolution() {
  const [telemetryLogs, setTelemetryLogs] = useState<MetricSnapshot[]>([]);
  const [evolutionState, setEvolutionState] = useState<PlatformEvolutionState>(INITIAL_STATE);

  useEffect(() => {
    setTelemetryLogs([
      { slug: 'kreach-multimedia-shards', clicks: 420, averageSessionDurationMs: 142000, conversionProbability: 84 },
      { slug: 'phonk-audio-locker',       clicks: 180, averageSessionDurationMs: 64000,  conversionProbability: 32 },
    ]);
  }, []);

  const registerClickTelemetry = useCallback((slug: string, durationMs: number) => {
    setTelemetryLogs(prev => {
      const existing = prev.find(t => t.slug === slug);
      const updated = existing
        ? prev.map(t => t.slug === slug
            ? { ...t, clicks: t.clicks + 1, averageSessionDurationMs: Math.round((t.averageSessionDurationMs + durationMs) / 2) }
            : t)
        : [...prev, { slug, clicks: 1, averageSessionDurationMs: durationMs, conversionProbability: 50 }];

      const top = [...updated].sort((a, b) => b.clicks - a.clicks)[0];
      if (top && top.slug !== evolutionState.topPerformingLayoutSlug) {
        setEvolutionState(s => ({
          ...s,
          generationCycle: s.generationCycle + 1,
          topPerformingLayoutSlug: top.slug,
          optimizedGenreFocus: top.slug.includes('kreach') ? 'Industrial Drill' : 'Phonk',
        }));
      }
      return updated;
    });
  }, [evolutionState.topPerformingLayoutSlug]);

  return { telemetryLogs, evolutionState, registerClickTelemetry };
}
