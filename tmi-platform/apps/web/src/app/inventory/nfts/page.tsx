import Link from "next/link";
import RoleGate from '@/components/auth/RoleGate';

const nfts = ["tmi-avatar-105329", "tmi-avatar-339244", "tmi-avatar-673410"];

const fallback = (
  <main style={{ minHeight: '100vh', background: '#050510', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
    <div style={{ fontSize: 52 }}>🎭</div>
    <div style={{ color: '#FF2DAA', fontSize: 12, letterSpacing: 4, textTransform: 'uppercase' }}>Fan Accounts Only</div>
    <p style={{ color: '#aaa', fontSize: 15, margin: 0 }}>NFT inventory is exclusive to Fan accounts.</p>
    <Link href="/hub" style={{ padding: '10px 28px', background: 'rgba(255,45,170,0.12)', border: '1px solid #FF2DAA', borderRadius: 8, color: '#FF2DAA', fontSize: 13, textDecoration: 'none' }}>← Back to Hub</Link>
  </main>
);

export default function InventoryNftsPage() {
  return (
    <RoleGate allow={['FAN', 'ADMIN', 'STAFF']} fallback={fallback}>
    <main style={{ minHeight: "100vh", background: "#0e0818", padding: 20 }}>
      <section style={{ maxWidth: 860, margin: "0 auto", border: "1px solid #5d3f86", borderRadius: 16, background: "#150d23", padding: 20 }}>
        <h1 style={{ color: "#f4ebff", marginTop: 0 }}>Inventory NFTs</h1>
        <ul style={{ color: "#d4c3ea", lineHeight: 1.7 }}>
          {nfts.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
        <Link href="/inventory" style={{ color: "#bde7ff" }}>Back to inventory hub</Link>
      </section>
    </main>
    </RoleGate>
  );
}
