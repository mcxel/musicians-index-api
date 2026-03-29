'use client';
// NotificationPreferencesPanel.tsx — Toggle notification types per channel
// Copilot wires: useNotificationPreferences(userId), savePreferences()
// Proof: toggles save correctly, preferences persist on reload
export function NotificationPreferencesPanel({ userId }: { userId: string }) {
  const categories = [
    { id:'turn_coming', label:'Your turn coming up', channels:['app','push'] },
    { id:'battle_invite', label:'Battle invites', channels:['app','push'] },
    { id:'new_follower', label:'New follower', channels:['app'] },
    { id:'tip_received', label:'Tips received', channels:['app','email'] },
    { id:'room_live', label:'Followed artist goes live', channels:['push'] },
    { id:'crown_earned', label:'Crown earned', channels:['app','push','email'] },
    { id:'platform_broadcast', label:'Platform announcements', channels:['app','push'] },
  ];
  return (
    <div className="tmi-notif-prefs">
      <div className="tmi-notif-prefs__header">Notification Preferences</div>
      <div className="tmi-notif-prefs__table">
        <div className="tmi-notif-prefs__col-headers">
          <span>Type</span><span>In-App</span><span>Push</span><span>Email</span>
        </div>
        {categories.map(c => (
          <div key={c.id} className="tmi-notif-prefs__row">
            <span className="tmi-notif-prefs__row-label">{c.label}</span>
            {['app','push','email'].map(ch => (
              <label key={ch} className="tmi-notif-prefs__toggle">
                <input
                  type="checkbox"
                  defaultChecked={c.channels.includes(ch)}
                  disabled={!c.channels.includes(ch)}
                  aria-label={`${c.label} via ${ch}`}
                />
              </label>
            ))}
          </div>
        ))}
      </div>
      <button className="tmi-btn-primary">Save Preferences</button>
    </div>
  );
}
