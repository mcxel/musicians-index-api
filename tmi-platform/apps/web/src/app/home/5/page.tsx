'use client';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import HomeNavigator from '@/components/home/HomeNavigator';
import ChartsStoreScreen from '@/components/home/ChartsStoreScreen';

export default function Home5ChartsStorePage() {
  return (
    <PageShell>
      <HUDFrame>
        <HomeNavigator />
        <ChartsStoreScreen />
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
