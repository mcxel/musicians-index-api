import type { CardCanvasItem } from './cardCanvas.engine';

export function reorderCanvasItems(items: CardCanvasItem[], activeId: string, overId: string): CardCanvasItem[] {
  const from = items.findIndex((item) => item.id === activeId);
  const to = items.findIndex((item) => item.id === overId);
  if (from < 0 || to < 0 || from === to) return items;

  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  return next.map((item, index) => ({
    ...item,
    y: index,
    priority: (index + 1) * 10,
  }));
}
