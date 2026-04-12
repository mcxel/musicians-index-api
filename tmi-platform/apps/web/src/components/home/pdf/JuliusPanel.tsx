import DraggableCard from './DraggableCard';
import StatusRibbon from './StatusRibbon';

export default function JuliusPanel() {
  return (
    <DraggableCard colSpan={12} accent="pink">
      <StatusRibbon label="Julius Control" />
      <h3 style={{ margin: '10px 0 4px', fontSize: 20, color: '#f8fafc' }}>Control Layer / Host Intelligence</h3>
      <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1' }}>Operational prompts, governance flags, and emergency live routing controls.</p>
    </DraggableCard>
  );
}
