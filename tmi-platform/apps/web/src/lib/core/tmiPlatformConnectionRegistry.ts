export type TmiPlatformConnection = {
  systemId: string;
  route: string;
  panelId: string;
  observableByAdmin: boolean;
  monitorFeed: "live" | "simulated" | "locked";
  backRoute: string;
};

const CONNECTIONS = new Map<string, TmiPlatformConnection>();

export function registerPlatformConnection(connection: TmiPlatformConnection): void {
  CONNECTIONS.set(connection.systemId, connection);
}

export function listPlatformConnections(): TmiPlatformConnection[] {
  return [...CONNECTIONS.values()];
}
