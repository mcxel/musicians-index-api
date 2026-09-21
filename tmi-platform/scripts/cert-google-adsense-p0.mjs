import { chromium } from "playwright";
import fs from "fs";

async function run() {
  console.log("=== STARTING GOOGLE/ADSENSE P0 CERTIFICATION SUITE ===");
  const results = [];

  const record = (name, pass, details) => {
    results.push({ name, pass, details });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${name} - ${details}`);
  };

  // 1. Root redirect check
  try {
    const res = await fetch("http://localhost:3000/", { redirect: "manual" });
    const loc = res.headers.get("location");
    const status = res.status;
    const pass = (status === 308 || status === 307) && (loc === "/home/1" || loc?.includes("/home/1"));
    record("Root Entry Redirect", pass, `Status: ${status}, Location: ${loc}`);
  } catch (e) {
    record("Root Entry Redirect", false, e.message);
  }

  // 2. /cookie-policy redirect check
  try {
    const res = await fetch("http://localhost:3000/cookie-policy", { redirect: "manual" });
    const loc = res.headers.get("location");
    const status = res.status;
    const pass = (status === 308 || status === 307) && (loc === "/privacy#cookies" || loc?.includes("/privacy#cookies"));
    record("Cookie Policy Redirect (/cookie-policy)", pass, `Status: ${status}, Location: ${loc}`);
  } catch (e) {
    record("Cookie Policy Redirect (/cookie-policy)", false, e.message);
  }

  // 3. /disclosures status check
  try {
    const res = await fetch("http://localhost:3000/disclosures");
    const text = await res.text();
    const hasDisclosures = text.includes("Advertising Disclosures") && text.includes("Google AdSense");
    record("Disclosures HTTP 200 & Content", res.status === 200 && hasDisclosures, `Status: ${res.status}, Content OK: ${hasDisclosures}`);
  } catch (e) {
    record("Disclosures HTTP 200 & Content", false, e.message);
  }

  // 4. Direct API feedback report check
  try {
    const res = await fetch("http://localhost:3000/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "bug",
        severity: "high",
        tags: ["BETA_FEEDBACK", "PUBLIC_SITELINK", "CERT_SUITE"],
        message: "Automated verification test from cert suite",
        page: "/feedback",
      }),
    });
    const json = await res.json();
    const pass = res.status === 200 && json.success === true && !!json.id && json.id.startsWith("fb_");
    record("API /api/feedback/report POST", pass, `Status: ${res.status}, ID: ${json.id}, queued: ${json.routeToAutomatedPatchQueue}`);
  } catch (e) {
    record("API /api/feedback/report POST", false, e.message);
  }

  // 5. Playwright browser tests
  const browser = await chromium.launch({ headless: true });

  // Test /privacy#cookies anchor
  try {
    const privPage = await browser.newPage();
    await privPage.goto("http://localhost:3000/privacy#cookies", { waitUntil: "domcontentloaded" });
    const cookiesElem = await privPage.$("#cookies");
    const isVisible = cookiesElem ? await cookiesElem.isVisible() : false;
    const text = cookiesElem ? await cookiesElem.innerText() : "";
    const hasCookiesText = text.includes("Cookies & Sessions");
    record("Privacy Anchor #cookies Exists & Visible", isVisible && hasCookiesText, `Element #cookies text: ${text.slice(0, 40)}...`);
    await privPage.close();
  } catch (e) {
    record("Privacy Anchor #cookies Exists & Visible", false, e.message);
  }

  // 6. Test /feedback SUCCESS PATH
  try {
    const fbSuccessPage = await browser.newPage();
    await fbSuccessPage.goto("http://localhost:3000/feedback", { waitUntil: "domcontentloaded" });

    // Select category
    await fbSuccessPage.click('[data-category-btn="video-issue"]');

    // Fill message & email
    const msgText = "Playwright end-to-end verification: Authentic server dispatch testing.";
    await fbSuccessPage.fill('[data-feedback-textarea]', msgText);
    await fbSuccessPage.fill('[data-feedback-email]', "qa-success-proof@themusiciansindex.com");

    // Submit
    await fbSuccessPage.click('[data-feedback-submit-btn]');

    // Wait for receipt
    await fbSuccessPage.waitForSelector('[data-feedback-receipt]', { timeout: 10000 });
    const receiptText = await fbSuccessPage.innerText('[data-feedback-receipt]');
    
    // Validate authentic server response
    const hasDispatchedHeading = receiptText.includes("Report Successfully Dispatched");
    const hasRealServerId = receiptText.includes("REFERENCE ID: fb_");
    const hasNoFakeId = !receiptText.includes("FB-LOCAL");

    const pass = hasDispatchedHeading && hasRealServerId && hasNoFakeId;
    record("Beta Feedback SUCCESS PATH (2xx + Real Server ID)", pass, `Receipt heading: OK, Real ID: ${hasRealServerId}, No fake ID: ${hasNoFakeId}`);
    await fbSuccessPage.close();
  } catch (e) {
    record("Beta Feedback SUCCESS PATH (2xx + Real Server ID)", false, e.message);
  }

  // 7. Test /feedback FAILURE PATH
  try {
    const fbFailPage = await browser.newPage();

    // Intercept /api/feedback/report to simulate 503 Service Unavailable / network error
    await fbFailPage.route("**/api/feedback/report", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Service Temporarily Unavailable" }),
      });
    });

    await fbFailPage.goto("http://localhost:3000/feedback", { waitUntil: "domcontentloaded" });

    // Select category
    await fbFailPage.click('[data-category-btn="chat-issue"]');

    // Fill message & email
    const enteredMsg = "Playwright failure-path verification: Message must be preserved and no fake success shown.";
    await fbFailPage.fill('[data-feedback-textarea]', enteredMsg);
    await fbFailPage.fill('[data-feedback-email]', "qa-fail-proof@themusiciansindex.com");

    // Submit
    await fbFailPage.click('[data-feedback-submit-btn]');

    // Wait for error state
    await fbFailPage.waitForSelector('[data-feedback-error]', { timeout: 10000 });
    const errorText = await fbFailPage.innerText('[data-feedback-error]');

    // Verify form is STILL VISIBLE (not replaced by receipt)
    const formEl = await fbFailPage.$('[data-feedback-form]');
    const isFormVisible = formEl ? await formEl.isVisible() : false;

    // Verify receipt DOES NOT EXIST
    const receiptEl = await fbFailPage.$('[data-feedback-receipt]');
    const noReceipt = receiptEl === null;

    // Verify entered text is PRESERVED in textarea
    const preservedText = await fbFailPage.$eval('[data-feedback-textarea]', (el) => el.value);
    const textPreserved = preservedText === enteredMsg;

    // Verify entire page HTML contains NO fake receipt indicators
    const pageHtml = await fbFailPage.content();
    const noFakeId = !pageHtml.includes("FB-LOCAL");
    const noSuccessClaim = !pageHtml.includes("Report Successfully Dispatched");

    const pass = isFormVisible && noReceipt && textPreserved && noFakeId && noSuccessClaim;
    record("Beta Feedback FAILURE PATH (Form Preserved, No Fake Receipt)", pass, `Form visible: ${isFormVisible}, Text preserved: ${textPreserved}, Error: "${errorText}", No fake receipt: ${noReceipt && noFakeId}`);
    await fbFailPage.close();
  } catch (e) {
    record("Beta Feedback FAILURE PATH (Form Preserved, No Fake Receipt)", false, e.message);
  }

  // 8. Mobile 390x844 responsive test for /feedback
  try {
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto("http://localhost:3000/feedback", { waitUntil: "domcontentloaded" });

    const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
    const noOverflow = scrollWidth <= clientWidth;

    record("Mobile 390x844 /feedback Zero Horizontal Overflow", noOverflow, `scrollWidth: ${scrollWidth}px, clientWidth: ${clientWidth}px`);
    await mobileContext.close();
  } catch (e) {
    record("Mobile 390x844 /feedback Zero Horizontal Overflow", false, e.message);
  }

  // 9. Check sitemap includes /feedback
  try {
    const res = await fetch("http://localhost:3000/sitemap.xml");
    const sitemapXml = await res.text();
    const hasFeedback = sitemapXml.includes("/feedback");
    const hasPrivacy = sitemapXml.includes("/privacy");
    const hasDisclosures = sitemapXml.includes("/disclosures");
    record("Sitemap XML Static Indexing Authority", hasFeedback && hasPrivacy && hasDisclosures, `Feedback: ${hasFeedback}, Privacy: ${hasPrivacy}, Disclosures: ${hasDisclosures}`);
  } catch (e) {
    record("Sitemap XML Static Indexing Authority", false, e.message);
  }

  // 10. ads.txt and layout.tsx AdSense Publisher ID
  try {
    const adsTxt = fs.readFileSync("apps/web/public/ads.txt", "utf8");
    const layoutTsx = fs.readFileSync("apps/web/src/app/layout.tsx", "utf8");
    const pubId = "pub-4088577529436039";
    const adsTxtOk = adsTxt.includes(pubId);
    const layoutOk = layoutTsx.includes(`ca-${pubId}`);
    record("AdSense Publisher ID Match (ads.txt & layout.tsx)", adsTxtOk && layoutOk, `ads.txt: ${adsTxtOk}, layout.tsx: ${layoutOk}`);
  } catch (e) {
    record("AdSense Publisher ID Match (ads.txt & layout.tsx)", false, e.message);
  }

  await browser.close();

  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  console.log(`\n=== SUITE COMPLETE: ${passed}/${total} PASSED ===`);
  if (passed !== total) {
    process.exit(1);
  }
}

run().catch(e => {
  console.error("CERT SUITE FATAL:", e);
  process.exit(1);
});
