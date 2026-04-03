"use client";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import HomeNavigator from "@/components/home/HomeNavigator";
import MagazineCoverScreen from "@/components/home/MagazineCoverScreen";
import BotConsole from "@/components/bots/BotConsole";

export default function Home1Page() {
  return (
    <PageShell>
      <HUDFrame>
        <HomeNavigator />
        <MagazineCoverScreen />
        <div style={{ padding: "0 24px" }}><BotConsole surface="home1" /></div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
