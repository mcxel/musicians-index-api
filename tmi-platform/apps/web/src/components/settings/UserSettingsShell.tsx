'use client';
// UserSettingsShell.tsx — Settings page layout with sidebar nav
// Copilot wires: settings sections as child routes or tabs
// Proof: all 5 sections navigate, active section highlighted
export function UserSettingsShell({ activeSection, children }: { activeSection: string; children?: React.ReactNode }) {
  const sections = [
    { id:'profile', label:'Profile', href:'/settings/profile' },
    { id:'notifications', label:'Notifications', href:'/settings/notifications' },
    { id:'billing', label:'Billing', href:'/settings/billing' },
    { id:'privacy', label:'Privacy', href:'/settings/privacy' },
    { id:'account', label:'Account', href:'/settings/account' },
  ];
  return (
    <div className="tmi-settings-shell">
      <nav className="tmi-settings-shell__nav" aria-label="Settings sections">
        {sections.map(s => (
          <a
            key={s.id}
            href={s.href}
            className={`tmi-settings-nav-item${activeSection===s.id?' tmi-settings-nav-item--active':''}`}
            aria-current={activeSection===s.id?'page':undefined}
          >
            {s.label}
          </a>
        ))}
      </nav>
      <main className="tmi-settings-shell__content">{children}</main>
    </div>
  );
}
