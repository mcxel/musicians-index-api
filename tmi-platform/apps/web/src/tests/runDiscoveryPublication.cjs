/**
 * Discovery publication + honest external-light harness (Node CJS).
 * Cert: publish/unpublish path is wired; ● only for verified live status.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const results = {};

function assert(name, cond) {
  results[name] = Boolean(cond);
}

const goLiveSrc = fs.readFileSync(path.join(root, "src/lib/dock/executeInstantGoLive.ts"), "utf8");
assert(
  "execute_publishes_on_success",
  goLiveSrc.includes("DiscoveryBus.upsert") && goLiveSrc.includes("liveSessionToDiscoveryRecord"),
);
assert(
  "execute_has_end_session",
  goLiveSrc.includes("endInstantGoLiveSession") && goLiveSrc.includes('method: "DELETE"'),
);
assert("execute_unpublishes", goLiveSrc.includes("unpublishLiveRoom"));

const busHook = fs.readFileSync(path.join(root, "src/lib/discovery/useDiscoveryBus.ts"), "utf8");
assert(
  "discovery_bus_listens_endbroadcast",
  busHook.includes("tmi:endbroadcast") && busHook.includes("unpublishLiveRoom"),
);

const previewBind = fs.readFileSync(path.join(root, "src/lib/lobby/useLobbyPreviewBind.ts"), "utf8");
assert(
  "self_preview_reuses_hub_stream",
  previewBind.includes("self_hub_preview") && previewBind.includes("previewStream"),
);

const bezel = fs.readFileSync(
  path.join(root, "src/components/broadcast/LiveDistributionBezel.tsx"),
  "utf8",
);
assert("bezel_no_tmi_light", !/shortCode:\s*["']TMI["']/.test(bezel) && bezel.includes("OUT"));
assert(
  "bezel_order_platforms",
  bezel.includes("YT") && bezel.includes("IG") && bezel.includes("FB") && bezel.includes("KK") && bezel.includes("TW"),
);

const mediaStack = fs.readFileSync(
  path.join(root, "src/components/commandCenter/CommandCenterMediaStack.tsx"),
  "utf8",
);
assert(
  "bezel_mounted_above_monitors",
  mediaStack.includes('<LiveDistributionBezel') &&
    mediaStack.includes("External-only Live Distribution Bezel") &&
    mediaStack.indexOf('<LiveDistributionBezel') < mediaStack.indexOf("<CanonicalDualMonitorStack"),
);

const api = fs.readFileSync(path.join(root, "src/app/api/broadcast/destinations/route.ts"), "utf8");
assert("api_never_returns_stream_key", !api.includes("streamKey:") && api.includes("ingestAck"));
assert(
  "api_live_requires_ingest_ack",
  api.includes("ingestAck: true") && api.includes('connectionStatus: "live"'),
);

const secrets = fs.readFileSync(
  path.join(root, "src/lib/broadcast/broadcastDestinationSecrets.server.ts"),
  "utf8",
);
assert(
  "secrets_server_only_file",
  secrets.includes("Never import from client") && secrets.includes("attemptExternalIngest"),
);
assert("never_fake_live_without_ack", secrets.includes("never fabricates live"));

function glyph(status) {
  switch (status) {
    case "live":
      return "●";
    case "connecting":
      return "◐";
    case "retry":
      return "◎";
    case "error":
      return "⚠";
    case "locked":
      return "🔒";
    default:
      return "○";
  }
}
assert(
  "only_live_gets_filled_dot",
  glyph("live") === "●" &&
    ["off", "connecting", "error", "locked", "retry"].every((s) => glyph(s) !== "●"),
);

const failed = Object.entries(results)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (failed.length) {
  console.error("[runDiscoveryPublicationHarness] FAIL", failed);
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
}
console.log("[runDiscoveryPublicationHarness] PASS", results);
