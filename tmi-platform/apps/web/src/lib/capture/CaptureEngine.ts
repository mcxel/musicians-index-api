export type CaptureType =
  | 'group_photo'
  | 'selfie'
  | 'stage_shot'
  | 'trophy_shot'
  | 'event_poster';

export interface MemoryContext {
  roomId?: string;
  eventId?: string;
  playlistId?: string;
  performerIds?: string[];
  venueId?: string;
  captureType: CaptureType;
  timestamp: string;
}

export interface SnapResult {
  dataUrl: string;
  width: number;
  height: number;
}

export const CAPTURE_TYPE_META: Record<CaptureType, { label: string; icon: string; xp: number; description: string }> = {
  group_photo:  { label: 'Group Photo',   icon: '📸', xp: 25,  description: 'Everyone on stage' },
  selfie:       { label: 'Selfie',         icon: '🤳', xp: 15,  description: 'You + the room'    },
  stage_shot:   { label: 'Stage Shot',     icon: '🎤', xp: 20,  description: 'Just the stage'    },
  trophy_shot:  { label: 'Trophy Shot',    icon: '🏆', xp: 50,  description: 'Win moment'        },
  event_poster: { label: 'Event Poster',   icon: '🎟', xp: 10,  description: 'Event card'        },
};

export async function snapElement(element: HTMLElement, scale = 2): Promise<SnapResult> {
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#050510',
    logging: false,
    removeContainer: true,
  });
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  return { dataUrl, width: canvas.width, height: canvas.height };
}

export async function snapSelector(selector: string, fallbackSelector?: string): Promise<SnapResult | null> {
  if (typeof window === 'undefined') return null;
  const el = document.querySelector<HTMLElement>(selector)
    ?? (fallbackSelector ? document.querySelector<HTMLElement>(fallbackSelector) : null)
    ?? document.body;
  return snapElement(el);
}

export function buildEventPosterDataUrl(context: {
  eventName: string;
  roomId: string;
  date: string;
  performerName?: string;
  accentColor?: string;
}): string {
  const c = context;
  const color = c.accentColor ?? '#FF2DAA';
  const canvas = document.createElement('canvas');
  canvas.width = 800; canvas.height = 600;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, 800, 600);

  // Neon border
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 780, 580);

  // TMI logo text
  ctx.font = 'bold 72px monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText('TMI', 400, 120);

  // Event name
  ctx.font = 'bold 36px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(c.eventName, 400, 220);

  if (c.performerName) {
    ctx.font = '24px monospace';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(c.performerName, 400, 270);
  }

  ctx.font = '18px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText(c.date, 400, 340);
  ctx.fillText(`Room: ${c.roomId}`, 400, 370);

  // Watermark
  ctx.font = '14px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillText('themusiciansindex.com', 400, 560);

  return canvas.toDataURL('image/jpeg', 0.9);
}
