'use client';
// NotificationPanel.tsx — Dropdown panel: last 20 notifications
// Copilot wires: useNotifications(userId, { limit:20 }), markAllRead()
// Proof: notifications load, mark-all-read clears badge
export function NotificationPanel({ userId }: { userId: string }) {
  return (
    <div className="tmi-notif-panel" role="dialog" aria-label="Notifications">
      <div className="tmi-notif-panel__header">
        <span>Notifications</span>
        <button className="tmi-btn-ghost tmi-btn--xs">Mark all read</button>
      </div>
      <div className="tmi-notif-panel__list" data-slot="notifications">
        {/* Copilot maps notification items */}
        <div className="tmi-notif-item tmi-placeholder">
          <span className="tmi-notif-item__icon">🎤</span>
          <div className="tmi-notif-item__body">
            <span className="tmi-notif-item__text">Artist X is now live</span>
            <span className="tmi-notif-item__time">2m ago</span>
          </div>
        </div>
      </div>
      <a href="/notifications" className="tmi-notif-panel__footer">See all notifications →</a>
    </div>
  );
}
