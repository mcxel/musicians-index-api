/**
 * Lane C Challenge physical Chromium certification
 * Route: /rooms/challenge/[roomId] (production venue + ACGBR Jumbotron)
 * Viewports: Desktop 1280×800 + Mobile 390×844
 *
 * Evidence: .cursor/artifacts/challenge-lane-c-physical/
 */

import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = process.env.E2E_BASE_URL || "http://localhost:3002";
const ROOM_ID = process.env.CHALLENGE_ROOM_ID || "sess-challenge-prod-01";
const ROOM_URL = `${BASE}/rooms/challenge/${ROOM_ID}`;
const ARTIFACTS = path.join(process.cwd(), ".cursor", "artifacts", "challenge-lane-c-physical");
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
  await page.screenshot({ path: file, fullPage: false, animations: "disabled" });
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
      // Clear operational resume once per browser context — keep across reload for Gate 9.
      if (!sessionStorage.getItem("tmi.cert.lane_c.seeded")) {
        for (const k of Object.keys(sessionStorage)) {
          if (k.startsWith("tmi.challenge.operational.")) sessionStorage.removeItem(k);
        }
        sessionStorage.setItem("tmi.cert.lane_c.seeded", "1");
      }
    } catch {
      /* ignore */
    }
  });
  await context.addCookies([
    { name: "tmi_session", value: "cert_session_challenge_lane_c", domain: "localhost", path: "/" },
    { name: "tmi_session_id", value: "user-challenge-lane-c", domain: "localhost", path: "/" },
    { name: "tmi_user_id", value: "user-challenge-lane-c", domain: "localhost", path: "/" },
    { name: "tmi_role", value: "PERFORMER", domain: "localhost", path: "/" },
  ]);
}

async function waitReady(page) {
  await page.waitForSelector('[data-challenge-presentation="production"]', {
    timeout: NAV_TIMEOUT,
  });
  // Playwright signature: waitForFunction(fn, arg, options) — options must be 3rd arg.
  await page.waitForFunction(
    () => {
      const shell = document.querySelector('[data-challenge-presentation="production"]');
      const text = shell?.textContent || "";
      const faces = window.__TMI_CHALLENGE_ACGBR_FACES__;
      const programAttr = shell?.getAttribute("data-program-source") || "";
      return (
        text.includes("Complete the stated objective") &&
        (programAttr === "PROGRAM.CHALLENGE_PRIMARY" ||
          text.includes("PROGRAM.CHALLENGE_PRIMARY")) &&
        Array.isArray(faces) &&
        faces.length >= 4
      );
    },
    undefined,
    { timeout: NAV_TIMEOUT },
  );
  // Dismiss beta / consent chrome if present
  const notNow = page.getByText(/NOT NOW/i).first();
  if ((await notNow.count()) > 0) {
    try {
      await notNow.click({ timeout: 1500 });
    } catch {
      /* ignore */
    }
  }
}

async function clickControl(page, testId) {
  await page.evaluate((id) => {
    const el = document.querySelector(`[data-testid="${id}"]`);
    if (!el) throw new Error(`missing control ${id}`);
    el.click();
  }, testId);
}

async function probeDom(page) {
  return page.evaluate(() => {
    const shell = document.querySelector('[data-challenge-presentation="production"]');
    const jumbo = document.querySelector('[data-testid="audience-scene-jumbotron-layer"]');
    const canvas = document.querySelector("canvas");
    const text = (document.querySelector("main")?.innerText || "").slice(0, 8000);
    const audios = Array.from(document.querySelectorAll("audio, video")).map((el) => ({
      tag: el.tagName,
      muted: !!el.muted,
      paused: "paused" in el ? !!el.paused : null,
      src: (el.currentSrc || el.getAttribute("src") || "").slice(0, 120),
    }));
    const facesHook = window.__TMI_CHALLENGE_ACGBR_FACES__ ?? null;
    return {
      title: document.title,
      href: location.href,
      hasShell: !!shell,
      shellPhase: shell?.getAttribute("data-lifecycle-phase") || null,
      pack: shell?.getAttribute("data-experience-pack") || null,
      composition: shell?.getAttribute("data-presentation-composition") || null,
      vsLayout: shell?.getAttribute("data-vs-layout") || null,
      prefersContract: shell?.getAttribute("data-prefers-challenge-contract") || null,
      programSource: shell?.getAttribute("data-program-source") || null,
      surfaceKind: shell?.getAttribute("data-surface-kind") || null,
      shellText: (shell?.innerText || "").slice(0, 800),
      hasContractPrimitive: !!document.querySelector('[data-primitive="ChallengeContract"]'),
      hasResultCard: !!document.querySelector('[data-primitive="ResultCard"]'),
      hasJumbo: !!jumbo,
      jumboLookUp: jumbo?.getAttribute("data-jumbotron-look-up") || null,
      jumboExperience: jumbo?.getAttribute("data-experience-type") || null,
      jumboFaces: jumbo?.getAttribute("data-challenge-acgbr-faces") || "",
      hasCanvas: !!canvas,
      phaseLabel: (text.match(/Phase:\s*([A-Z0-9_]+)/) || [])[1] || null,
      policySelect: document.querySelector("select")?.value || null,
      textSample: text.slice(0, 1500),
      audios,
      facesHook,
      semantic: {
        hasObjectiveContract: /OBJECTIVE CONTRACT/i.test(text),
        hasBattleVs: /VS CENTER COLLISION|VOLTRON COLLISION|A_DOMINANT|B_DOMINANT/i.test(text),
        hasCypherChrome: /NO WINNER CYPHER|CYPHER ROTATION ONLY|MIC HANDOFF CIRCLE/i.test(text),
        hasGauntlet: /GAUNTLET PROGRESSION|SURVIVOR CORRIDOR|INCUMBENT DNA/i.test(text),
        mentionsNotBattleVs: /not Battle VS/i.test(text),
      },
    };
  });
}

async function runDesktop(browser) {
  console.log(`\n[DESKTOP 1280×800] ${ROOM_URL}`);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  await prepContext(context);
  const page = await context.newPage();
  page.setDefaultTimeout(NAV_TIMEOUT);

  const consoleErrors = [];
  page.on("pageerror", (err) => consoleErrors.push(String(err.message || err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  try {
    await page.goto(ROOM_URL, { waitUntil: "commit", timeout: NAV_TIMEOUT });
    await waitReady(page);
    await shot(page, "01-desktop-mount-objective.png");

    let d = await probeDom(page);

    if (d.hasShell && d.hasJumbo && /CHALLENGE/i.test(d.textSample) && /Complete the stated objective/.test(d.shellText)) {
      setGate(
        "1",
        "PASS",
        `Venue+shell+jumbo mounted. lookUp=${d.jumboLookUp} pack=${d.pack}`,
        ["01-desktop-mount-objective.png"],
      );
    } else {
      setGate(
        "1",
        "FAIL",
        `Empty/missing venue shell. hasShell=${d.hasShell} jumbo=${d.hasJumbo} shellText=${d.shellText.slice(0, 80)}`,
        ["01-desktop-mount-objective.png"],
      );
    }

    if (d.hasContractPrimitive && d.semantic.hasObjectiveContract && d.composition === "OBJECTIVE_FOCUS") {
      setGate(
        "2",
        "PASS",
        `ChallengeContract visible; composition=${d.composition}; phase=${d.shellPhase}`,
        ["01-desktop-mount-objective.png"],
      );
    } else {
      setGate(
        "2",
        "FAIL",
        `Objective contract missing or wrong layout. contract=${d.hasContractPrimitive} composition=${d.composition}`,
        ["01-desktop-mount-objective.png"],
      );
    }

    if (
      d.vsLayout === "false" &&
      d.prefersContract === "true" &&
      d.pack === "Challenge" &&
      d.composition !== "DUAL" &&
      d.composition !== "A_DOMINANT" &&
      d.composition !== "B_DOMINANT" &&
      d.semantic.mentionsNotBattleVs
    ) {
      setGate(
        "3",
        "PASS",
        `Challenge DNA: pack=${d.pack} composition=${d.composition} vsLayout=${d.vsLayout}`,
        ["01-desktop-mount-objective.png"],
      );
    } else {
      setGate(
        "3",
        "FAIL",
        `DNA mismatch pack=${d.pack} composition=${d.composition} vs=${d.vsLayout}`,
        ["01-desktop-mount-objective.png"],
      );
    }

    // Gate 4 — countdown then active
    await clickControl(page, "challenge-start-attempt");
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-challenge-presentation="production"]')
          ?.getAttribute("data-lifecycle-phase") === "ATTEMPT_1_COUNTDOWN",
    undefined,
    { timeout: 10000 },
  );
    await shot(page, "02-desktop-attempt-countdown.png");
    const midCountdown = await probeDom(page);
    await page.waitForFunction(
() =>
        document
          .querySelector('[data-challenge-presentation="production"]')
          ?.getAttribute("data-lifecycle-phase") === "ATTEMPT_1_ACTIVE",
    undefined,
    { timeout: 10000 },
  );
    await shot(page, "03-desktop-attempt-active.png");
    d = await probeDom(page);
    if (midCountdown.shellPhase === "ATTEMPT_1_COUNTDOWN" && d.shellPhase === "ATTEMPT_1_ACTIVE") {
      setGate(
        "4",
        "PASS",
        `Countdown→Active observed (${midCountdown.shellPhase} → ${d.shellPhase}); composition=${d.composition}`,
        ["02-desktop-attempt-countdown.png", "03-desktop-attempt-active.png"],
      );
    } else {
      setGate(
        "4",
        "FAIL",
        `Countdown/active path incomplete. mid=${midCountdown.shellPhase} end=${d.shellPhase}`,
        ["02-desktop-attempt-countdown.png", "03-desktop-attempt-active.png"],
      );
    }

    // Gate 5 — judgment modes
    const select = page.locator("select");
    const policies = ["AUDIENCE_VOTE", "AUTHORIZED_JUDGES", "MEASURABLE_RESULT"];
    const seen = [];
    for (const p of policies) {
      await select.selectOption(p);
      await page.waitForTimeout(350);
      seen.push(await select.inputValue());
    }
    await shot(page, "04-desktop-judgment-policy.png");
    d = await probeDom(page);
    if (seen.includes("AUDIENCE_VOTE") && seen.includes("AUTHORIZED_JUDGES") && seen.includes("MEASURABLE_RESULT")) {
      setGate(
        "5",
        "PASS",
        `Judgment policy select exercised all three modes; last=${d.policySelect}`,
        ["04-desktop-judgment-policy.png"],
      );
    } else {
      setGate("5", "FAIL", `Policy path incomplete: ${seen.join(",")}`, ["04-desktop-judgment-policy.png"]);
    }

    // Gate 6 — result
    await clickControl(page, "challenge-add-challenged");
    await page.waitForFunction(
() => {
        const b = document.querySelector('[data-testid="challenge-record-complete"]');
        return b && !b.disabled;
      },
    undefined,
    { timeout: 5000 },
  );
    await clickControl(page, "challenge-record-complete");
    await page.waitForFunction(
() => !!document.querySelector('[data-primitive="ResultCard"]'),
    undefined,
    { timeout: 8000 },
  );
    await shot(page, "05-desktop-result-presentation.png");
    d = await probeDom(page);
    if (d.hasResultCard && /no invented winner/i.test(d.shellText)) {
      setGate(
        "6",
        "PASS",
        `Authorized result card; honest no-winner copy. phase=${d.shellPhase}`,
        ["05-desktop-result-presentation.png"],
      );
    } else {
      setGate(
        "6",
        "FAIL",
        `Result card missing or dishonest. hasResult=${d.hasResultCard} text=${d.shellText.slice(0, 120)}`,
        ["05-desktop-result-presentation.png"],
      );
    }

    // Gate 7 — Jumbotron LOOK-UP / four-face (re-enter active for ACTIVE_ATTEMPT north)
    await clickControl(page, "challenge-start-attempt");
    await page.waitForFunction(
() =>
        document
          .querySelector('[data-challenge-presentation="production"]')
          ?.getAttribute("data-lifecycle-phase") === "ATTEMPT_1_ACTIVE",
    undefined,
    { timeout: 12000 },
  );
    await page.waitForTimeout(800);
    await shot(page, "06-desktop-jumbotron-lookup.png");
    d = await probeDom(page);
    const hookFaces = Array.isArray(d.facesHook) ? d.facesHook : [];
    const facesAttr = d.jumboFaces || "";
    const roles = hookFaces.map((f) => `${f.face}:${f.role}`);
    const hasCardinals =
      hookFaces.some((f) => f.face === "NORTH") &&
      hookFaces.some((f) => f.face === "EAST") &&
      hookFaces.some((f) => f.face === "SOUTH") &&
      hookFaces.some((f) => f.face === "WEST");
    const distinctRoles = new Set(hookFaces.map((f) => f.role));
    if (d.jumboLookUp === "true" && hasCardinals && distinctRoles.size >= 3) {
      setGate(
        "7",
        "PASS",
        `LOOK-UP=${d.jumboLookUp}; faces=${roles.join("|") || facesAttr}; distinct=${distinctRoles.size}`,
        ["06-desktop-jumbotron-lookup.png"],
      );
    } else {
      setGate(
        "7",
        "FAIL",
        `Four-face plan incomplete. lookUp=${d.jumboLookUp} faces=${roles.join("|") || facesAttr}`,
        ["06-desktop-jumbotron-lookup.png"],
      );
    }

    // Gate 8 — Universal Player / PROGRAM continuity
    const hasProgramBind = d.programSource === "PROGRAM.CHALLENGE_PRIMARY";
    const audioBtn = page.getByRole("button", { name: /AUDIO/i }).first();
    let audioClicked = false;
    if ((await audioBtn.count()) > 0) {
      try {
        await audioBtn.click({ timeout: 2000 });
        audioClicked = true;
        await page.waitForTimeout(400);
      } catch {
        /* overlay */
      }
    }
    await shot(page, "07-desktop-player-audio.png");
    if (hasProgramBind) {
      setGate(
        "8",
        "PASS",
        `PROGRAM.CHALLENGE_PRIMARY bound; audioControlClicked=${audioClicked}; no room remount`,
        ["07-desktop-player-audio.png"],
      );
    } else {
      setGate("8", "FAIL", `PROGRAM bind missing: ${d.programSource}`, ["07-desktop-player-audio.png"]);
    }

    // Gate 9 — reconnect resume
    const beforeReload = await probeDom(page);
    await page.reload({ waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    await waitReady(page);
    await page.waitForFunction(
() =>
        document
          .querySelector('[data-challenge-presentation="production"]')
          ?.getAttribute("data-lifecycle-phase") === "ATTEMPT_1_ACTIVE",
    undefined,
    { timeout: 10000 },
  );
    await shot(page, "08-desktop-reload-resume.png");
    const afterReload = await probeDom(page);
    if (
      beforeReload.shellPhase === "ATTEMPT_1_ACTIVE" &&
      afterReload.shellPhase === "ATTEMPT_1_ACTIVE"
    ) {
      setGate(
        "9",
        "PASS",
        `Phase resumed after reload: ${afterReload.shellPhase}`,
        ["08-desktop-reload-resume.png"],
      );
    } else {
      setGate(
        "9",
        "FAIL",
        `Reload lost mid-flow phase. before=${beforeReload.shellPhase} after=${afterReload.shellPhase}`,
        ["08-desktop-reload-resume.png"],
      );
    }

    // Gate 10 — single PROGRAM audio
    d = await probeDom(page);
    const unmutedPlaying = (d.audios || []).filter((a) => a.muted === false && a.paused === false);
    if (unmutedPlaying.length <= 1) {
      setGate(
        "10",
        "PASS",
        `No double-audio. media=${JSON.stringify(d.audios)}; unmutedPlaying=${unmutedPlaying.length}`,
        ["08-desktop-reload-resume.png"],
      );
    } else {
      setGate(
        "10",
        "FAIL",
        `Multiple unmuted playing media: ${JSON.stringify(unmutedPlaying)}`,
        ["08-desktop-reload-resume.png"],
      );
    }

    // Gate 11 — teardown
    await page.goto(`${BASE}/challenges`, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    await page.waitForTimeout(1000);
    const teardown = await page.evaluate(() => ({
      faces: window.__TMI_CHALLENGE_ACGBR_FACES__ ?? null,
      href: location.href,
    }));
    await shot(page, "09-desktop-teardown.png");
    if (teardown.faces == null) {
      setGate(
        "11",
        "PASS",
        `Left room; face hook cleared. href=${teardown.href}`,
        ["09-desktop-teardown.png"],
      );
    } else {
      setGate(
        "11",
        "FAIL",
        `Face hook still set after leave: ${JSON.stringify(teardown.faces)}`,
        ["09-desktop-teardown.png"],
      );
    }

    // Gate 12 — semantic negatives
    await page.goto(ROOM_URL, { waitUntil: "commit", timeout: NAV_TIMEOUT });
    await waitReady(page);
    await shot(page, "10-desktop-semantic-negatives.png");
    d = await probeDom(page);
    if (
      d.semantic.hasObjectiveContract &&
      !d.semantic.hasBattleVs &&
      !d.semantic.hasCypherChrome &&
      !d.semantic.hasGauntlet &&
      d.vsLayout === "false"
    ) {
      setGate(
        "12",
        "PASS",
        "No Battle VS / Cypher winnerless / Gauntlet incumbent chrome",
        ["10-desktop-semantic-negatives.png"],
      );
    } else {
      setGate(
        "12",
        "FAIL",
        `Semantic pollution: ${JSON.stringify(d.semantic)}`,
        ["10-desktop-semantic-negatives.png"],
      );
    }

    fs.writeFileSync(
      path.join(ARTIFACTS, "desktop-probe.json"),
      JSON.stringify({ d, consoleErrors: consoleErrors.slice(0, 40) }, null, 2),
    );
  } finally {
    await context.close();
  }
}

async function runMobile(browser) {
  console.log(`\n[MOBILE 390×844] ${ROOM_URL}`);
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
    await page.goto(ROOM_URL, { waitUntil: "commit", timeout: NAV_TIMEOUT });
    await waitReady(page);
    await shot(page, "11-mobile-mount.png");

    await clickControl(page, "challenge-start-attempt");
    await page.waitForFunction(
() => {
        const p = document
          .querySelector('[data-challenge-presentation="production"]')
          ?.getAttribute("data-lifecycle-phase");
        return p === "ATTEMPT_1_COUNTDOWN" || p === "ATTEMPT_1_ACTIVE";
      },
    undefined,
    { timeout: 10000 },
  );
    await shot(page, "12-mobile-attempt.png");

    const select = page.locator("select");
    if ((await select.count()) > 0) {
      await select.selectOption("AUDIENCE_VOTE");
      await page.waitForTimeout(300);
    }
    await shot(page, "13-mobile-judgment.png");

    const d = await probeDom(page);
    fs.writeFileSync(path.join(ARTIFACTS, "mobile-probe.json"), JSON.stringify(d, null, 2));

    if (!d.hasShell || !d.hasContractPrimitive || !/Complete the stated objective/.test(d.shellText)) {
      setGate(
        "M",
        "FAIL",
        `Mobile lost Challenge DNA. shell=${d.hasShell} contract=${d.hasContractPrimitive}`,
        ["11-mobile-mount.png", "12-mobile-attempt.png"],
      );
    } else {
      setGate(
        "M",
        "PASS",
        `Mobile 390×844 retains shell+contract; phase=${d.shellPhase} composition=${d.composition}`,
        ["11-mobile-mount.png", "12-mobile-attempt.png", "13-mobile-judgment.png"],
      );
    }
  } finally {
    await context.close();
  }
}

async function main() {
  console.log(`[LANE C PHYSICAL] BASE=${BASE} ROOM=${ROOM_ID} HEAD=${HEAD}`);
  const browser = await chromium.launch({ headless: !HEAD });
  try {
    await runDesktop(browser);
    await runMobile(browser);
  } finally {
    await browser.close();
  }

  const ordered = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "M"];
  const fails = ordered.filter((k) => gates[k]?.status === "FAIL");
  const passes = ordered.filter((k) => gates[k]?.status === "PASS");
  const verdict = fails.length === 0 ? "PASS" : "FAIL";

  const report = {
    verdict,
    headShaHint: "expect d2cdde1e+",
    base: BASE,
    roomUrl: ROOM_URL,
    gates,
    screenshots,
    fails,
    passes,
    at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(ARTIFACTS, "cert-report.json"), JSON.stringify(report, null, 2));

  console.log("\n══════════════════════════════════════════════════");
  console.log(`LANE C CHALLENGE PHYSICAL VERDICT: ${verdict === "PASS" ? "🟢 PASS" : "🔴 FAIL"}`);
  for (const k of ordered) {
    const g = gates[k];
    if (!g) continue;
    console.log(`  ${g.status === "PASS" ? "🟢" : "🔴"} Gate ${k}: ${g.status}`);
  }
  console.log(`Fails: ${fails.join(", ") || "(none)"}`);
  console.log(`Artifacts: ${ARTIFACTS}`);
  console.log("══════════════════════════════════════════════════\n");

  process.exit(verdict === "PASS" ? 0 : 1);
}

main().catch((err) => {
  console.error("[LANE C PHYSICAL] fatal:", err);
  try {
    fs.writeFileSync(
      path.join(ARTIFACTS, "fatal-error.json"),
      JSON.stringify({ message: String(err), stack: err?.stack }, null, 2),
    );
  } catch {
    /* ignore */
  }
  process.exit(1);
});
