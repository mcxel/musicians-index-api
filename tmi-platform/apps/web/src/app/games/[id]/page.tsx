import GameRouteShell from "@/components/game/GameRouteShell";

export default function GameDynamicPage({ params }: { params: { id: string } }) {
  return <GameRouteShell gameId={params.id} />;
}
