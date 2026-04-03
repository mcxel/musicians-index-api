"use client";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import HomeNavigator from "@/components/home/HomeNavigator";
import HeroBanner from "@/components/home/HeroBanner";
import WeeklyCrownBelt from "@/components/home/WeeklyCrownBelt";
import HomepageCanvas from "@/components/home/HomepageCanvas";
import BotConsole from "@/components/bots/BotConsole";

export default function Home2Page() {
  return (
    <PageShell>
      <HUDFrame>
        <HomeNavigator />
        <HeroBanner />
        <WeeklyCrownBelt />
        <HomepageCanvas />
        <div style={{ padding: "0 24px" }}><BotConsole surface="home2" /></div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
