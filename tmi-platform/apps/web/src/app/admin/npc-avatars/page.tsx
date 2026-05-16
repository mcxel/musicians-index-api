import NpcAvatarControlWall from "@/components/admin/NpcAvatarControlWall";

export default function AdminNpcAvatarsPage() {
  return (
    <main data-testid="admin-npc-avatars-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <h1 style={{ color: "#67e8f9" }}>Admin NPC Avatars</h1>
      <NpcAvatarControlWall />
    </main>
  );
}
