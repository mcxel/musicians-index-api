'use client';
// SystemStatusCard.tsx — Platform-wide health indicator for /status page
// Copilot wires: useSystemHealth() — returns overall platform status
// Proof: status page shows correctly to all users (no auth required)
export function SystemStatusCard() {
  return (
    <div className="tmi-system-status">
      <div className="tmi-system-status__indicator tmi-system-status__indicator--healthy">
        ● All Systems Operational
      </div>
      <div className="tmi-system-status__services" data-slot="services">
        {['Homepage','Live Rooms','Stream & Win','Auth','API','Database'].map(svc => (
          <div key={svc} className="tmi-service-status">
            <span>{svc}</span>
            <span className="tmi-health-badge tmi-health-badge--healthy">Operational</span>
          </div>
        ))}
      </div>
      <div className="tmi-system-status__last-updated">Last updated: now</div>
    </div>
  );
}
