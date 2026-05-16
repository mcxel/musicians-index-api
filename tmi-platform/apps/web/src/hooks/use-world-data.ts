type WorldData = {
  id: string;
  name: string;
  description: string;
};

export function useWorldData(worldId?: string) {
  const world: WorldData = {
    id: worldId ?? "world-1",
    name: worldId ? `World ${worldId.replace("world-", "")}` : "World 1",
    description: "Global platform pulse and controls.",
  };

  return {
    data: [],
    loading: false,
    error: null as string | null,
    world,
    isLoading: false,
  };
}
