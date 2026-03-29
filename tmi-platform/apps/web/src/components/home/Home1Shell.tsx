"use client";
import PageShell from "../layout/PageShell";
import HUDFrame from "../hud/HUDFrame";
import FooterHUD from "../hud/FooterHUD";
import PageSwitcher from "../hud/PageSwitcher";

export default function Home1Shell() {
  return (
    <PageShell>
      <HUDFrame>
        <div>HOME 1</div>
        <PageSwitcher />
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
