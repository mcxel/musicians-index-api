import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Module from 'module';

console.log("=== TMI Admin Observatory Runtime Smoke Test ===");

// Patch require to mock the @/engines modules for the isolated smoke test
const originalRequire = (Module as any).prototype.require;
(Module as any).prototype.require = function (request: string) {
  if (request === '@/engines/world/RoomPopulationEngine') {
    return { useRoomPopulationEngine: () => ({ heat: 42, chatFlowRate: 150 }) };
  }
  if (request === '@/engines/world/CrowdIntentEngine') {
    return { useCrowdIntentEngine: () => ({ distribution: { hype: 60, chill: 30, toxic: 10 }, safetyEventsCount: 2 }) };
  }
  if (request === '@/engines/world/CameraFocusReactionEngine') {
    return { useCameraFocusReactionEngine: () => ({ currentFocusState: "CROWD_REACTION", reactionBurstsCount: 15 }) };
  }
  if (request === '@/engines/world/BillboardPreviewHoverEngine') {
    return { useBillboardPreviewHoverEngine: () => ({ hoverActivityCount: 105 }) };
  }
  if (request === '@/engines/world/SponsorGiftCommerceEngine') {
    return { useSponsorGiftCommerceEngine: () => ({ giftEventsCount: 22 }) };
  }
  return originalRequire.apply(this, arguments);
};

try {
  console.log("1. Importing component...");
  const AdminObservatoryChat = require('../app/admin/observatory/chat/page').default;
  
  console.log("2. Rendering component & verifying hook hydration...");
  const element = React.createElement(AdminObservatoryChat);
  const html = renderToString(element);

  console.log("3. Verifying mount & no exception...");
  if (!html || !html.includes("ADMIN OBSERVATORY")) {
     throw new Error("Component did not mount correctly (missing header).");
  }
  
  // Verify hook hydration (Checking if our mocked values flowed into the HTML)
  if (!html.includes("42°C") || !html.includes("150 msg/s") || !html.includes("CROWD_REACTION")) {
     throw new Error("Hook hydration failed. Engine data not found in render.");
  }

  console.log("🟢 PASS: Observatory Component mounted, hooks hydrated, no exceptions thrown.");
  process.exit(0);

} catch (error) {
  console.error("🔴 FAIL: Runtime Exception during mount.", error);
  process.exit(1);
}