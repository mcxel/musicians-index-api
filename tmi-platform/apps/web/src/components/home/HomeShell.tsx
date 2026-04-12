"use client";

import { useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import FooterHUD from '@/components/hud/FooterHUD';
import HUDFrame from '@/components/hud/HUDFrame';
import PageShell from '@/components/layout/PageShell';
import PageSwitcher from '@/components/home/PageSwitcher';
import HomePage1 from '@/components/home/page1/HomePage1';
import HomePage2 from '@/components/home/page2/HomePage2';
import HomePage3 from '@/components/home/page3/HomePage3';
import HomePage4 from '@/components/home/page4/HomePage4';
import HomePage5 from '@/components/home/page5/HomePage5';
import type { HomeSurfaceId } from '@/components/home/system/types';
import CinematicBackdrop from '@/components/home/engine/CinematicBackdrop';
import GenreSpotlightRotor from '@/components/home/engine/GenreSpotlightRotor';
import { useHomepageEngine } from '@/components/home/engine/useHomepageEngine';

function toSurfaceId(value: string | null): HomeSurfaceId {
  if (value === '2') return 2;
  if (value === '3') return 3;
  if (value === '4') return 4;
  if (value === '5') return 5;
  return 1;
}

export default function HomeShell() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activePage = toSurfaceId(searchParams.get('page'));

  const handlePageChange = useCallback(
    (page: HomeSurfaceId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(page));
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const engine = useHomepageEngine({
    activePage,
    onPageChange: handlePageChange,
  });

  const content = useMemo(() => {
    if (activePage === 2) return <HomePage2 />;
    if (activePage === 3) return <HomePage3 />;
    if (activePage === 4) return <HomePage4 />;
    if (activePage === 5) return <HomePage5 />;
    return <HomePage1 />;
  }, [activePage]);

  return (
    <PageShell>
      <HUDFrame>
        <main
          style={{
            minHeight: '100vh',
            padding: '12px 24px 24px',
            position: 'relative',
            overflow: 'hidden',
            scrollBehavior: 'smooth',
            scrollSnapType: 'y proximity',
            background:
              'radial-gradient(circle at top, rgba(78,130,255,0.12), transparent 28%), linear-gradient(180deg, #060a17 0%, #070f22 55%, #050910 100%)',
          }}
        >
          {engine.cinematicMode ? <CinematicBackdrop /> : null}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <PageSwitcher
              activePage={activePage}
              onChange={handlePageChange}
              autoplayPages={engine.autoplayPages}
              onToggleAutoplay={engine.toggleAutoplayPages}
              cinematicMode={engine.cinematicMode}
              layoutEditable={engine.layoutEditable}
            />
            <GenreSpotlightRotor
              spotlight={engine.spotlight}
              genres={engine.genres}
              dataSourceLabel={engine.dataSourceLabel}
              hiddenBotNames={engine.hiddenBotNames}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={`surface-${activePage}`}
                initial={{ opacity: 0, y: 22, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18, scale: 0.985 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
