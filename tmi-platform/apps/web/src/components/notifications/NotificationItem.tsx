'use client';
// NotificationItem.tsx — Single notification row with type icon + read state
// Copilot wires: data from useNotifications, markRead(notifId)
// Proof: unread shows bold, read shows normal, click marks read + navigates
export function NotificationItem({ id, type, message, time, isRead, href }: {
  id: string; type: string; message: string; time: string; isRead: boolean; href?: string;
}) {
  const ICONS: Record<string,string> = {
    live:'🎤', battle:'⚔️', tip:'💰', follow:'👤', crown:'👑',
    tier:'⭐', booking:'📅', collab:'🤝', broadcast:'📢', default:'🔔'
  };
  return (
    <a href={href || '#'} className={`tmi-notif-item${isRead ? ' tmi-notif-item--read' : ''}`}>
      <span className="tmi-notif-item__icon" aria-hidden="true">{ICONS[type] || ICONS.default}</span>
      <div className="tmi-notif-item__body">
        <span className="tmi-notif-item__text">{message}</span>
        <span className="tmi-notif-item__time">{time}</span>
      </div>
      {!isRead && <span className="tmi-notif-item__dot" aria-label="Unread" />}
    </a>
  );
}
