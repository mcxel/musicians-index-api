import BotOperationsWall from "@/components/admin/BotOperationsWall";

export const metadata = {
  title: "Bot Operations | TMI Admin",
  description: "TMI permanent bot operations management panel",
};

export default function BotOperationsPage() {
  return <BotOperationsWall adminRole="admin" />;
}
