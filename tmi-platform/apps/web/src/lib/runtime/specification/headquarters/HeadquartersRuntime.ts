export type HeadquartersRole = "fan" | "performer" | "venue" | "writer" | "admin";

export interface HeadquartersZone {
  zoneId: "identity" | "avatar" | "media" | "memory" | "quick-actions" | "activity";
  visible: boolean;
}

export interface HeadquartersRuntime {
  listZones(role: HeadquartersRole): Promise<HeadquartersZone[]>;
}
