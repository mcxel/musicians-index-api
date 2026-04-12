import type { HomepageLayoutSlot } from '../homepage-layout-map';

export interface CardCanvasItem {
  id: string;
  beltId: string;
  x: number;
  y: number;
  colSpan: number;
  rowSpan: number;
  priority: number;
}

export function buildCardCanvas(layout: HomepageLayoutSlot[]): CardCanvasItem[] {
  let y = 0;
  return layout
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map((slot) => {
      const item: CardCanvasItem = {
        id: slot.id,
        beltId: slot.beltId,
        x: 0,
        y,
        colSpan: slot.colSpan,
        rowSpan: slot.rowSpan,
        priority: slot.priority,
      };
      y += slot.rowSpan;
      return item;
    });
}
