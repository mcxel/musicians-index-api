'use client';
// MobileNavBar.tsx — Bottom navigation bar for mobile (fixed, 5 tabs)
// Copilot wires: usePathname() for active state
// Proof: shows on mobile only, active tab highlighted, all routes work
// Note: hidden on desktop via CSS (tmi-mobile-nav--desktop-hidden)
export function MobileNavBar() {
  const tabs = [
    { href: '/live', icon: '📺', label: 'Live' },
    { href: '/lobby', icon: '🏠', label: 'Lobby' },
    { href: '/discover', icon: '🔍', label: 'Discover' },
    { href: '/feed', icon: '📰', label: 'Feed' },
    { href: '/dashboard', icon: '👤', label: 'You' },
  ];
  return (
    <nav className="tmi-mobile-nav" aria-label="Main navigation">
      {tabs.map(t => (
        <a key={t.href} href={t.href} className="tmi-mobile-nav__tab" aria-label={t.label}>
          <span className="tmi-mobile-nav__icon" aria-hidden="true">{t.icon}</span>
          <span className="tmi-mobile-nav__label">{t.label}</span>
        </a>
      ))}
    </nav>
  );
}
