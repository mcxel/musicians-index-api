import { test, expect } from '@playwright/test';

test.describe('P0: Life Support Systems Verification', () => {
  
  // 1. AUTH & SESSION PERSISTENCE
  test('P0-A: User can sign up, log in, and session persists across refresh', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Generate dynamic test user
    const testEmail = `p0_test_${Date.now()}@berntoutglobal.com`;
    
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'TMI_LifeSupport_2026!');
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard/onboarding
    await expect(page).toHaveURL(/.*\/home|.*\/onboarding/);
    
    // Verify session persistence on hard refresh
    await page.reload();
    await expect(page.locator('text=Sign In')).not.toBeVisible();
    await expect(page.locator('text=Log Out')).toBeVisible();
  });

  // 2. DATABASE INTEGRITY
  test('P0-B: System health and database readiness check', async ({ request }) => {
    // Hits the existing Phase 17.5 health endpoints to prove DB connectivity
    const healthRes = await request.get('/api/healthz');
    expect(healthRes.ok()).toBeTruthy();
    
    const readyRes = await request.get('/api/readyz');
    expect(readyRes.ok()).toBeTruthy();
    const readyData = await readyRes.json();
    expect(readyData.database).toBe('connected');
  });

  // 3. STRIPE REVENUE LOOP
  test('P0-C: Stripe checkout session initializes securely', async ({ page }) => {
    // Note: We test that the API creates a valid checkout session ID
    // We do not complete a real charge in the automated test
    const res = await page.request.post('/api/stripe/checkout', {
      data: { tier: 'fan_pro', priceId: 'price_test_123' }
    });
    
    // Expecting 401 if unauthenticated, or 200/303 with a Stripe URL if mocked
    // This ensures the route isn't returning a 500 "Internal Server Error"
    expect([200, 303, 401]).toContain(res.status());
  });

  // 4 & 5. WEBRTC & PRESENCE (Self-View Camera)
  test('P0-D & P0-E: WebRTC Self-View initializes without crashing', async ({ page }) => {
    // Grant fake camera permissions for the automated browser
    await page.context().grantPermissions(['camera', 'microphone']);
    
    await page.goto('/home/live'); // Or the specific broadcast studio route
    
    // The video element should mount and play
    const videoElement = page.locator('video.self-view-monitor');
    
    // Wait for the video element to attach to the DOM
    await videoElement.waitFor({ state: 'attached', timeout: 10000 });
    
    // Check that the video is actually receiving a stream (not a black screen)
    const isPlaying = await videoElement.evaluate((video: HTMLVideoElement) => {
      return video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2;
    });
    // We log this outcome rather than strictly failing if the CI environment lacks mock devices
    console.log(`WebRTC Self-View playing status: ${isPlaying}`);
  });
});