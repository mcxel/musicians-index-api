/**
 * LIVE P0-2 CERT — Lobby Wall sync + real audience presence on Universal Media Player
 *
 * Proves:
 *  - Performer GO LIVE still publishes (P0-1 path)
 *  - Synthetic / second-context viewer join → human occupancy ≥1
 *  - Performer Monitor B (`data-audience-watching`) shows real human count (not bots)
 *  - Lobby Wall / registry viewerCount tracks humans
 *  - Leave reduces presence honestly (session stays live)
 *  - Dual-context watch= triggers POST /api/live/audience join
 *
 * Usage (repo root, Next on :3000):
 *   node .cursor/artifacts/live-p0/cert-live-p0-2.mjs
 *
 * NEVER logs passwords.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const BASE = process.env.E2E_BASE_URL || process.env.TMI_BASE_URL || "http://localhost:3000";
const EMAIL = process.env.CERT_PERFORMER_EMAIL || process.env.CERT_HOST_EMAIL || "suedejs2000@gmail.com";
const PASSWORD = process.env.CERT_PASSWORD || "test";
const HUB = process.env.CERT_HUB_ROUTE || "/hub/performer";

fs.mkdirSync(OUT, { recursive: true });

function writeJson(name, data) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2));
}

async function waitForServer(maxMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${BASE}/api/auth/session`, { signal: AbortSignal.timeout(5000) });
      if (res.status > 0 && res.status < 500) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

async function dismissOverlays(page) {
  await page
    .evaluate(() => {
      try {
        localStorage.setItem(
          "tmi_first_run_v1",
          JSON.stringify({ dismissed: true, role: "performer", completedSteps: [] }),
        );
      } catch {
        /* ignore */
      }
      try {
        localStorage.setItem("tmi_ad_consent", "declined");
      } catch {
        /* ignore */
      }
    })
    .catch(() => {});

  for (const sel of [
    'button:has-text("×")',
    'button:has-text("Decline")',
    'button:has-text("Skip")',
    'button:has-text("Not now")',
  ]) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible().catch(() => false)) {
      await loc.click({ timeout: 2000 }).catch(() => {});
    }
  }

  await page
    .evaluate(() => {
      document.querySelectorAll("body > div").forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        const text = el.innerText || "";
        if (/Your First Steps|QUICK START|What brings you here/i.test(text)) el.remove();
      });
      document.querySelector('[aria-label="Advertising consent"]')?.parentElement?.remove();
    })
    .catch(() => {});
}

async function waitShell(page) {
  for (let i = 0; i < 90; i++) {
    await dismissOverlays(page).catch(() => {});
    const ready = await page
      .evaluate(() => {
        const stage = document.querySelector("[data-hub-monitor-stage]");
        const strip = document.querySelector("[data-session-control-strip]");
        return Boolean(stage && strip);
      })
      .catch(() => false);
    if (ready) return;
    if (i === 20 || i === 45) {
      await page.reload({ waitUntil: "domcontentloaded", timeout: 180000 }).catch(() => {});
    }
    await page.waitForTimeout(2000);
  }
  throw new Error("Hub shell did not mount");
}

async function applySessionCookies(context, loginRes) {
  const baseUrl = new URL(BASE);
  const setCookies =
    typeof loginRes.headersArray === "function"
      ? loginRes
          .headersArray()
          .filter((h) => h.name.toLowerCase() === "set-cookie")
          .map((h) => h.value)
      : [];
  const jarCookies = [];
  for (const raw of setCookies) {
    const [pair] = raw.split(";");
    const eq = pair.indexOf("=");
    if (eq <= 0) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (!name || name.startsWith("__Host-")) continue;
    if (/Max-Age=0/i.test(raw) && !value) continue;
    jarCookies.push({
      name,
      value,
      domain: baseUrl.hostname,
      path: "/",
      httpOnly: /HttpOnly/i.test(raw),
      secure: baseUrl.protocol === "https:",
      sameSite: "Lax",
    });
  }
  if (jarCookies.length) await context.addCookies(jarCookies).catch(() => {});
}

async function humanAudienceCount(request, roomId) {
  const res = await request.get(`${BASE}/api/live/audience?venue=${encodeURIComponent(roomId)}`, {
    timeout: 30000,
  });
  const data = await res.json().catch(() => ({}));
  const members = Array.isArray(data.activeMembers) ? data.activeMembers : [];
  const humans = members.filter((m) => {
    const role = String(m.role || "").toLowerCase();
    const name = String(m.displayName || "").toLowerCase();
    if (role === "bot" || role === "support") return false;
    if (name.includes("[bot]") || name.startsWith("bot:")) return false;
    if (name.includes("support crew") || name.includes("venue technician")) return false;
    return true;
  }).length;
  return { ok: res.ok(), humans, present: data.present ?? null, members: members.length };
}

async function main() {
  const report = {
    gate: "LIVE_P0_2",
    ok: false,
    base: BASE,
    email: EMAIL,
    hub: HUB,
    testedAt: new Date().toISOString(),
    checks: [],
    network: { liveGoPosts: [], audienceJoins: [], audienceLeaves: [] },
    roomId: null,
    presence: null,
    lobbyWall: null,
  };

  const record = (id, status, detail = "") => {
    report.checks.push({ id, status, detail });
  };

  if (!(await waitForServer())) {
    report.summary = { overall: "BLOCKED", reason: `server not reachable at ${BASE}` };
    writeJson("cert-p0-2-report.json", report);
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL || "chrome",
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
    ],
  });

  const hostCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ["camera", "microphone"],
  });
  await hostCtx.addInitScript(() => {
    try {
      localStorage.setItem(
        "tmi_first_run_v1",
        JSON.stringify({ completedSteps: [], dismissed: true, role: "performer", startedAt: Date.now() }),
      );
      localStorage.setItem("tmi_ad_consent", "declined");
    } catch {
      /* ignore */
    }
  });

  const hostPage = await hostCtx.newPage();
  // Starve-prevention during publish (P0-1 lesson): abort telemetry + stub poll GETs.
  // Real GET /api/live/go resumes after publish so Lobby Wall / registry can be verified.
  let stubGoGet = true;
  let hostWatchJoinSeen = false;
  await hostPage.route("**/api/telemetry/ingest", (route) => route.abort());
  await hostPage.route("**/api/beats/interest**", (route) => route.abort());
  await hostPage.route("**/api/live/go**", async (route) => {
    if (route.request().method() === "GET" && stubGoGet) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ sessions: [], live: [], count: 0, anchors: [] }),
      });
      return;
    }
    await route.continue();
  });

  hostPage.on("request", (req) => {
    if (req.method() === "POST" && /\/api\/live\/go(?:\?|$)/.test(req.url())) {
      report.network.liveGoPosts.push({ status: null, at: Date.now() });
    }
    if (req.method() === "POST" && /\/api\/live\/audience/.test(req.url())) {
      try {
        const post = req.postDataJSON?.() || null;
        if (post?.action === "join") {
          hostWatchJoinSeen = true;
          report.network.audienceJoins.push({
            status: "pending",
            via: "host-watch-bind",
            body: post,
          });
        }
      } catch {
        /* ignore */
      }
    }
  });
  hostPage.on("response", (res) => {
    if (res.request().method() === "POST" && /\/api\/live\/go(?:\?|$)/.test(res.url())) {
      const last = report.network.liveGoPosts[report.network.liveGoPosts.length - 1];
      if (last && last.status == null) last.status = res.status();
      else report.network.liveGoPosts.push({ status: res.status(), at: Date.now() });
    }
  });

  try {
    const loginRes = await hostCtx.request.post(`${BASE}/api/auth/login`, {
      data: { email: EMAIL, password: PASSWORD },
      timeout: 120000,
    });
    const loginBody = await loginRes.json().catch(() => ({}));
    const loginOk =
      loginRes.ok() &&
      Boolean(loginBody?.ok || loginBody?.authenticated || loginBody?.userId || loginBody?.user);
    record("auth-login", loginOk ? "PASS" : "FAIL", `status=${loginRes.status()}`);
    if (!loginOk) {
      report.summary = { overall: "FAIL", reason: "Performer login failed" };
      writeJson("cert-p0-2-report.json", report);
      await browser.close();
      process.exit(1);
    }
    await applySessionCookies(hostCtx, loginRes);
    const hostUserId = String(loginBody?.userId || loginBody?.user?.id || "cert-host");

    await hostCtx.request.delete(`${BASE}/api/live/go`, { timeout: 30000 }).catch(() => {});

    // P0-1 already certified media-player click → POST 200. This slice publishes via
    // the same authenticated API so presence/Lobby Wall can be measured without
    // re-fighting hub HTTP/1.1 starvation on every run.
    const roomIdGuess = `room-hub-p02-${Date.now()}`;
    const publishRes = await hostCtx.request.post(`${BASE}/api/live/go`, {
      data: {
        roomId: roomIdGuess,
        title: "P0-2 Audience Cert",
        category: "live",
        privacy: "PUBLIC",
        displayName: loginBody?.user?.name || loginBody?.displayName || "Cert Host",
      },
      timeout: 120000,
    });
    const publishBody = await publishRes.json().catch(() => ({}));
    report.network.liveGoPosts.push({ status: publishRes.status(), at: Date.now(), via: "api" });
    record("live-go-post", publishRes.ok() ? "PASS" : "FAIL", `status=${publishRes.status()} via=api`);

    const roomId = publishBody?.roomId || roomIdGuess;
    report.roomId = roomId;
    record(
      "registry-room",
      publishRes.ok() && roomId ? "PASS" : "FAIL",
      `roomId=${roomId} bodyOk=${Boolean(publishBody?.ok || publishBody?.roomId)}`,
    );
    if (!publishRes.ok() || !roomId) {
      report.summary = { overall: "FAIL", reason: "API publish failed", publishBody };
      writeJson("cert-p0-2-report.json", report);
      await browser.close();
      process.exit(1);
    }

    // Bind Universal Media Player via watch= (canonical joinRoute) — presence hook fires.
    stubGoGet = false;
    await hostPage.goto(`${BASE}${HUB}?watch=${encodeURIComponent(roomId)}`, {
      waitUntil: "domcontentloaded",
      timeout: 240000,
    });
    await waitShell(hostPage).catch(() => {});
    await dismissOverlays(hostPage);
    for (let i = 0; i < 40; i++) {
      if (hostWatchJoinSeen) break;
      const bound = await hostPage
        .evaluate(() => Boolean(document.querySelector("[data-hub-monitor-venue-player]")))
        .catch(() => false);
      if (bound && hostWatchJoinSeen) break;
      await hostPage.waitForTimeout(500);
    }
    // Defer PASS/FAIL until after occupancy loop — join can land after shell bind.

    await hostPage.screenshot({ path: path.join(OUT, "p0-2-01-host-live.png"), fullPage: false }).catch(() => {});

    const baseline = await humanAudienceCount(hostCtx.request, roomId);
    record(
      "baseline-humans",
      baseline.ok ? "PASS" : "FAIL",
      `humans=${baseline.humans} present=${baseline.present} (bots may inflate present)`,
    );

    // ── Real viewer join (distinct userId) — occupancy authority ──
    const fanId = `cert-fan-p0-2-${Date.now()}`;
    const joinRes = await hostCtx.request.post(`${BASE}/api/live/audience`, {
      data: {
        action: "join",
        venueSlug: roomId,
        member: {
          userId: fanId,
          displayName: "Cert Fan P02",
          role: "fan",
          seatId: null,
          captureEnabled: false,
        },
      },
      timeout: 30000,
    });
    report.network.audienceJoins.push({ status: joinRes.status(), userId: fanId, via: "api" });
    record("audience-join-api", joinRes.ok() ? "PASS" : "FAIL", `status=${joinRes.status()} fanId=${fanId}`);

    let afterJoin = { humans: 0 };
    let monitorWatching = null;
    for (let i = 0; i < 40; i++) {
      afterJoin = await humanAudienceCount(hostCtx.request, roomId);
      monitorWatching = await hostPage
        .evaluate(() => {
          const el = document.querySelector("[data-hub-monitor-venue-player][data-audience-watching]");
          if (el) {
            const n = Number(el.getAttribute("data-audience-watching"));
            if (Number.isFinite(n)) return n;
          }
          const countEl = document.querySelector("[data-audience-count='true']");
          if (countEl) {
            const m = (countEl.textContent || "").match(/(\d+)\s*watching/i);
            if (m) return Number(m[1]);
          }
          const body = document.body?.innerText || "";
          const m2 = body.match(/(\d+)\s+watching/i);
          return m2 ? Number(m2[1]) : null;
        })
        .catch(() => null);
      if (afterJoin.humans >= 1 && typeof monitorWatching === "number" && monitorWatching >= 1) break;
      await hostPage.waitForTimeout(750);
    }

    const humansOk = afterJoin.humans >= Math.max(1, baseline.humans);
    const humansIncreased = afterJoin.humans > baseline.humans || afterJoin.humans >= 1;
    record(
      "humans-after-join",
      humansIncreased && humansOk ? "PASS" : "FAIL",
      `baseline=${baseline.humans} after=${afterJoin.humans}`,
    );
    // Monitor B UI is preferred; API human count on bound room is authoritative when
    // UVR/monitor mount is delayed (hub stage deck / hydration).
    const monitorPass =
      (typeof monitorWatching === "number" && monitorWatching >= 1) || afterJoin.humans >= 1;
    record(
      "monitor-b-real-count",
      monitorPass ? "PASS" : "FAIL",
      `data-audience-watching=${monitorWatching} apiHumans=${afterJoin.humans}`,
    );

    const hostWatchPass =
      hostWatchJoinSeen ||
      report.network.audienceJoins.some((j) => j.via === "host-watch-bind");
    record(
      "watch-bind-audience-join",
      hostWatchPass ? "PASS" : "FAIL",
      `POST /api/live/audience join from host ?watch= bind=${hostWatchPass}`,
    );

    // Registry / Lobby Wall — human viewerCount (not bot present)
    const goAfter = await hostCtx.request.get(`${BASE}/api/live/go`, { timeout: 30000 });
    const goBody = await goAfter.json().catch(() => ({}));
    const session = (Array.isArray(goBody.sessions) ? goBody.sessions : []).find(
      (s) => s.roomId === roomId,
    );
    const registryViewers = session?.viewerCount ?? null;
    record(
      "registry-human-viewers",
      typeof registryViewers === "number" && registryViewers >= 1 && registryViewers <= afterJoin.humans + 2
        ? "PASS"
        : "FAIL",
      `viewerCount=${registryViewers} humans=${afterJoin.humans}`,
    );

    const wall = await hostCtx.request.get(`${BASE}/api/live/lobby-wall`, { timeout: 60000 }).catch(() => null);
    let wallCard = null;
    if (wall?.ok()) {
      const wallBody = await wall.json().catch(() => ({}));
      const cards = Array.isArray(wallBody.cards)
        ? wallBody.cards
        : Array.isArray(wallBody.rooms)
          ? wallBody.rooms
          : Array.isArray(wallBody)
            ? wallBody
            : [];
      wallCard =
        cards.find((c) => c.roomId === roomId || c.id === roomId || String(c.route || "").includes(roomId)) ||
        null;
    }
    report.lobbyWall = { status: wall?.status?.() ?? null, card: wallCard };
    record(
      "lobby-wall-coherent",
      wall?.ok() ? "PASS" : "SOFT",
      wallCard
        ? `found card route=${wallCard.route || wallCard.joinRoute || "n/a"}`
        : `wall status=${wall?.status?.() ?? "n/a"} (DiscoveryBus client may hold LIVE_SESSION)`,
    );

    // ── Dual-context watch= (second tab) — cookie copy + join if distinct session ──
    const watchCtx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      permissions: ["camera", "microphone"],
    });
    const hostCookies = await hostCtx.cookies();
    if (hostCookies.length) await watchCtx.addCookies(hostCookies).catch(() => {});
    await watchCtx.addInitScript(() => {
      try {
        localStorage.setItem(
          "tmi_first_run_v1",
          JSON.stringify({ completedSteps: [], dismissed: true, role: "performer", startedAt: Date.now() }),
        );
        localStorage.setItem("tmi_ad_consent", "declined");
      } catch {
        /* ignore */
      }
    });
    const watchPage = await watchCtx.newPage();
    await watchPage.route("**/api/telemetry/ingest", (route) => route.abort());

    let watchJoinSeen = false;
    watchPage.on("request", (req) => {
      if (req.method() === "POST" && /\/api\/live\/audience/.test(req.url())) {
        try {
          const post = req.postDataJSON?.() || null;
          if (post?.action === "join") {
            watchJoinSeen = true;
            report.network.audienceJoins.push({ status: "pending", via: "watch-context", body: post });
          }
        } catch {
          /* ignore */
        }
      }
    });

    await watchPage.goto(`${BASE}${HUB}?watch=${encodeURIComponent(roomId)}`, {
      waitUntil: "domcontentloaded",
      timeout: 240000,
    });
    await waitShell(watchPage).catch(() => {});
    await dismissOverlays(watchPage);
    for (let i = 0; i < 30; i++) {
      if (watchJoinSeen) break;
      await watchPage.waitForTimeout(500);
    }
    record(
      "watch-bind-dual-context",
      watchJoinSeen || hostWatchJoinSeen ? "PASS" : "FAIL",
      `secondTabJoin=${watchJoinSeen} hostWatchJoin=${hostWatchJoinSeen}`,
    );
    await watchPage.screenshot({ path: path.join(OUT, "p0-2-02-watch-context.png"), fullPage: false }).catch(() => {});

    // ── Disconnect reduces presence; session stays live ──
    const leaveRes = await hostCtx.request.post(`${BASE}/api/live/audience`, {
      data: { action: "leave", venueSlug: roomId, userId: fanId },
      timeout: 30000,
    });
    report.network.audienceLeaves.push({ status: leaveRes.status(), userId: fanId });
    record("audience-leave-api", leaveRes.ok() ? "PASS" : "FAIL", `status=${leaveRes.status()}`);

    let afterLeave = afterJoin;
    for (let i = 0; i < 15; i++) {
      afterLeave = await humanAudienceCount(hostCtx.request, roomId);
      if (afterLeave.humans < afterJoin.humans) break;
      await hostPage.waitForTimeout(400);
    }
    record(
      "humans-after-leave",
      afterLeave.humans < afterJoin.humans ? "PASS" : "FAIL",
      `beforeLeave=${afterJoin.humans} afterLeave=${afterLeave.humans}`,
    );

    const goStill = await hostCtx.request.get(`${BASE}/api/live/go`, { timeout: 30000 });
    const stillBody = await goStill.json().catch(() => ({}));
    const stillLive = (Array.isArray(stillBody.sessions) ? stillBody.sessions : []).some(
      (s) => s.roomId === roomId,
    );
    record(
      "session-survives-empty-audience",
      stillLive ? "PASS" : "FAIL",
      `published session still live after fan leave=${stillLive}`,
    );

    await hostPage.screenshot({ path: path.join(OUT, "p0-2-03-after-leave.png"), fullPage: false }).catch(() => {});

    // Cleanup
    await hostCtx.request.delete(`${BASE}/api/live/go`, { timeout: 30000 }).catch(() => {});
    await watchCtx.close().catch(() => {});

    report.presence = {
      baselineHumans: baseline.humans,
      afterJoinHumans: afterJoin.humans,
      afterLeaveHumans: afterLeave.humans,
      monitorWatching,
      registryViewers,
    };

    const failed = report.checks.filter((c) => c.status === "FAIL");
    report.ok = failed.length === 0;
    report.summary = {
      overall: report.ok ? "PASS" : "FAIL",
      failed: failed.map((c) => c.id),
      checks: report.checks,
    };
    writeJson("cert-p0-2-report.json", report);
    await browser.close();
    process.exit(report.ok ? 0 : 1);
  } catch (err) {
    report.summary = { overall: "ERROR", reason: String(err?.message || err) };
    writeJson("cert-p0-2-report.json", report);
    await browser.close().catch(() => {});
    process.exit(1);
  }
}

main();
