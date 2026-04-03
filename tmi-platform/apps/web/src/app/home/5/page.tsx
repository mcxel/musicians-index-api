'use client';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import HomeNavigator from '@/components/home/HomeNavigator';
import ChartsStoreScreen from '@/components/home/ChartsStoreScreen';
import BotConsole from '@/components/bots/BotConsole';

export default function Home5ChartsStorePage() {
  return (
    <PageShell>
      <HUDFrame>
        <HomeNavigator />
        <ChartsStoreScreen />
        <div style={{ padding: '0 24px' }}><BotConsole surface="home5" /></div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
