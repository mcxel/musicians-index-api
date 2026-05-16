export type TmiWorldNodeType =
  | "world"
  | "venue"
  | "room"
  | "stage"
  | "seat-zone"
  | "screen"
  | "overlay"
  | "sponsor-slot"
  | "ad-slot"
  | "camera-point";

export type TmiWorldConnectionNode = {
  id: string;
  type: TmiWorldNodeType;
  route: string;
  backRoute: string;
  linkedSystems: string[];
  locked?: boolean;
  lockReason?: string;
};

const NODES = new Map<string, TmiWorldConnectionNode>();

export function registerWorldNode(node: TmiWorldConnectionNode): void {
  NODES.set(node.id, node);
}

export function listWorldNodes(): TmiWorldConnectionNode[] {
  return [...NODES.values()];
}

export function getWorldNode(id: string): TmiWorldConnectionNode | undefined {
  return NODES.get(id);
}
