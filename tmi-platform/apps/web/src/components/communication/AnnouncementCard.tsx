'use client';
// AnnouncementCard.tsx — Platform announcement — appears on /announcements and as notification
// Copilot wires: useAnnouncements({ limit: 10 })
// Proof: announcements load, Big Ace can post new ones from /admin/command-center
export function AnnouncementCard({ title, body, author, timestamp, priority = 'normal' }: { title: string; body: string; author?: string; timestamp?: Date; priority?: 'normal'|'high'|'emergency' }) {
  return (
    <div className={`tmi-announcement tmi-announcement--${priority}`}>
      {priority === 'emergency' && <div className="tmi-announcement__emergency-badge">⚠️ Emergency</div>}
      <div className="tmi-announcement__title">{title}</div>
      <div className="tmi-announcement__body">{body}</div>
      {author && <div className="tmi-announcement__author">— {author}</div>}
      {timestamp && <div className="tmi-announcement__time">{new Date(timestamp).toLocaleDateString()}</div>}
    </div>
  );
}
