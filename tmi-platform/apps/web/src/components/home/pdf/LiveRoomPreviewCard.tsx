import DraggableCard from './DraggableCard';
import StatusRibbon from './StatusRibbon';

export default function LiveRoomPreviewCard() {
  return (
    <DraggableCard colSpan={4} accent="pink">
      <StatusRibbon label="Live Room" live />
      <h3 style={{ margin: '10px 0 4px', fontSize: 18, color: '#f8fafc' }}>Cypher Arena</h3>
      <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1' }}>Live queue, crowd vote pressure, and performer spotlight scoring.</p>
    </DraggableCard>
  );
}
