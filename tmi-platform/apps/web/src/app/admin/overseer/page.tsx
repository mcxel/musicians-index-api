import WorkspaceManager from "@/components/admin/overseer/workspace/WorkspaceManager";

export const metadata = {
  title: "Overseer Deck | TMI Admin",
  description: "Canonical broadcast command deck for administration operations.",
};

export default function OverseerDeckPage() {
  return <WorkspaceManager />;
}
