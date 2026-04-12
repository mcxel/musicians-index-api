import DraggableCard from './DraggableCard';
import StatusRibbon from './StatusRibbon';

export default function BillboardPreviewCard() {
  return (
    <DraggableCard colSpan={4} accent="gold">
      <StatusRibbon label="Billboard" />
      <h3 style={{ margin: '10px 0 4px', fontSize: 18, color: '#f8fafc' }}>Sponsor Billboard</h3>
      <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1' }}>High-impact visual slot with campaign telemetry and rotating creatives.</p>
    </DraggableCard>
  );
}
