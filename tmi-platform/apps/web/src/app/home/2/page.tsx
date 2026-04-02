"use client";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import HomeNavigator from "@/components/home/HomeNavigator";
import HeroBanner from "@/components/home/HeroBanner";
import WeeklyCrownBelt from "@/components/home/WeeklyCrownBelt";
import HomepageCanvas from "@/components/home/HomepageCanvas";

export default function Home2Page() {
  return (
    <PageShell>
      <HUDFrame>
        <HomeNavigator />
        <HeroBanner />
        <WeeklyCrownBelt />
        <HomepageCanvas />
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
