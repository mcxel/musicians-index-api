"use client";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import HomeNavigator from "@/components/home/HomeNavigator";
import LiveWorldScreen from "@/components/home/LiveWorldScreen";

export default function Home3Page() {
  return (
    <PageShell>
      <HUDFrame>
        <HomeNavigator />
        <LiveWorldScreen />
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
