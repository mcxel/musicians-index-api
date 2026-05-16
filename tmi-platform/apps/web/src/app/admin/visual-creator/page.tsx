import VisualPromptBuilder from '@/components/ai-visuals/VisualPromptBuilder';
import PlaceholderReplacementPanel from '@/components/ai-visuals/PlaceholderReplacementPanel';
import AssetApprovalQueue from '@/components/ai-visuals/AssetApprovalQueue';

export default function AdminVisualCreatorPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Admin Visual Creator</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
          <VisualPromptBuilder />
          <PlaceholderReplacementPanel />
        </div>
        <AssetApprovalQueue status='draft' />
      </div>
    </main>
  );
}
