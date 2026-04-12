import DraggableCard from './DraggableCard';
import StatusRibbon from './StatusRibbon';

export default function InvitePreviewCard() {
  return (
    <DraggableCard colSpan={6} accent="gold">
      <StatusRibbon label="Invites" />
      <h3 style={{ margin: '10px 0 4px', fontSize: 18, color: '#f8fafc' }}>Lobby Invite Queue</h3>
      <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1' }}>Pending room invites with expiry windows and one-click acceptance.</p>
    </DraggableCard>
  );
}
