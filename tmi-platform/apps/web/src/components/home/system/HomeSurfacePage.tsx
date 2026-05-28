"use client";

import { useEffect, useState } from 'react';
import BotConsole from '@/components/bots/BotConsole';
import FooterHUD from '@/components/hud/FooterHUD';
import HUDFrame from '@/components/hud/HUDFrame';
import HomeNavigator from '@/components/home/HomeNavigator';
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
import MotionWrapper from '@/components/home/pdf/MotionWrapper';
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
        const meRes = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
        const meData = meRes.ok
          ? (await meRes.json().catch(() => ({}))) as { authenticated?: boolean; user?: { role?: string } }
          : { authenticated: false };
        const role = (meData?.user?.role ?? '').toUpperCase();
        const isAdminViewer = Boolean(meData?.authenticated) && (role === 'ADMIN' || role === 'STAFF');

        if (!isAdminViewer) {
          if (!cancelled) {
            setSurface(baseSurface);
          }
          return;
        }

        const [beltsRes, settingsRes, scheduleRes] = await Promise.all([
          fetch('/api/admin/homepage/belts', { cache: 'no-store' }),
          fetch('/api/admin/homepage/settings', { cache: 'no-store' }),
          fetch('/api/admin/homepage/schedule', { cache: 'no-store' }),
        ]);

        // Non-admin/stale sessions can still fail here, keep base surface.
        if (beltsRes.status === 401 || beltsRes.status === 403) return;

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

  // Surface 1 (magazine cover) is full-bleed — no PageShell padding/max-width
  if (surface.id === 1) {
    return (
      <HUDFrame>
        <HomeNavigator />
        <main
          data-home-scene={surface.sceneId}
          data-home-audio-theme={surface.audioTheme ?? ''}
          data-home-animation-preset={surface.animationPreset ?? ''}
          style={{ minHeight: '100vh', background: surface.background }}
        >
          <HomeDraggableBelts
            surfaceId={surface.id}
            belts={surface.belts}
            layoutOrder={surface.layoutOrder}
          />
          <div style={{ paddingTop: 20 }}>
            <BotConsole surface={`home${surfaceId}`} />
          </div>
        </main>
        <FooterHUD />
      </HUDFrame>
    );
  }

  // Surfaces 2-5: full-bleed cinematic — no card borders, no grid, no dev labels
  return (
    <HUDFrame>
      <HomeNavigator />
      <main
        data-home-scene={surface.sceneId}
        data-home-audio-theme={surface.audioTheme ?? ''}
        data-home-animation-preset={surface.animationPreset ?? ''}
        style={{
          minHeight: '100vh',
          background: surface.background,
        }}
      >
        <MotionWrapper>
          <HomeDraggableBelts
            surfaceId={surface.id}
            belts={surface.belts}
            layoutOrder={surface.layoutOrder}
          />
        </MotionWrapper>
        <div style={{ paddingTop: 20 }}>
          <BotConsole surface={`home${surfaceId}`} />
        </div>
      </main>
      <FooterHUD />
    </HUDFrame>
  );
}