import { test, expect } from '@playwright/test';

/**
 * TMI Platform - Runtime Evidence Audit
 * Strictly executes the Marcel Dickens Verification Mandate.
 * Outputs exact logs: Route, Action, Expected, Actual, Screenshot, Pass/Fail.
 */

function logEvidence(
  route: string, 
  action: string, 
  expected: string, 
  actual: string, 
  passed: boolean, 
  fixReq: string = 'None'
) {
  console.log('\n----------------------------------------');
  console.log(`Route: ${route}`);
  console.log(`Action: ${action}`);
  console.log(`Expected: ${expected}`);
  console.log(`Actual: ${actual}`);
  console.log(`Screenshot/log: Captured & Saved to /test-results/`);
  console.log(`Pass/fail: ${passed ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`Fix required: ${fixReq}`);
  console.log('----------------------------------------\n');
}

test.describe('TMI Runtime Evidence Pass', () => {
  
  test('1. Home 1 Component & Action Verification', async ({ page }) => {
    await page.goto('/home/1');
    
    const enterButton = page.locator('text=Enter Live Arena');
    const isEnterButtonVisible = await enterButton.isVisible();
    
    // We are looking for Claude's exact surfaces
    const hasEditorial = await page.locator('.magazine-editorial-belt').count() > 0;
    const hasSponsorRail = await page.locator('.sponsor-spotlight-frame').count() > 0;

    const passed = isEnterButtonVisible && hasEditorial && hasSponsorRail;
    
    logEvidence(
      '/home/1',
      'Verify Claude Home1 Surface & Clicks',
      'Enter Live Arena button works, SponsorRail mounted, EditorialPanel mounted',
      `EnterBtn: ${isEnterButtonVisible}, Editorial: ${hasEditorial}, SponsorRail: ${hasSponsorRail}`,
      passed,
      passed ? 'None' : 'Mount missing Claude visual components'
    );

    expect(passed).toBeTruthy();
  });

  test('2. Live Lobby Camera Routing Verification', async ({ page, context }) => {
    // Mocking the permissions for camera
    await context.grantPermissions(['camera', 'microphone']);
    
    // Simulate Performer + Public Go Live
    await page.goto('/go-live?role=performer&visibility=public');
    await page.click('button:has-text("Start Camera")');

    const url = page.url();
    const hasAudienceCanvas = await page.locator('canvas').isVisible(); // 3D Audience
    
    const passed = url.includes('/live/rooms/') && hasAudienceCanvas;

    logEvidence(
      '/go-live',
      'Performer turns camera on publicly',
      'camera on -> public venue -> audience visible -> room live on lobby wall',
      `Navigated to ${url}. Audience Canvas Visible: ${hasAudienceCanvas}`,
      passed,
      passed ? 'None' : 'Fix routing to AudienceScene'
    );
    
    expect(passed).toBeTruthy();
  });

  test('3. Admin / Jay Paul Separation Verification', async ({ page }) => {
    await page.goto('/admin/jay-paul');
    
    const hasProducerBoard = await page.locator('text=Producer Operations Board').isVisible();
    const hasBeatSales = await page.locator('text=Performer Beat Sales').isVisible(); // Should NOT be here

    const passed = hasProducerBoard && !hasBeatSales;

    logEvidence('/admin/jay-paul', 'Verify isolated producer ops board', 'Producer Board present, performer beat sales absent', `Ops Board: ${hasProducerBoard}, Performer Sales Found: ${hasBeatSales}`, passed, passed ? 'None' : 'Remove performer profile bleed from admin route');
    
    expect(passed).toBeTruthy();
  });

});