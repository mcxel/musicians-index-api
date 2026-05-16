"use client";
import React, { useState } from "react";
import type { FanProfile } from "@/lib/fan/FanProfileEngine";
import type { Achievement } from "@/lib/gamification/AchievementEngine";
import type { FanNotification } from "@/lib/fan/FanNotificationEngine";

interface FanDashboardProps {
  profile: FanProfile;
  unlockedAchievements: Achievement[];
  notifications: FanNotification[];
  onFollowToggle?: (targetId: string) => void;
  onMarkAllRead?: () => void;
}

type DashTab = "overview" | "achievements" | "history" | "following" | "notifications";

const LEVEL_COLORS = ["#64748b", "#34d399", "#60a5fa", "#a78bfa", "#ffd700", "#ff9f43", "#ff2daa", "#00ffff", "#ffd700", "#ffd700", "#ffd700"];

const RARITY_COLORS = {
  common: "#94a3b8",
  uncommon: "#34d399",
  rare: "#60a5fa",
  epic: "#a78bfa",
  legendary: "#ffd700",
};

export function FanDashboard({ profile, unlockedAchievements, notifications, onFollowToggle, onMarkAllRead }: FanDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashTab>("overview");

  const levelColor = LEVEL_COLORS[Math.min(profile.level, LEVEL_COLORS.length - 1)];
  const unreadCount = notifications.filter((n) => !n.readAtMs).length;

  const tabs: Array<{ id: DashTab; label: string; badge?: number }> = [
    { id: "overview", label: "Overview" },
    { id: "achievements", label: "Achievements", badge: unlockedAchievements.length },
    { id: "history", label: "History" },
    { id: "following", label: "Following", badge: profile.following.length },
    { id: "notifications", label: "Alerts", badge: unreadCount > 0 ? unreadCount : undefined },
  ];

  return (
    <div
      style={{
        background: "rgba(2,6,23,0.96)",
        border: "1px solid rgba(51,65,85,0.6)",
        borderRadius: 18,
        fontFamily: "system-ui, sans-serif",
        color: "#e2e8f0",
        overflow: "hidden",
        maxWidth: 640,
      }}
    >
      {/* Profile Header */}
      <div
        style={{
          background: `linear-gradient(135deg, rgba(15,23,42,0.9), ${levelColor}10)`,
          borderBottom: "1px solid rgba(51,65,85,0.4)",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${levelColor}, ${levelColor}60)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 900,
            color: "#0f172a",
            flexShrink: 0,
          }}
        >
          {profile.displayName.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0" }}>{profile.displayName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div
              style={{
                background: `${levelColor}20`,
                border: `1px solid ${levelColor}50`,
                color: levelColor,
                padding: "2px 10px",
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Level {profile.level}
            </div>
            <span style={{ fontSize: 11, color: "#64748b" }}>{profile.totalXP.toLocaleString()} XP</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", textAlign: "right" }}>
          {[
            { label: "Shows", value: profile.showsAttended },
            { label: "Votes", value: profile.totalVotesCast },
            { label: "Tips Sent", value: `$${profile.totalTipsSent.toFixed(0)}` },
            { label: "Fan Clubs", value: profile.fanClubs.length },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 15, fontWeight: 700, color: levelColor }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#64748b" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(51,65,85,0.4)", overflowX: "auto" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${levelColor}` : "2px solid transparent",
              color: activeTab === tab.id ? levelColor : "#64748b",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                style={{
                  background: activeTab === tab.id ? levelColor : "#ef4444",
                  color: "#0f172a",
                  borderRadius: 10,
                  padding: "1px 6px",
                  fontSize: 9,
                  fontWeight: 800,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 20px", minHeight: 280, maxHeight: 480, overflowY: "auto" }}>
        {/* Overview */}
        {activeTab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Member Since", value: new Date(profile.joinedAtMs).toLocaleDateString() },
                { label: "Last Active", value: new Date(profile.lastActiveMs).toLocaleDateString() },
                { label: "Achievements", value: unlockedAchievements.length },
                { label: "Fan Clubs", value: profile.fanClubs.length },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "rgba(15,23,42,0.7)",
                    border: "1px solid rgba(51,65,85,0.4)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#64748b" }}>{stat.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginTop: 3 }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Recent achievements */}
            {unlockedAchievements.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                  Recent Achievements
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {unlockedAchievements.slice(0, 6).map((a) => (
                    <div
                      key={a.id}
                      title={a.description}
                      style={{
                        background: `${RARITY_COLORS[a.rarity]}15`,
                        border: `1px solid ${RARITY_COLORS[a.rarity]}40`,
                        borderRadius: 8,
                        padding: "6px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{a.badgeIcon}</span>
                      <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{a.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Achievements */}
        {activeTab === "achievements" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {unlockedAchievements.length === 0 && (
              <div style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>No achievements yet. Keep going!</div>
            )}
            {unlockedAchievements.map((a) => (
              <div
                key={a.id}
                style={{
                  background: "rgba(15,23,42,0.7)",
                  border: `1px solid ${RARITY_COLORS[a.rarity]}30`,
                  borderLeft: `3px solid ${RARITY_COLORS[a.rarity]}`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 22 }}>{a.badgeIcon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.description}</div>
                </div>
                <div style={{ fontSize: 11, color: RARITY_COLORS[a.rarity], fontWeight: 600, textTransform: "capitalize" }}>
                  {a.rarity}
                </div>
                <div style={{ fontSize: 11, color: "#ffd700", fontWeight: 700 }}>+{a.xpReward} XP</div>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div>
            {profile.showHistory.length === 0 && (
              <div style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>No shows attended yet.</div>
            )}
            {profile.showHistory.slice(0, 20).map((show, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(51,65,85,0.2)",
                  fontSize: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "#e2e8f0" }}>{show.showTitle}</div>
                  <div style={{ color: "#64748b" }}>{new Date(show.attendedAtMs).toLocaleDateString()} · {show.durationMinutes}min</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#ffd700", fontWeight: 700 }}>+{show.xpEarned} XP</div>
                  {show.tipsSent > 0 && <div style={{ color: "#00ff88", fontSize: 11 }}>${show.tipsSent} tipped</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Following */}
        {activeTab === "following" && (
          <div>
            {profile.following.length === 0 && (
              <div style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>Not following anyone yet.</div>
            )}
            {profile.following.map((f) => (
              <div
                key={f.targetId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(51,65,85,0.2)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{f.targetName}</div>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "capitalize" }}>{f.targetType.replace(/_/g, " ")}</div>
                </div>
                {onFollowToggle && (
                  <button
                    onClick={() => onFollowToggle(f.targetId)}
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#ef4444",
                      padding: "4px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 11,
                    }}
                  >
                    Unfollow
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <div>
            {unreadCount > 0 && onMarkAllRead && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <button
                  onClick={onMarkAllRead}
                  style={{
                    background: "none",
                    border: "1px solid rgba(51,65,85,0.5)",
                    color: "#64748b",
                    padding: "4px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 11,
                  }}
                >
                  Mark all read
                </button>
              </div>
            )}
            {notifications.length === 0 && (
              <div style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>No notifications</div>
            )}
            {notifications.slice(0, 25).map((notif) => (
              <div
                key={notif.notificationId}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(51,65,85,0.2)",
                  opacity: notif.readAtMs ? 0.6 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: notif.readAtMs ? "#94a3b8" : "#e2e8f0" }}>
                    {!notif.readAtMs && (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: levelColor, display: "inline-block", marginRight: 6 }} />
                    )}
                    {notif.title}
                  </div>
                  <div style={{ fontSize: 10, color: "#475569" }}>
                    {new Date(notif.createdAtMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{notif.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
