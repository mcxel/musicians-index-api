'use client';
// NotificationBell.tsx — Bell icon with unread count badge in nav
// Copilot wires: useUnreadNotificationCount(userId)
// Proof: badge shows count, click opens NotificationPanel, reads clear count
export function NotificationBell({ userId }: { userId: string }) {
  return (
    <div className="tmi-notif-bell" role="button" aria-label="Notifications" tabIndex={0}>
      <span className="tmi-notif-bell__icon" aria-hidden="true">🔔</span>
      <span className="tmi-notif-bell__badge" data-slot="unread-count" aria-live="polite">0</span>
    </div>
  );
}
