export type TicketSceneRecord = {
  sceneId: string;
  ticketId: string;
  eventId: string;
  seatZone: string;
  priceTier: string;
  templateId: string;
  qrSlotId: string;
  visualStyle: string;
  createdAt: number;
};

const ticketScenes = new Map<string, TicketSceneRecord>();

export function composeTicketScene(input: Omit<TicketSceneRecord, 'createdAt'>): TicketSceneRecord {
  const next: TicketSceneRecord = {
    ...input,
    createdAt: Date.now(),
  };

  ticketScenes.set(next.sceneId, next);
  return next;
}

export function listTicketScenes(): TicketSceneRecord[] {
  return [...ticketScenes.values()].sort((a, b) => b.createdAt - a.createdAt);
}
