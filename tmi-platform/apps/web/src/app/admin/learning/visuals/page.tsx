import { visualEvolutionEngine } from '@/lib/learning/VisualEvolutionEngine';
import { getLearningHeatmap, listLearningMutationLog } from '@/lib/learning/LearningSafetyEngine';

export default function AdminLearningVisualsPage() {
  const variants = visualEvolutionEngine.analyzeVisualVariants(30);
  const promote = variants.filter((variant) => variant.recommendation === 'promote');
  const retire = variants.filter((variant) => variant.recommendation === 'retire');
  const mutationLog = listLearningMutationLog(60).filter((record) =>
    record.engine.includes('Visual') || record.engine.includes('CameraFocusReactionEngine'),
  );
  const heatmap = getLearningHeatmap().filter((row) => row.key.toLowerCase().includes('visual'));

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Learning: Visual Evolution</h1>
      <p style={{ color: '#9befff' }}>Promote winners, iterate mid-tier, retire weak visual variants.</p>

      <h2>Promote</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(promote, null, 2)}
      </pre>

      <h2>Retire</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #00ffff33', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(retire, null, 2)}
      </pre>

      <h2>Confidence + Before/After (Visual Mutations)</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #aa2dff44', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(
          mutationLog.map((record) => ({
            engine: record.engine,
            metric: record.metric,
            confidence: record.confidence,
            before: record.beforeValue,
            after: record.appliedValue,
            status: record.status,
          })),
          null,
          2,
        )}
      </pre>

      <h2>Learning Heatmap</h2>
      <pre style={{ background: '#0b0b1a', border: '1px solid #ffd70044', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
        {JSON.stringify(heatmap, null, 2)}
      </pre>
    </main>
  );
}
