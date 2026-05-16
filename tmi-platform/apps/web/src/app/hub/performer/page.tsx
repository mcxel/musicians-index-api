import { PersonaSwitcher } from '@/components/hud/PersonaSwitcher';
import PerformerHubDashboard from "@/components/performer/PerformerHubDashboard";

export default function PerformerHubPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#07071a', minHeight: '100vh' }}>
      <div style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(170,45,255,0.15)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#AA2DFF', textTransform: 'uppercase' }}>Performer Hub</span>
        <PersonaSwitcher currentRole="performer" compact />
      </div>
      <PerformerHubDashboard
        performerId="nova-cipher"
        displayName="Nova Cipher"
      />
    </div>
  );
}
