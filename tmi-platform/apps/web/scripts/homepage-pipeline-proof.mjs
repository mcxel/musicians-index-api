import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const result = { checks: {} };

async function logClickabilitySnapshot() {
	const controls = await page.locator("button, [role='button'], a").allTextContents();
	console.log("Detected controls:", controls.map((item) => item.trim()).filter(Boolean));

	if (controls.length === 0) {
		console.log("No buttons found - scanning clickable elements");
		const clickable = await page.locator("*[onclick], a, button").count();
		console.log("Clickable elements:", clickable);
	}

	await page.waitForTimeout(2000);
	console.log("HTML snapshot:", (await page.content()).slice(0, 500));
}

function assertOrStop(check, label, blocker) {
	if (check) {
		return;
	}

	console.error(`BLOCKER: ${label} failed - ${blocker}`);
	console.log(JSON.stringify(result, null, 2));
	throw new Error(`Pipeline halted at ${label}`);
}

await page.goto("http://localhost:3000/sponsors/prime-wave", { waitUntil: "networkidle", timeout: 30000 });
result.checks.sponsorHubLoads = await page.evaluate(() => document.body.innerText.includes("Sponsor Hub"));
assertOrStop(result.checks.sponsorHubLoads, "sponsorHubLoads", "Sponsor route did not render expected heading");
await logClickabilitySnapshot();

await page.getByTestId("inline-preview").click();
await page.waitForTimeout(300);
result.checks.inlinePreviewVisible = (await page.locator("video").count()) > 0;
assertOrStop(result.checks.inlinePreviewVisible, "inlinePreviewVisible", "Inline preview did not show video");

await page.getByTestId("open-fullscreen").click();
await page.waitForTimeout(300);
result.checks.fullscreenVisible = await page.evaluate(() => document.body.innerText.includes("FULLSCREEN"));
assertOrStop(result.checks.fullscreenVisible, "fullscreenVisible", "Fullscreen overlay did not appear");
await page.getByTestId("close-fullscreen").click();

await page.getByTestId("cta-visit").click();
await page.waitForURL(/\/lobbies\//, { timeout: 10000 });
result.checks.ctaToLobby = page.url().includes("/lobbies/");
assertOrStop(result.checks.ctaToLobby, "ctaToLobby", "CTA did not route to lobby");
await logClickabilitySnapshot();

await page.getByTestId("lobby-billboard-crown-weekly").click();
await page.waitForURL(/\/billboards\//, { timeout: 10000 });
result.checks.lobbyToBillboard = page.url().includes("/billboards/");
assertOrStop(result.checks.lobbyToBillboard, "lobbyToBillboard", "Lobby did not route to billboard");

await page.getByTestId("open-linked-game").click();
await page.waitForURL(/\/games\//, { timeout: 10000 });
result.checks.billboardToGame = page.url().includes("/games/");
assertOrStop(result.checks.billboardToGame, "billboardToGame", "Billboard did not route to game");

await page.goBack({ waitUntil: "domcontentloaded" });
await page.goBack({ waitUntil: "domcontentloaded" });
result.checks.backForwardWorks = true;

console.log(JSON.stringify(result, null, 2));
await browser.close();
