'use client';

import Link from 'next/link';

type CheckItem = {
  id: string;
  label: string;
  detail: string;
  status: 'done' | 'ready' | 'needs-action' | 'blocked';
};

const CHECKLIST: { section: string; items: CheckItem[] }[] = [
  {
    section: 'PWA — Install to Home Screen (Available Now)',
    items: [
      { id: 'manifest',      label: 'manifest.json published',           detail: 'Created at /manifest.json — enables "Add to Home Screen" on iOS Safari and Android Chrome.',    status: 'done' },
      { id: 'sw',            label: 'Service worker registered',         detail: '/sw.js exists + PWARegistration component registers it in layout on every page load.',           status: 'done' },
      { id: 'install-prompt',label: 'Install prompt shown to users',     detail: 'PWAInstallPrompt component is in layout — shows after 2 visits for new users.',                   status: 'done' },
      { id: 'meta-apple',    label: 'Apple PWA meta tags in <head>',     detail: 'apple-mobile-web-app-capable and apple-touch-icon tags added to layout.',                        status: 'done' },
      { id: 'icons',         label: 'App icons generated',               detail: 'Need: 192×192 and 512×512 PNG at /public/icons/. Generate from TMI logo using https://realfavicongenerator.net or Figma export. Also need 72, 96, 128, 144, 152, 384px sizes.', status: 'needs-action' },
      { id: 'splash',        label: 'iOS splash screens',                detail: 'Add apple-touch-startup-image meta tags for iPhone/iPad sizes. Generate with pwa-asset-generator.', status: 'needs-action' },
    ],
  },
  {
    section: 'Production API & Infrastructure',
    items: [
      { id: 'api-endpoint',  label: 'All API calls use production domain',  detail: 'metadataBase set to https://themusiciansindex.com in layout. Verify no hardcoded localhost in components.', status: 'done' },
      { id: 'stripe-prod',   label: 'Stripe production key in Vercel',      detail: 'STRIPE_SECRET_KEY in Vercel must be the live sk_live_... key, not the test key. Verify in Vercel dashboard.', status: 'needs-action' },
      { id: 'stripe-webhook', label: 'Stripe webhook pointed to production', detail: 'In Stripe Dashboard → Webhooks, endpoint must be https://themusiciansindex.com/api/stripe/webhook.', status: 'needs-action' },
      { id: 'database',      label: 'Production database connected',         detail: 'DATABASE_URL in Vercel must point to production Postgres, not dev DB. Verify via Vercel env vars.', status: 'ready' },
      { id: 'daily',         label: 'Daily.co production credentials',       detail: 'DAILY_API_KEY in Vercel must be production key, not sandbox. Check Daily.co dashboard.', status: 'ready' },
    ],
  },
  {
    section: 'Payments & Revenue',
    items: [
      { id: 'stripe-prices', label: 'All Stripe price IDs set in Vercel',  detail: 'NEXT_PUBLIC_STRIPE_PRICE_* env vars for all 7 tiers (Pro→Diamond) must be live mode price IDs.', status: 'needs-action' },
      { id: 'checkout',      label: 'Stripe checkout flow tested end-to-end', detail: 'Go to /account/subscription → upgrade → pay with real card → verify webhook fires → tier updates.', status: 'needs-action' },
      { id: 'adsense',       label: 'AdSense approved and serving',         detail: 'Apply for AdSense approval at adsense.google.com. Requires 20+ original content pages, privacy policy, terms of service.', status: 'needs-action' },
    ],
  },
  {
    section: 'Legal & Store Requirements',
    items: [
      { id: 'privacy',       label: 'Privacy policy published',     detail: '/privacy.html exists in public/. Verify it covers: data collection, cookies, advertising, COPPA (minors), GDPR basics.', status: 'done' },
      { id: 'terms',         label: 'Terms of service published',   detail: '/terms.html exists in public/.', status: 'done' },
      { id: 'dmca',          label: 'DMCA policy published',        detail: '/dmca.html exists. Required for DMCA safe harbor. Must name a designated DMCA agent.', status: 'done' },
      { id: 'cookies',       label: 'Cookie policy + consent',      detail: '/cookies.html exists. Add a cookie consent banner before AdSense approval for GDPR compliance.', status: 'needs-action' },
      { id: 'coppa',         label: 'Age gate / COPPA compliance',  detail: 'Admin age-gates page exists. Verify under-13 users cannot create accounts or be targeted with ads.', status: 'ready' },
    ],
  },
  {
    section: 'App Store — Native Wrapper (Capacitor)',
    items: [
      { id: 'capacitor',     label: 'Capacitor installed and configured',  detail: 'Run: npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android. Then: npx cap init "The Musicians Index" com.themusiciansindex.app', status: 'blocked' },
      { id: 'ios-build',     label: 'iOS build tested in Xcode',           detail: 'Requires Mac + Xcode 15+. Run: npx cap add ios → npx cap sync → npx cap open ios', status: 'blocked' },
      { id: 'android-build', label: 'Android build tested in Android Studio', detail: 'Run: npx cap add android → npx cap sync → npx cap open android', status: 'blocked' },
      { id: 'deep-links',    label: 'Deep links configured',               detail: 'Add Associated Domains (iOS) and App Links (Android) for themusiciansindex.com. Enables links to open in app.', status: 'blocked' },
      { id: 'push-notif',    label: 'Push notifications',                  detail: 'Install @capacitor/push-notifications + Firebase Cloud Messaging. Required for battle challenges, DMs, live alerts.', status: 'blocked' },
      { id: 'app-icons-store', label: 'App Store icons generated',         detail: 'iOS requires 1024×1024 PNG (no alpha). Android requires 512×512. Use Figma or Canva to export from TMI logo.', status: 'needs-action' },
      { id: 'splash-store',  label: 'Splash screens configured',           detail: 'iOS: LaunchScreen.storyboard. Android: splash drawable. Use @capacitor/splash-screen plugin.', status: 'blocked' },
      { id: 'analytics-app', label: 'Analytics wired for mobile',          detail: 'Add Firebase Analytics or Mixpanel. Required for App Store review approval (Google Play especially).', status: 'blocked' },
      { id: 'crash-free',    label: 'Crash-free startup verified',         detail: 'Test on physical iPhone + Android device. No white screen. All auth flows work. Stripe checkout opens in browser.', status: 'blocked' },
      { id: 'versioning',    label: 'Version number set',                  detail: 'Set version in capacitor.config.ts. iOS: CFBundleVersion. Android: versionCode. Start at 1.0.0 / build 1.', status: 'blocked' },
      { id: 'store-listing', label: 'App Store listing prepared',          detail: 'App name, subtitle, description, keywords, screenshots (6.5" iPhone), support URL, privacy URL.', status: 'blocked' },
      { id: 'play-listing',  label: 'Google Play listing prepared',        detail: 'Short description (80 chars), full description (4000 chars), screenshots, feature graphic (1024×500).', status: 'blocked' },
    ],
  },
  {
    section: 'Performance & Quality',
    items: [
      { id: 'lighthouse',    label: 'Lighthouse score 80+',                detail: 'Run lighthouse audit. Target: Performance 80+, Accessibility 90+, Best Practices 90+, SEO 95+.', status: 'needs-action' },
      { id: 'mobile-test',   label: 'Manual test on real iPhone + Android', detail: 'Test: login, profile, go live, battle wall, magazine, subscription upgrade, ad display.', status: 'needs-action' },
      { id: 'offline',       label: 'Offline/poor connection handled',     detail: 'Service worker caches shell. API failures show error states, not blank screens. Tested on throttled 3G.', status: 'ready' },
    ],
  },
];

const STATUS_COLOR: Record<CheckItem['status'], string> = {
  done: '#00FF88',
  ready: '#FFD700',
  'needs-action': '#FF8800',
  blocked: 'rgba(255,255,255,0.25)',
};

const STATUS_LABEL: Record<CheckItem['status'], string> = {
  done: '✓ DONE',
  ready: '◐ READY',
  'needs-action': '! ACTION',
  blocked: '⊘ BLOCKED',
};

export default function MobileReleasePage() {
  const allItems = CHECKLIST.flatMap((s) => s.items);
  const done = allItems.filter((i) => i.status === 'done').length;
  const action = allItems.filter((i) => i.status === 'needs-action').length;
  const blocked = allItems.filter((i) => i.status === 'blocked').length;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 860, margin: '0 auto', padding: '32px 20px', color: '#fff' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#00FFFF', fontWeight: 900, marginBottom: 8 }}>ADMIN · RELEASE</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 6px' }}>Mobile Release Checklist</h1>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Done', count: done, color: '#00FF88' },
            { label: 'Needs Action', count: action, color: '#FF8800' },
            { label: 'Blocked (native)', count: blocked, color: 'rgba(255,255,255,0.3)' },
          ].map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{s.count} {s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(0,255,255,0.04)', border: '1px solid rgba(0,255,255,0.15)', borderRadius: 10, padding: '14px 18px', marginBottom: 28, fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
        <strong style={{ color: '#00FFFF' }}>PWA vs Native App:</strong> The manifest.json is already live — users can "Add to Home Screen" on iOS Safari and Android Chrome today. For actual App Store / Google Play listing (native app), Capacitor must be set up on a Mac (for iOS). Blocked items below require that native wrapper first.
      </div>

      {CHECKLIST.map((section) => (
        <div key={section.section} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', marginBottom: 12, textTransform: 'uppercase' }}>
            {section.section}
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {section.items.map((item) => (
              <div key={item.id} style={{
                borderRadius: 10,
                border: `1px solid ${item.status === 'done' ? 'rgba(0,255,136,0.2)' : item.status === 'needs-action' ? 'rgba(255,136,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
                background: item.status === 'done' ? 'rgba(0,255,136,0.03)' : 'rgba(255,255,255,0.015)',
                padding: '12px 16px',
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }}>
                <div style={{
                  fontSize: 8, fontWeight: 900, letterSpacing: '0.1em',
                  color: STATUS_COLOR[item.status], padding: '3px 7px', borderRadius: 4,
                  background: `${STATUS_COLOR[item.status]}18`,
                  border: `1px solid ${STATUS_COLOR[item.status]}30`,
                  whiteSpace: 'nowrap', flexShrink: 0, marginTop: 1,
                }}>
                  {STATUS_LABEL[item.status]}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: item.status === 'blocked' ? 'rgba(255,255,255,0.35)' : '#fff', marginBottom: 3 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
        <Link href="/admin/ad-networks" style={{ padding: '10px 18px', borderRadius: 8, fontSize: 11, fontWeight: 900, background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.25)', color: '#00FFFF', textDecoration: 'none' }}>
          AD NETWORKS →
        </Link>
        <Link href="/admin/revenue" style={{ padding: '10px 18px', borderRadius: 8, fontSize: 11, fontWeight: 900, background: 'rgba(255,45,170,0.08)', border: '1px solid rgba(255,45,170,0.2)', color: '#FF2DAA', textDecoration: 'none' }}>
          REVENUE DASHBOARD →
        </Link>
        <Link href="/admin" style={{ padding: '10px 18px', borderRadius: 8, fontSize: 11, fontWeight: 800, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
          ADMIN HOME
        </Link>
      </div>
    </div>
  );
}
