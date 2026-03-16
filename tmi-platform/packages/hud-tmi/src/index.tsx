import React from "react";
import { registerHudModule } from "@tmi/hud-runtime";

registerHudModule({
  id: "tmi",
  title: "TMI HUD",
  render: () => (
    <div style={{ padding: 12 }}>
      <h2 style={{ fontWeight: 700, margin: 0 }}>TMI HUD</h2>
      <p style={{ marginTop: 8 }}>HUD is live. Next: wire runtime + data.</p>
    </div>
  ),
});

registerHudModule({
  id: "system-health",
  title: "System Health",
  render: () => (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: 0 }}>System Health</h3>
      <ul style={{ marginTop: 8 }}>
        <li>CPU: 12%</li>
        <li>Memory: 6.2 GB</li>
        <li>DB: OK</li>
      </ul>
    </div>
  ),
});

registerHudModule({
  id: "deploy-status",
  title: "Deploy Status",
  render: () => (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: 0 }}>Deploy Status</h3>
      <p style={{ marginTop: 8 }}>Last deploy: 5 minutes ago — success</p>
    </div>
  ),
});

export {};
