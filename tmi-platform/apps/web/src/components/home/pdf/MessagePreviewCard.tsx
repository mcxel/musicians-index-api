import DraggableCard from './DraggableCard';
import StatusRibbon from './StatusRibbon';

export default function MessagePreviewCard() {
  return (
    <DraggableCard colSpan={6} accent="cyan">
      <StatusRibbon label="Messages" />
      <h3 style={{ margin: '10px 0 4px', fontSize: 18, color: '#f8fafc' }}>Direct Thread Pulse</h3>
      <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1' }}>Unread highlights, role badges, and rapid jump to room context.</p>
    </DraggableCard>
  );
}
