'use client';

import { WorldHubCard } from '@/components/home/world-hub';
import { HudWorldSwitcher } from '@/components/hud/world-switcher';
import { LoaderSkeleton } from '@/components/ui/states/loader-skeleton';
import { useWorldData } from '@/hooks/use-world-data';

export default function World5Page() {
  const { world, isLoading } = useWorldData('world-5');

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black px-4 py-10 text-zinc-100 md:px-8">
        <LoaderSkeleton count={4} height="h-24" />
      </main>
    );
  }

  const worldName = world?.name ?? 'Command World';
  const worldDescription = world?.description ?? 'Global platform pulse and controls.';

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-zinc-100 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <HudWorldSwitcher activeWorldId="world-5" />

        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Home World 5</p>
          <h1 className="text-3xl font-bold md:text-4xl">{worldName}</h1>
          <p className="text-zinc-400">{worldDescription}</p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <WorldHubCard title="Active Rooms" value="128" description="Real-time synced rooms" />
          <WorldHubCard title="Live Missions" value="24" description="Daily and sponsor missions" />
          <WorldHubCard title="Trending Creators" value="56" description="Discovery velocity spikes" />
          <WorldHubCard title="System Pulse" value="Healthy" description="All services operational" />
        </section>
      </div>
    </main>
  );
}
