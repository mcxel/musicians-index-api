"use client";

import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import PageSwitcher from "@/components/hud/PageSwitcher";

export default function Home3Page() {
  return (
    <PageShell>
      <HUDFrame>
        <div>HOME 3</div>
        <PageSwitcher />
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
