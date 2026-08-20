// scripts/gate3_gate4_proofs.ts
import { test, expect } from "@playwright/test";

// This script validates Gate 3 (room/audience/monitor convergence) and Gate 4 (audio persistence)

async function enterRoomAsFan(page) {
  await page.goto(process.env.VERCEL_PREVIEW_URL || "http://localhost:3000");
  // Placeholder: navigate to a room as fan
  await page.click("text=Enter Room");
  await expect(page.locator("#room-view")).toBeVisible();
}

async function checkMonitorLayout(page) {
  // Verify monitors are displayed correctly
  const monitors = page.locator(".monitor");
  await expect(monitors).toHaveCount(2);
}

async function verifyAudioPersistence(page) {
  // Start audio, navigate away and back, ensure still playing
  await page.click("button.start-audio");
  await page.waitForTimeout(1000);
  const audioBefore = await page.evaluate(() => (document.querySelector('audio') as HTMLAudioElement).paused);
  // Navigate away
  await page.goto("about:blank");
  await page.goto(process.env.VERCEL_PREVIEW_URL || "http://localhost:3000");
  await page.click("text=Enter Room");
  const audioAfter = await page.evaluate(() => (document.querySelector('audio') as HTMLAudioElement).paused);
  expect(audioBefore).toBe(false);
  expect(audioAfter).toBe(false);
}

test.describe("Gate 3 & Gate 4 proofs", () => {
  test("Gate 3 - monitor layout", async ({ page }) => {
    await enterRoomAsFan(page);
    await checkMonitorLayout(page);
    await page.screenshot({ path: "artifacts/gate3_monitor_layout.png", fullPage: true });
  });

  test("Gate 4 - audio persistence", async ({ page }) => {
    await enterRoomAsFan(page);
    await verifyAudioPersistence(page);
    await page.screenshot({ path: "artifacts/gate4_audio_persistence.png", fullPage: true });
  });
});
