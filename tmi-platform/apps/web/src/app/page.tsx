"use client";

import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import PageSwitcher from "@/components/hud/PageSwitcher";
import HeroBanner from "@/components/home/HeroBanner";
import WeeklyCrownBelt from "@/components/home/WeeklyCrownBelt";
import HomepageCanvas from "@/components/home/HomepageCanvas";

export default function Home1Page() {
  return (
    <PageShell>
      <HUDFrame>
        <HeroBanner />
        <WeeklyCrownBelt />
        <HomepageCanvas />
        <PageSwitcher />
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
