"use client";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import HomeNavigator from "@/components/home/HomeNavigator";
import LiveWorldScreen from "@/components/home/LiveWorldScreen";
import BotConsole from "@/components/bots/BotConsole";

export default function Home3Page() {
  return (
    <PageShell>
      <HUDFrame>
        <HomeNavigator />
        <LiveWorldScreen />
        <div style={{ padding: "0 24px" }}><BotConsole surface="home3" /></div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
