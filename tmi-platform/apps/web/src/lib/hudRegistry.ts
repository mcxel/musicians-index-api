import { registerHudModule } from "@tmi/hud-runtime";
import { TmiHud, SystemHealth, DeployStatus, Refunds } from "../components/tmi/hud";

registerHudModule({
  id: "tmi",
  title: "TMI HUD",
  render: TmiHud,
});

registerHudModule({
  id: "system-health",
  title: "System Health",
  render: SystemHealth,
});

registerHudModule({
  id: "deploy-status",
  title: "Deploy Status",
  render: DeployStatus,
});

registerHudModule({
  id: "refunds",
  title: "Refunds",
  render: Refunds,
});
