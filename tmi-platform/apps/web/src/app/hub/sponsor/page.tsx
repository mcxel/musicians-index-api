import { PersonaSwitcher } from '@/components/hud/PersonaSwitcher';
import SponsorHubShell from "@/components/sponsor/SponsorHubShell";

export default function SponsorHubPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#07071a', minHeight: '100vh' }}>
      <div style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,215,0,0.15)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#FFD700', textTransform: 'uppercase' }}>Sponsor Hub</span>
        <PersonaSwitcher currentRole="sponsor" compact />
      </div>
      <SponsorHubShell />
    </div>
  );
}
