export interface LobbyWallCard {
  id: string;
  title: string;
  route: string;
  live: boolean;
}

export function buildLobbyWallRuntimeCards(cards: Array<Omit<LobbyWallCard, "live"> & { occupancy: number }>): LobbyWallCard[] {
  return cards.map((card) => ({
    id: card.id,
    title: card.title,
    route: card.route,
    live: card.occupancy > 0,
  }));
}
