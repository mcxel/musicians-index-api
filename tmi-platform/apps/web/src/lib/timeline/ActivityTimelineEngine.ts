export type TimelineEventType =
  | 'PHOTO_CAPTURED'
  | 'CONCERT_ATTENDED'
  | 'CONTEST_WON'
  | 'EVENT_JOINED'
  | 'MEMORY_SHARED'
  | 'MEMORY_SAVED'
  | 'TROPHY_WON'
  | 'BATTLE_ENTERED'
  | 'CYPHER_ENTERED'
  | 'FIRST_CONCERT'
  | 'FIRST_CYPHER'
  | 'FIRST_BATTLE'
  | 'FIRST_TROPHY';

export interface TimelineEvent {
  id: string;
  userId: string;
  type: TimelineEventType;
  label: string;
  roomId?: string;
  eventId?: string;
  captureType?: string;
  xpEarned?: number;
  imagePreview?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const STORAGE_KEY = 'tmi_activity_timeline';
const MAX_EVENTS = 500;

const EVENT_LABELS: Record<TimelineEventType, string> = {
  PHOTO_CAPTURED:   '📸 Captured Memory',
  CONCERT_ATTENDED: '🎤 Attended Concert',
  CONTEST_WON:      '🏆 Won Contest',
  EVENT_JOINED:     '🎟 Attended Event',
  MEMORY_SHARED:    '📤 Shared Memory',
  MEMORY_SAVED:     '💾 Saved Memory',
  TROPHY_WON:       '🏅 Trophy Earned',
  BATTLE_ENTERED:   '⚔️ Entered Battle',
  CYPHER_ENTERED:   '🎤 Dropped in Cypher',
  FIRST_CONCERT:    '🌟 First Concert',
  FIRST_CYPHER:     '🌟 First Cypher',
  FIRST_BATTLE:     '🌟 First Battle',
  FIRST_TROPHY:     '🌟 First Trophy',
};

export class ActivityTimelineEngine {
  static getEvents(userId: string): TimelineEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}:${userId}`);
      return raw ? (JSON.parse(raw) as TimelineEvent[]) : [];
    } catch {
      return [];
    }
  }

  static addEvent(event: Omit<TimelineEvent, 'id' | 'timestamp'>): TimelineEvent {
    const full: TimelineEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      label: event.label || EVENT_LABELS[event.type] || '✦ TMI Activity',
      timestamp: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        const existing = this.getEvents(event.userId);
        const updated = [full, ...existing].slice(0, MAX_EVENTS);
        localStorage.setItem(`${STORAGE_KEY}:${event.userId}`, JSON.stringify(updated));
      } catch {}

      window.dispatchEvent(new CustomEvent('TMI_TIMELINE_UPDATE', { detail: full }));
    }

    return full;
  }

  static getLabel(type: TimelineEventType): string {
    return EVENT_LABELS[type] ?? '✦ TMI Activity';
  }

  static hasFirstEvent(userId: string, type: TimelineEventType): boolean {
    return this.getEvents(userId).some(e => e.type === type);
  }

  static checkAndGrantFirstCollection(userId: string, type: TimelineEventType): TimelineEvent | null {
    const firstTypeMap: Partial<Record<TimelineEventType, TimelineEventType>> = {
      CONCERT_ATTENDED: 'FIRST_CONCERT',
      CYPHER_ENTERED:   'FIRST_CYPHER',
      BATTLE_ENTERED:   'FIRST_BATTLE',
      TROPHY_WON:       'FIRST_TROPHY',
    };
    const firstType = firstTypeMap[type];
    if (!firstType) return null;
    if (this.hasFirstEvent(userId, firstType)) return null;
    return this.addEvent({ userId, type: firstType, label: EVENT_LABELS[firstType], xpEarned: 100 });
  }
}
