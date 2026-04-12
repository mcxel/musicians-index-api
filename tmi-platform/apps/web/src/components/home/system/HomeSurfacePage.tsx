"use client";

import { useEffect, useState } from 'react';
import BotConsole from '@/components/bots/BotConsole';
import FooterHUD from '@/components/hud/FooterHUD';
import HUDFrame from '@/components/hud/HUDFrame';
import HomeNavigator from '@/components/home/HomeNavigator';
import PageShell from '@/components/layout/PageShell';
import {
  applyHomepageBeltConfig,
  applyHomepageSettings,
  getHomeSurface,
} from './BeltRegistry';
import { applyAutomationToSurface } from '@/lib/homepageAdmin/automation';
import {
  clearHomepageRuntimeOverrides,
  setHomepageRuntimeOverrides,
} from '@/lib/homepageAdmin/runtimeOverrides';
import HomeDraggableBelts from './HomeDraggableBelts';
import CardCanvas from '@/components/home/pdf/CardCanvas';
import MotionWrapper from '@/components/home/pdf/MotionWrapper';
import StatusRibbon from '@/components/home/pdf/StatusRibbon';
import JuliusPanel from '@/components/home/pdf/JuliusPanel';
import type { HomeSurfaceDefinition, HomeSurfaceId } from './types';
import type {
  HomepageAdminSettings,
  HomepageBeltConfig,
  HomepageScheduleItem,
} from '@/lib/homepageAdmin/types';

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isLiveScheduleActive(item: HomepageScheduleItem, now: Date): boolean {
  if (!item.enabled) return false;
  if ((item.publishState ?? 'live') !== 'live') return false;
  const start = parseDate(item.startDate);
  const end = parseDate(item.endDate);
  if (!start || !end) return false;
  return now >= start && now <= end;
}

export default function HomeSurfacePage({ surfaceId }: Readonly<{ surfaceId: HomeSurfaceId }>) {
  const [surface, setSurface] = useState<HomeSurfaceDefinition>(() => getHomeSurface(surfaceId));

  useEffect(() => {
    let cancelled = false;

    async function loadRuntimeConfig() {
      const baseSurface = getHomeSurface(surfaceId);
      try {
        const [beltsRes, settingsRes, scheduleRes] = await Promise.all([
          fetch('/api/admin/homepage/belts', { cache: 'no-store' }),
          fetch('/api/admin/homepage/settings', { cache: 'no-store' }),
          fetch('/api/admin/homepage/schedule', { cache: 'no-store' }),
        ]);

        const beltConfig = beltsRes.ok
          ? ((await beltsRes.json()) as HomepageBeltConfig[])
          : [];
        const settings = settingsRes.ok
          ? ((await settingsRes.json()) as HomepageAdminSettings)
          : null;
        const schedule = scheduleRes.ok
          ? ((await scheduleRes.json()) as HomepageScheduleItem[])
          : [];

        const previewNow = settings?.previewAt ? new Date(settings.previewAt) : new Date();
        const runtimeNow = Number.isNaN(previewNow.getTime()) ? new Date() : previewNow;

        const surfaceHasActiveLiveSchedule = schedule.some((item) => item.surfaceId === surfaceId && isLiveScheduleActive(item, runtimeNow));

        if (settings?.automation?.enabled && !surfaceHasActiveLiveSchedule) {
          const automation = await applyAutomationToSurface(settings);
          setHomepageRuntimeOverrides(automation.overrides);

          if (settings.automation.logResolutions && automation.summary.length > 0) {
            void fetch('/api/admin/homepage/audit', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                action: 'automation-resolution',
                details: automation.summary.join(', '),
              }),
            });
          }
        } else {
          clearHomepageRuntimeOverrides();
        }

        const withBelts = applyHomepageBeltConfig(baseSurface, beltConfig, schedule, runtimeNow);
        const nextSurface = applyHomepageSettings(withBelts, settings, schedule, runtimeNow);
        if (!cancelled) {
          setSurface(nextSurface);
        }
      } catch {
        if (!cancelled) {
          setSurface(baseSurface);
        }
      }
    }

    setSurface(getHomeSurface(surfaceId));
    void loadRuntimeConfig();

    return () => {
      cancelled = true;
      clearHomepageRuntimeOverrides();
    };
  }, [surfaceId]);

  return (
    <PageShell>
      <HUDFrame>
        <HomeNavigator />
        <main
          data-home-scene={surface.sceneId}
          data-home-audio-theme={surface.audioTheme ?? ''}
          data-home-animation-preset={surface.animationPreset ?? ''}
          style={{
            minHeight: '100vh',
            background: surface.background,
            padding: '12px 24px 24px',
          }}
        >
          <MotionWrapper>
            <div style={{ marginBottom: 12 }}>
              <StatusRibbon label={`Home ${surface.id} • ${surface.sceneId}`} live={surface.id === 3} />
            </div>
          </MotionWrapper>
          <CardCanvas>
            <HomeDraggableBelts
              surfaceId={surface.id}
              belts={surface.belts}
              layoutOrder={surface.layoutOrder}
            />
            {surface.id === 5 ? (
              <div style={{ marginTop: 14 }}>
                <JuliusPanel />
              </div>
            ) : null}
          </CardCanvas>
          <div style={{ paddingTop: 20 }}>
            <BotConsole surface={`home${surfaceId}`} />
          </div>
        </main>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}