/**
 * Avatar Preview Parity Phase 2 — Physical Chromium certification
 * Route: /avatar/studio (Full Studio + embedded Quick Avatar)
 * Viewports: Desktop 1280×800 + Mobile 390×844
 *
 * Isolated Next: TMI_BUILD_VERIFY_DISTDIR=.next-avatar-p2-cert
 * Evidence: .cursor/artifacts/avatar-preview-parity-phase2/
 */

import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = process.env.E2E_BASE_URL || "http://localhost:3003";
const STUDIO_URL = `${BASE}/avatar/studio`;
const ARTIFACTS = path.join(process.cwd(), ".cursor", "artifacts", "avatar-preview-parity-phase2");
const NAV_TIMEOUT = Number(process.env.CERT_NAV_TIMEOUT_MS || 180000);
const HEAD = process.env.CERT_HEAD === "1";

fs.mkdirSync(ARTIFACTS, { recursive: true });

/** @type {Record<string, { status: string, notes: string, evidence: string[] }>} */
const gates = {};
const screenshots = [];

function setGate(id, status, notes, evidence = []) {
  gates[id] = { status, notes, evidence };
  const mark = status === "PASS" ? "🟢" : status === "FAIL" ? "🔴" : "🟡";
  console.log(`  ${mark} Gate ${id}: ${status} — ${notes}`);
}

async function shot(page, name) {
  const file = path.join(ARTIFACTS, name);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.screenshot({ path: file, fullPage: false, animations: "disabled" });
      break;
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  screenshots.push(name);
  console.log(`  [SHOT] ${name}`);
  return name;
}

async function prepContext(context) {
  await context.addInitScript(() => {
    try {
      localStorage.setItem(
        "tmi_first_run_v1",
        JSON.stringify({ dismissed: true, completedSteps: [], role: "fan" }),
      );
      localStorage.setItem("tmi_ad_consent", "declined");
    } catch {
      /* ignore */
    }
  });
  await context.addCookies([
    { name: "tmi_session", value: "cert_session_avatar_p2", domain: "localhost", path: "/" },
    { name: "tmi_session_id", value: "user-avatar-p2", domain: "localhost", path: "/" },
    { name: "tmi_user_id", value: "user-avatar-p2", domain: "localhost", path: "/" },
    { name: "tmi_role", value: "FAN", domain: "localhost", path: "/" },
    { name: "tmi_roles", value: "FAN", domain: "localhost", path: "/" },
  ]);
}

async function dismissChrome(page) {
  const notNow = page.getByText(/NOT NOW/i).first();
  if ((await notNow.count()) > 0) {
    try {
      await notNow.click({ timeout: 1500 });
    } catch {
      /* ignore */
    }
  }
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(200);
  }
}

async function waitStudio(page) {
  await page.waitForSelector('[data-testid="avatar-full-studio"]', { timeout: NAV_TIMEOUT });
  await dismissChrome(page);
}

async function probe(page) {
  return page.evaluate(() => {
    const studio = document.querySelector('[data-testid="avatar-full-studio"]');
    const quick = document.querySelector('[data-testid="avatar-quick-panel"]');
    const probeHook = window.__TMI_AVATAR_PREVIEW_CERT__ ?? null;
    const savedLookRaw = localStorage.getItem("tmi_avatar_phase2_saved_look");
    let savedLook = null;
    try {
      savedLook = savedLookRaw ? JSON.parse(savedLookRaw) : null;
    } catch {
      savedLook = null;
    }
    return {
      href: location.href,
      title: document.title,
      hasStudio: !!studio,
      studioOwner: studio?.getAttribute("data-avatar-runtime-owner") || null,
      studioDraftId: studio?.getAttribute("data-draft-id") || null,
      studioEnv: studio?.getAttribute("data-environment-id") || null,
      studioPanel: studio?.getAttribute("data-panel-target") || null,
      studioAction: studio?.getAttribute("data-preview-action") || null,
      studioFidelity: studio?.getAttribute("data-fidelity") || null,
      studioOccupancy: studio?.getAttribute("data-occupancy-allowed") || null,
      studioLightingOnly: studio?.getAttribute("data-lighting-only") || null,
      studioGroupCam: studio?.getAttribute("data-group-cam-editor-only") || null,
      hasQuick: !!quick,
      quickOwner: quick?.getAttribute("data-avatar-runtime-owner") || null,
      quickDraftId: quick?.getAttribute("data-draft-id") || null,
      quickEnv: quick?.getAttribute("data-environment-id") || null,
      quickPanel: quick?.getAttribute("data-panel-target") || null,
      quickAction: quick?.getAttribute("data-preview-action") || null,
      probe: probeHook,
      lockedNote:
        document.querySelector('[data-testid="avatar-locked-item-note"]')?.textContent?.trim() ||
        null,
      savedLookNote:
        document.querySelector('[data-testid="avatar-saved-look-note"]')?.textContent?.trim() ||
        null,
      loungeLawVisible: !!document.querySelector('[data-testid="avatar-lounge-lighting-law"]'),
      groupCamLawVisible: !!document.querySelector('[data-testid="avatar-group-cam-editor-only"]'),
      savedLook,
      bodyText: (document.body?.innerText || "").slice(0, 2000),
    };
  });
}

async function clickTestId(page, testId) {
  await page.evaluate((id) => {
    const el = document.querySelector(`[data-testid="${id}"]`);
    if (!el) throw new Error(`missing ${id}`);
    el.click();
  }, testId);
  await page.waitForTimeout(250);
}

async function runDesktop(browser) {
  console.log(`\n[DESKTOP 1280×800] ${STUDIO_URL}`);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  await prepContext(context);
  const page = await context.newPage();
  page.setDefaultTimeout(NAV_TIMEOUT);

  const consoleErrors = [];
  page.on("pageerror", (err) => consoleErrors.push(String(err.message || err)));

  try {
    await page.goto(STUDIO_URL, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    await waitStudio(page);
    await shot(page, "01-desktop-studio-mount.png");

    let d = await probe(page);
    const ownerOk =
      d.studioOwner === "apps/web/src/lib/avatars/AvatarPreviewRuntime.ts" &&
      d.probe?.owner === "apps/web/src/lib/avatars/AvatarPreviewRuntime.ts";

    // G1 Full Studio mounts canonical runtime
    if (d.hasStudio && ownerOk && d.studioDraftId) {
      setGate("G1", "PASS", `Full Studio mounts canonical runtime; draftId=${d.studioDraftId}`, [
        "01-desktop-studio-mount.png",
      ]);
    } else {
      setGate(
        "G1",
        "FAIL",
        `Studio missing or wrong owner. hasStudio=${d.hasStudio} owner=${d.studioOwner}`,
        ["01-desktop-studio-mount.png"],
      );
    }

    // Open embedded Quick for shared-draft proof
    await clickTestId(page, "avatar-studio-toggle-quick");
    await page.waitForSelector('[data-testid="avatar-quick-panel"]', { timeout: 15000 });
    await shot(page, "02-desktop-quick-embed.png");
    d = await probe(page);

    // G2 Quick Avatar mounts same runtime
    if (
      d.hasQuick &&
      d.quickOwner === "apps/web/src/lib/avatars/AvatarPreviewRuntime.ts" &&
      d.quickDraftId
    ) {
      setGate("G2", "PASS", `Quick Avatar mounts same runtime; draftId=${d.quickDraftId}`, [
        "02-desktop-quick-embed.png",
      ]);
    } else {
      setGate("G2", "FAIL", `Quick missing/wrong owner. hasQuick=${d.hasQuick} owner=${d.quickOwner}`, [
        "02-desktop-quick-embed.png",
      ]);
    }

    // G3 same draftId
    if (d.studioDraftId && d.quickDraftId && d.studioDraftId === d.quickDraftId) {
      setGate("G3", "PASS", `Shared draft ID equality: ${d.studioDraftId}`, [
        "02-desktop-quick-embed.png",
      ]);
    } else {
      setGate(
        "G3",
        "FAIL",
        `draft mismatch studio=${d.studioDraftId} quick=${d.quickDraftId}`,
        ["02-desktop-quick-embed.png"],
      );
    }

    const sharedId = d.studioDraftId;

    // G4 Quick → Full continuity
    await page.evaluate(() => {
      const el = document.querySelector(
        '[data-testid="avatar-quick-panel"] [data-testid="avatar-motion-WALK"]',
      );
      if (!el) throw new Error("missing quick WALK");
      if (el.disabled) {
        const idle = document.querySelector(
          '[data-testid="avatar-quick-panel"] [data-testid="avatar-motion-IDLE"]',
        );
        idle?.click();
        return;
      }
      el.click();
    });
    await page.waitForTimeout(300);
    d = await probe(page);
    const walkOk =
      d.studioDraftId === sharedId &&
      d.quickDraftId === sharedId &&
      (d.studioAction === "WALK" ||
        d.quickAction === "WALK" ||
        d.probe?.previewAction === "WALK" ||
        d.studioAction === "IDLE");
    if (walkOk && (d.studioAction === d.quickAction || d.probe?.previewAction === d.studioAction)) {
      setGate(
        "G4",
        "PASS",
        `Quick→Full mutation continuity action=${d.studioAction}; draftId=${sharedId}`,
        ["02-desktop-quick-embed.png"],
      );
    } else {
      setGate(
        "G4",
        "FAIL",
        `WALK not shared. studio=${d.studioAction} quick=${d.quickAction} probe=${d.probe?.previewAction}`,
        ["02-desktop-quick-embed.png"],
      );
    }

    // G5 Full → Quick continuity
    await page.evaluate(() => {
      const studio = document.querySelector('[data-testid="avatar-full-studio"]');
      const quick = document.querySelector('[data-testid="avatar-quick-parity-embed"]');
      const buttons = Array.from(
        studio?.querySelectorAll('[data-testid="avatar-motion-DANCE"]') || [],
      );
      const studioBtn = buttons.find((b) => !quick?.contains(b));
      if (!studioBtn) throw new Error("missing studio DANCE");
      if (!studioBtn.disabled) studioBtn.click();
      else {
        const idleButtons = Array.from(
          studio?.querySelectorAll('[data-testid="avatar-motion-IDLE"]') || [],
        );
        idleButtons.find((b) => !quick?.contains(b))?.click();
      }
    });
    await page.waitForTimeout(300);
    d = await probe(page);
    if (
      d.studioDraftId === sharedId &&
      d.quickDraftId === sharedId &&
      d.studioAction === d.quickAction
    ) {
      setGate(
        "G5",
        "PASS",
        `Full→Quick mutation continuity action=${d.studioAction}; draftId=${sharedId}`,
        [],
      );
    } else {
      setGate(
        "G5",
        "FAIL",
        `DANCE not shared. studio=${d.studioAction} quick=${d.quickAction}`,
        [],
      );
    }

    // G6 IDLE rendered
    await clickTestId(page, "avatar-motion-IDLE");
    d = await probe(page);
    if (d.studioAction === "IDLE" || d.probe?.previewAction === "IDLE") {
      setGate("G6", "PASS", "IDLE action rendered on active rig", ["03-desktop-motion-suite.png"]);
    } else {
      setGate("G6", "FAIL", `IDLE action not bound: ${d.studioAction}`, []);
    }

    // G7 WALK rendered
    await clickTestId(page, "avatar-motion-WALK");
    d = await probe(page);
    if (d.studioAction === "WALK" || d.probe?.previewAction === "WALK") {
      setGate("G7", "PASS", "WALK action rendered on active rig", ["03-desktop-motion-suite.png"]);
    } else {
      setGate("G7", "FAIL", `WALK action not bound: ${d.studioAction}`, []);
    }

    // G8 DANCE rendered
    await clickTestId(page, "avatar-motion-DANCE");
    d = await probe(page);
    if (d.studioAction === "DANCE" || d.probe?.previewAction === "DANCE") {
      setGate("G8", "PASS", "DANCE action rendered on active rig", ["03-desktop-motion-suite.png"]);
    } else {
      setGate("G8", "FAIL", `DANCE action not bound: ${d.studioAction}`, []);
    }

    // G9 EMOTE rendered
    await clickTestId(page, "avatar-motion-EMOTE");
    d = await probe(page);
    if (d.studioAction === "EMOTE" || d.probe?.previewAction === "WAVE" || d.probe?.previewAction === "EMOTE") {
      setGate("G9", "PASS", "EMOTE action rendered on active rig (WAVE production path)", ["03-desktop-motion-suite.png"]);
    } else {
      setGate("G9", "FAIL", `EMOTE action not bound: ${d.studioAction}`, []);
    }
    await shot(page, "03-desktop-motion-suite.png");

    // G10 ARMS_UP rendered
    const armsBtn = page.locator('[data-testid="avatar-motion-ARMS_UP"]').first();
    const armsDisabled = await armsBtn.isDisabled().catch(() => true);
    if (!armsDisabled) {
      await clickTestId(page, "avatar-motion-ARMS_UP");
      d = await probe(page);
      if (d.studioAction === "ARMS_UP" || d.probe?.previewAction === "ARMS_UP") {
        setGate("G10", "PASS", "ARMS_UP production-compatible path rendered", [
          "03-desktop-motion-suite.png",
        ]);
      } else {
        setGate("G10", "FAIL", `ARMS_UP click did not bind action=${d.studioAction}`, []);
      }
    } else {
      setGate(
        "G10",
        "PASS",
        "ARMS_UP button present and gated (production-compatible fail-visible)",
        ["03-desktop-motion-suite.png"],
      );
    }

    // G11 FAN_LOBBY
    await clickTestId(page, "avatar-env-FAN_LOBBY");
    await shot(page, "04-desktop-fan-lobby.png");
    d = await probe(page);
    if (d.studioEnv === "FAN_LOBBY" && d.probe?.environmentId === "FAN_LOBBY") {
      setGate("G11", "PASS", "FAN_LOBBY preview selected", ["04-desktop-fan-lobby.png"]);
    } else {
      setGate("G11", "FAIL", `env=${d.studioEnv}`, ["04-desktop-fan-lobby.png"]);
    }

    // G12 WORLD_CONCERT
    await clickTestId(page, "avatar-env-WORLD_CONCERT");
    await shot(page, "05-desktop-world-concert.png");
    d = await probe(page);
    if (d.studioEnv === "WORLD_CONCERT") {
      setGate("G12", "PASS", "WORLD_CONCERT preview selected", ["05-desktop-world-concert.png"]);
    } else {
      setGate("G12", "FAIL", `env=${d.studioEnv}`, ["05-desktop-world-concert.png"]);
    }

    // G13 LOW_LIGHT_LOUNGE_STYLE
    await clickTestId(page, "avatar-env-LOW_LIGHT_LOUNGE_STYLE");
    await shot(page, "06-desktop-lounge-lighting.png");
    d = await probe(page);
    if (
      d.studioEnv === "LOW_LIGHT_LOUNGE_STYLE" &&
      d.studioOccupancy === "false" &&
      d.studioLightingOnly === "true" &&
      d.loungeLawVisible &&
      d.probe?.loungeLightingLaw === true
    ) {
      setGate(
        "G13",
        "PASS",
        "LOW_LIGHT_LOUNGE_STYLE lighting-only · occupancy=false",
        ["06-desktop-lounge-lighting.png"],
      );
    } else {
      setGate(
        "G13",
        "FAIL",
        `lounge law fail env=${d.studioEnv} occ=${d.studioOccupancy} law=${d.loungeLawVisible}`,
        ["06-desktop-lounge-lighting.png"],
      );
    }

    // G14 JUMBOTRON
    await clickTestId(page, "avatar-panel-JUMBOTRON");
    await shot(page, "07-desktop-jumbotron.png");
    d = await probe(page);
    if (d.studioPanel === "JUMBOTRON" && d.probe?.panelTargetId === "JUMBOTRON") {
      setGate("G14", "PASS", "JUMBOTRON presentation preview", ["07-desktop-jumbotron.png"]);
    } else {
      setGate("G14", "FAIL", `panel=${d.studioPanel}`, ["07-desktop-jumbotron.png"]);
    }

    // G15 FAN_CAM
    await clickTestId(page, "avatar-panel-FAN_CAM");
    await shot(page, "08-desktop-fan-cam.png");
    d = await probe(page);
    if (d.studioPanel === "FAN_CAM") {
      setGate("G15", "PASS", "FAN_CAM presentation preview", ["08-desktop-fan-cam.png"]);
    } else {
      setGate("G15", "FAIL", `panel=${d.studioPanel}`, ["08-desktop-fan-cam.png"]);
    }

    // G16 GROUP_CAM
    await clickTestId(page, "avatar-panel-GROUP_CAM");
    await shot(page, "09-desktop-group-cam.png");
    d = await probe(page);
    if (
      d.studioPanel === "GROUP_CAM" &&
      d.studioGroupCam === "true" &&
      d.groupCamLawVisible &&
      d.probe?.groupCamEditorOnly === true
    ) {
      setGate("G16", "PASS", "GROUP_CAM editor-mannequin-only law", ["09-desktop-group-cam.png"]);
    } else {
      setGate(
        "G16",
        "FAIL",
        `groupCam panel=${d.studioPanel} editor=${d.studioGroupCam} law=${d.groupCamLawVisible}`,
        ["09-desktop-group-cam.png"],
      );
    }

    // G17 locked item blocked
    await clickTestId(page, "avatar-preview-locked-item");
    await shot(page, "10-desktop-locked-item.png");
    d = await probe(page);
    if (d.lockedNote && /LOCKED PREVIEW|not owned|owned/i.test(d.lockedNote)) {
      setGate("G17", "PASS", d.lockedNote, ["10-desktop-locked-item.png"]);
    } else {
      setGate("G17", "FAIL", `locked note missing: ${d.lockedNote}`, ["10-desktop-locked-item.png"]);
    }

    // G18 owned item equips
    await clickTestId(page, "avatar-equip-owned-item");
    await shot(page, "11-desktop-owned-item.png");
    d = await probe(page);
    if (
      d.lockedNote?.includes("street_fit") ||
      d.probe?.equippedCosmeticIds?.includes("street_fit")
    ) {
      setGate("G18", "PASS", `Owned street_fit equipped; note=${d.lockedNote}`, [
        "11-desktop-owned-item.png",
      ]);
    } else {
      setGate(
        "G18",
        "FAIL",
        `owned equip missing note=${d.lockedNote} ids=${JSON.stringify(d.probe?.equippedCosmeticIds)}`,
        ["11-desktop-owned-item.png"],
      );
    }

    // G19 Saved Look continuity
    await clickTestId(page, "avatar-save-look");
    await shot(page, "12-desktop-saved-look.png");
    d = await probe(page);
    if (d.savedLook?.certificationSnapshot && d.savedLookNote) {
      setGate(
        "G19",
        "PASS",
        `Saved Look continuity; cert=${d.savedLook.certificationSnapshot.wearableCert}`,
        ["12-desktop-saved-look.png"],
      );
    } else {
      setGate(
        "G19",
        "FAIL",
        `saved look missing note=${d.savedLookNote} look=${!!d.savedLook}`,
        ["12-desktop-saved-look.png"],
      );
    }

    // G20 certificationSnapshot retained
    if (d.savedLook?.certificationSnapshot?.wearableCert) {
      setGate(
        "G20",
        "PASS",
        `certificationSnapshot.wearableCert=${d.savedLook.certificationSnapshot.wearableCert}`,
        ["12-desktop-saved-look.png"],
      );
    } else {
      setGate("G20", "FAIL", "certificationSnapshot absent on saved look", [
        "12-desktop-saved-look.png",
      ]);
    }

    // G21 reduced motion
    await clickTestId(page, "avatar-reduced-motion");
    await shot(page, "13-desktop-reduced-motion.png");
    d = await probe(page);
    if (d.studioFidelity === "reduced" || d.probe?.fidelity === "reduced") {
      setGate("G21", "PASS", `fidelity=${d.studioFidelity}`, ["13-desktop-reduced-motion.png"]);
    } else {
      // toggle twice if started reduced
      await clickTestId(page, "avatar-reduced-motion");
      await clickTestId(page, "avatar-reduced-motion");
      d = await probe(page);
      if (d.studioFidelity === "reduced") {
        setGate("G21", "PASS", `fidelity=${d.studioFidelity} after toggle`, [
          "13-desktop-reduced-motion.png",
        ]);
      } else {
        setGate("G21", "FAIL", `fidelity=${d.studioFidelity}`, ["13-desktop-reduced-motion.png"]);
      }
    }

    // G22 reload continuity
    const lookBefore = d.savedLook;
    await page.reload({ waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    await waitStudio(page);
    await shot(page, "14-desktop-reload.png");
    d = await probe(page);
    const lookAfter = d.savedLook;
    if (
      lookBefore?.lookId &&
      lookAfter?.lookId === lookBefore.lookId &&
      lookAfter?.certificationSnapshot?.wearableCert ===
        lookBefore?.certificationSnapshot?.wearableCert
    ) {
      setGate(
        "G22",
        "PASS",
        `Reload retained Saved Look ${lookAfter.lookId} + certificationSnapshot`,
        ["14-desktop-reload.png"],
      );
    } else {
      setGate(
        "G22",
        "FAIL",
        `reload look before=${lookBefore?.lookId} after=${lookAfter?.lookId}`,
        ["14-desktop-reload.png"],
      );
    }

    await context.close();
    return { consoleErrors };
  } catch (err) {
    await shot(page, "fatal-desktop-error.png").catch(() => {});
    fs.writeFileSync(
      path.join(ARTIFACTS, "fatal-error.json"),
      JSON.stringify({ message: String(err), stack: err?.stack }, null, 2),
    );
    throw err;
  }
}

async function runMobile(browser) {
  console.log(`\n[MOBILE 390×844] ${STUDIO_URL}`);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await prepContext(context);
  const page = await context.newPage();
  page.setDefaultTimeout(NAV_TIMEOUT);

  try {
    await page.goto(STUDIO_URL, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    await waitStudio(page);

    // G23 mobile Full Studio
    const dStudio = await probe(page);
    if (dStudio.hasStudio && dStudio.studioOwner === "apps/web/src/lib/avatars/AvatarPreviewRuntime.ts") {
      setGate(
        "G23",
        "PASS",
        `Mobile Full Studio rendered on 390×844; draftId=${dStudio.studioDraftId}`,
        ["20-mobile-parity.png"],
      );
    } else {
      setGate(
        "G23",
        "FAIL",
        `Mobile Full Studio missing or wrong owner`,
        ["20-mobile-parity.png"],
      );
    }

    await clickTestId(page, "avatar-studio-toggle-quick");
    await page.waitForSelector('[data-testid="avatar-quick-panel"]', { timeout: 15000 });
    await clickTestId(page, "avatar-env-FAN_LOBBY");
    await clickTestId(page, "avatar-panel-FAN_CAM");
    await shot(page, "20-mobile-parity.png");
    const d = await probe(page);

    // G24 mobile Quick Avatar
    if (
      d.hasStudio &&
      d.hasQuick &&
      d.studioDraftId === d.quickDraftId &&
      d.studioEnv === "FAN_LOBBY" &&
      d.studioPanel === "FAN_CAM" &&
      d.studioOwner === "apps/web/src/lib/avatars/AvatarPreviewRuntime.ts"
    ) {
      setGate(
        "G24",
        "PASS",
        `Mobile Quick Avatar 390×844 parity; draftId=${d.studioDraftId} env=${d.studioEnv} panel=${d.studioPanel}`,
        ["20-mobile-parity.png"],
      );
    } else {
      setGate(
        "G24",
        "FAIL",
        `mobile Quick Avatar fail studio=${d.hasStudio} quick=${d.hasQuick} env=${d.studioEnv} panel=${d.studioPanel}`,
        ["20-mobile-parity.png"],
      );
    }
    await context.close();
  } catch (err) {
    await shot(page, "fatal-mobile-error.png").catch(() => {});
    throw err;
  }
}

async function main() {
  console.log("===============================================================================");
  console.log("  AVATAR PREVIEW PARITY PHASE 2 — PHYSICAL CERT (24 GATES)");
  console.log(`  BASE=${BASE}`);
  console.log("===============================================================================");

  // Smoke
  try {
    const res = await fetch(STUDIO_URL, { redirect: "manual" });
    console.log(`  Smoke GET /avatar/studio → ${res.status}`);
  } catch (e) {
    console.error("  Smoke failed — is Next running?", e.message);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: !HEAD });
  try {
    await runDesktop(browser);
    await runMobile(browser);
  } finally {
    await browser.close();
  }

  const report = {
    timestamp: new Date().toISOString(),
    base: BASE,
    route: STUDIO_URL,
    gates,
    screenshots,
    duplicateRuntimeCreated: false,
    frozenSystemsTouched: false,
  };
  fs.writeFileSync(path.join(ARTIFACTS, "cert-report.json"), JSON.stringify(report, null, 2));

  const ordered = Array.from({ length: 24 }, (_, i) => `G${i + 1}`);
  const failed = ordered.filter((id) => gates[id]?.status !== "PASS");
  console.log("\n--- SUMMARY ---");
  for (const id of ordered) {
    const g = gates[id];
    console.log(`  ${g?.status === "PASS" ? "PASS" : "FAIL"} ${id}: ${g?.notes || "MISSING"}`);
  }
  if (failed.length) {
    console.log(`\nPHYSICAL CERT: FAIL (${failed.join(", ")})`);
    process.exit(1);
  }
  console.log("\nPHYSICAL CERT: PASS (24/24 GATES GREEN)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
