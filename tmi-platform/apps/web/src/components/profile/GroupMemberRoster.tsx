"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { GroupProfileMetadata, GroupMember } from "@/lib/profile/PublicProfileStyleEngine";

export interface ExtendedGroupMember extends GroupMember {
  instrument?: string;
  presenceStatus?: "Available to Jam" | "Online" | "Rehearsing" | "Producing" | "Offline";
  isFriend?: boolean;
}

interface GroupMemberRosterProps {
  metadata: GroupProfileMetadata;
  accentColor?: string;
  isOwner?: boolean;
  groupId?: string;
  onEditRoster?: () => void;
  onSelectMember?: (member: GroupMember) => void;
  onStartDirectMessage?: (member: GroupMember) => void;
  onStartGroupConversation?: (members: GroupMember[]) => void;
  onInviteToLounge?: (members: GroupMember[]) => void;
  onToggleFriend?: (memberId: string) => void;
}

export default function GroupMemberRoster({
  metadata,
  accentColor = "#FF2DAA",
  isOwner = false,
  groupId = "group-canonical",
  onEditRoster,
  onSelectMember,
  onStartDirectMessage,
  onStartGroupConversation,
  onInviteToLounge,
  onToggleFriend,
}: GroupMemberRosterProps) {
  const { groupName, formationYear, genre, originCity, originCountry, members, tourDates } = metadata;

  // Local interactive state for Directory + Actions + Multi-Select
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeMember, setActiveMember] = useState<ExtendedGroupMember | null>(null);
  const [friendMap, setFriendMap] = useState<Record<string, boolean>>({});
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  function toggleSelectId(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleCardClick(member: ExtendedGroupMember) {
    if (selectMode) {
      toggleSelectId(member.id);
      return;
    }
    setActiveMember(member);
    onSelectMember?.(member);
  }

  function handleFriendToggle(memberId: string) {
    setFriendMap((prev) => {
      const current = Boolean(prev[memberId]);
      const nextState = !current;
      setFeedbackNotice(nextState ? "Friend request sent!" : "Friendship updated");
      setTimeout(() => setFeedbackNotice(null), 3000);
      return { ...prev, [memberId]: nextState };
    });
    onToggleFriend?.(memberId);
  }

  function handleDirectMessage(member: ExtendedGroupMember) {
    setActiveMember(null);
    if (onStartDirectMessage) {
      onStartDirectMessage(member);
    } else {
      window.location.href = `/messages?recipientId=${encodeURIComponent(member.id)}&returnToGroup=/groups/${encodeURIComponent(groupId)}`;
    }
  }

  function handleStartMultiConversation() {
    const selectedMembers = members.filter((m) => selectedIds.has(m.id));
    if (selectedMembers.length === 0) return;

    if (onStartGroupConversation) {
      onStartGroupConversation(selectedMembers);
    } else {
      const idsParam = Array.from(selectedIds).join(",");
      window.location.href = `/messages?recipientIds=${encodeURIComponent(idsParam)}&kind=group&title=${encodeURIComponent(groupName + " Chat")}&returnToGroup=/groups/${encodeURIComponent(groupId)}`;
    }
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function handleMultiInviteLounge() {
    const selectedMembers = members.filter((m) => selectedIds.has(m.id));
    if (selectedMembers.length === 0) return;
    if (onInviteToLounge) {
      onInviteToLounge(selectedMembers);
    } else {
      setFeedbackNotice(`Invited ${selectedMembers.length} members to Lounge`);
      setTimeout(() => setFeedbackNotice(null), 3000);
    }
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  return (
    <section
      data-testid="group-member-roster"
      style={{
        margin: "0 0 32px 0",
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(22, 8, 30, 0.95), rgba(6, 4, 18, 0.98))",
        border: `1.5px solid ${accentColor}44`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.6), 0 0 20px ${accentColor}18`,
        padding: "24px",
        position: "relative",
      }}
    >
      {/* Toast Notice */}
      {feedbackNotice && (
        <div
          data-testid="roster-feedback-notice"
          style={{
            position: "absolute",
            top: 12,
            right: 20,
            background: "#00FFFF",
            color: "#050510",
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.06em",
            boxShadow: "0 4px 12px rgba(0,255,255,0.4)",
            zIndex: 100,
          }}
        >
          {feedbackNotice}
        </div>
      )}

      {/* Roster Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>👥</span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.2em",
                color: accentColor,
                textTransform: "uppercase",
              }}
            >
              THE COLLECTIVE · MEMBER DIRECTORY
            </span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 4 }}>
            {groupName} Official Lineup
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            Est. {formationYear || "2024"} · {originCity}, {originCountry} · {genre}
          </div>
        </div>

        {/* Action Controls: Multi-Select Mode & Manage */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            data-testid="btn-toggle-select-mode"
            onClick={() => {
              setSelectMode(!selectMode);
              if (selectMode) setSelectedIds(new Set());
            }}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              background: selectMode ? "#00FFFF" : "rgba(255,255,255,0.06)",
              border: `1px solid ${selectMode ? "#00FFFF" : "rgba(255,255,255,0.18)"}`,
              color: selectMode ? "#050510" : "#fff",
              fontSize: 9,
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {selectMode ? "✕ CANCEL SELECT" : "☑ SELECT MEMBERS"}
          </button>

          {isOwner && onEditRoster && (
            <button
              type="button"
              onClick={onEditRoster}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${accentColor}55`,
                color: accentColor,
                fontSize: 9,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              ✏ MANAGE ROSTER
            </button>
          )}
        </div>
      </div>

      {/* Member Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 16,
        }}
      >
        {members.map((member) => {
          const isSelected = selectedIds.has(member.id);
          const isFriend = Boolean(friendMap[member.id] ?? (member as ExtendedGroupMember).isFriend);
          const presence = (member as ExtendedGroupMember).presenceStatus ?? "Available to Jam";

          return (
            <div
              key={member.id}
              data-testid={`member-card-${member.id}`}
              onClick={() => handleCardClick(member as ExtendedGroupMember)}
              style={{
                padding: "16px",
                borderRadius: 12,
                background: isSelected ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${isSelected ? "#00FFFF" : "rgba(255,255,255,0.08)"}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                transition: "transform 0.18s, border-color 0.18s",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {/* Select Checkbox */}
              {selectMode && (
                <div
                  data-testid={`member-checkbox-${member.id}`}
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: `1.5px solid ${isSelected ? "#00FFFF" : "rgba(255,255,255,0.3)"}`,
                    background: isSelected ? "#00FFFF" : "rgba(0,0,0,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#050510",
                    fontWeight: 900,
                  }}
                >
                  {isSelected && "✓"}
                </div>
              )}

              {/* Presence Indicator */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 8,
                  fontWeight: 800,
                  color: presence.includes("Available") ? "#00FF88" : "#00FFFF",
                  background: "rgba(0,0,0,0.5)",
                  padding: "2px 6px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span style={{ fontSize: 7 }}>●</span>
                <span>{presence}</span>
              </div>

              {/* Member Avatar */}
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `2px solid ${isSelected ? "#00FFFF" : accentColor + "88"}`,
                  boxShadow: `0 0 14px ${isSelected ? "rgba(0,255,255,0.4)" : accentColor + "33"}`,
                  margin: "6px 0 10px 0",
                  background: "#000",
                }}
              >
                <img
                  src={member.avatarUrl || "/tmi-curated/mag-20.jpg"}
                  alt={member.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{member.name}</div>
              <div
                style={{
                  fontSize: 10,
                  color: accentColor,
                  fontWeight: 800,
                  marginTop: 2,
                  letterSpacing: "0.06em",
                }}
              >
                {member.role.toUpperCase()}
              </div>

              {/* Friendship Indicator */}
              {isFriend && (
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    color: "#FFD700",
                    letterSpacing: "0.1em",
                    marginTop: 4,
                  }}
                >
                  FRIENDS ✓
                </div>
              )}

              {/* Quick Action Hint */}
              <span
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  fontSize: 8,
                  fontWeight: 800,
                  color: isSelected ? "#00FFFF" : "rgba(255,255,255,0.6)",
                  letterSpacing: "0.1em",
                }}
              >
                {selectMode ? (isSelected ? "SELECTED ✓" : "TAP TO SELECT") : "VIEW ACTIONS →"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Floating Multi-Select Action Bar */}
      {selectMode && selectedIds.size > 0 && (
        <div
          data-testid="multi-select-action-bar"
          style={{
            position: "sticky",
            bottom: 12,
            marginTop: 20,
            background: "rgba(10, 8, 24, 0.96)",
            border: "1.5px solid #00FFFF",
            boxShadow: "0 8px 24px rgba(0,0,0,0.8), 0 0 16px rgba(0,255,255,0.3)",
            borderRadius: 12,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            zIndex: 90,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14 }}>👥</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>
              {selectedIds.size} {selectedIds.size === 1 ? "Member" : "Members"} Selected
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              data-testid="btn-start-group-convo"
              onClick={handleStartMultiConversation}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                background: "#AA2DFF",
                border: "none",
                color: "#fff",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(170,45,255,0.4)",
              }}
            >
              💬 START GROUP CHAT
            </button>

            <button
              type="button"
              data-testid="btn-multi-invite-lounge"
              onClick={handleMultiInviteLounge}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                background: "#00FFFF",
                border: "none",
                color: "#050510",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(0,255,255,0.4)",
              }}
            >
              🍸 INVITE TO LOUNGE
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 10,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              CLEAR
            </button>
          </div>
        </div>
      )}

      {/* Member Action Card Modal */}
      {activeMember && (
        <div
          data-testid="member-action-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setActiveMember(null)}
        >
          <div
            data-testid="member-action-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 380,
              background: "linear-gradient(145deg, #120822, #070514)",
              border: "1.5px solid rgba(0,255,255,0.3)",
              borderRadius: 16,
              boxShadow: "0 16px 40px rgba(0,0,0,0.9), 0 0 24px rgba(0,255,255,0.2)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {/* Modal Avatar */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                overflow: "hidden",
                border: `3px solid ${accentColor}`,
                boxShadow: `0 0 18px ${accentColor}44`,
                marginBottom: 12,
                background: "#000",
              }}
            >
              <img
                src={activeMember.avatarUrl || "/tmi-curated/mag-20.jpg"}
                alt={activeMember.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{activeMember.name}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: accentColor, marginTop: 2 }}>
              {activeMember.role.toUpperCase()}
            </div>
            <div style={{ fontSize: 9, color: "#00FF88", fontWeight: 800, marginTop: 4 }}>
              ● {activeMember.presenceStatus ?? "Available to Jam"}
            </div>

            {/* Action Buttons List */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
              {activeMember.publicProfileSlug && (
                <Link
                  data-testid={`btn-action-profile-${activeMember.id}`}
                  href={`/p/${encodeURIComponent(activeMember.publicProfileSlug)}`}
                  style={{
                    padding: "10px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  👤 VIEW PROFILE
                </Link>
              )}

              <button
                type="button"
                data-testid={`btn-action-message-${activeMember.id}`}
                onClick={() => handleDirectMessage(activeMember)}
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  background: "#AA2DFF",
                  border: "none",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                💬 SEND DIRECT MESSAGE
              </button>

              <button
                type="button"
                data-testid={`btn-action-friend-${activeMember.id}`}
                onClick={() => handleFriendToggle(activeMember.id)}
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  background: friendMap[activeMember.id] ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${friendMap[activeMember.id] ? "#FFD700" : "rgba(255,255,255,0.12)"}`,
                  color: friendMap[activeMember.id] ? "#FFD700" : "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {friendMap[activeMember.id] ? "FRIENDS ✓" : "➕ ADD FRIEND"}
              </button>

              <button
                type="button"
                data-testid={`btn-action-invite-lounge-${activeMember.id}`}
                onClick={() => {
                  setActiveMember(null);
                  if (onInviteToLounge) {
                    onInviteToLounge([activeMember]);
                  } else {
                    setFeedbackNotice(`Invited ${activeMember.name} to Lounge`);
                    setTimeout(() => setFeedbackNotice(null), 3000);
                  }
                }}
                style={{
                  padding: "10px",
                  borderRadius: 8,
                  background: "rgba(0,255,255,0.1)",
                  border: "1px solid rgba(0,255,255,0.3)",
                  color: "#00FFFF",
                  fontSize: 11,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                🍸 INVITE TO LOUNGE
              </button>

              <button
                type="button"
                onClick={() => setActiveMember(null)}
                style={{
                  marginTop: 6,
                  padding: "8px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 10,
                  cursor: "pointer",
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tour & Event Dates if available */}
      {tourDates && tourDates.length > 0 && (
        <div data-testid="group-tour-dates" style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#FFD700", marginBottom: 12 }}>
            UPCOMING TOUR & SHOW DATES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tourDates.map((d) => (
              <div
                key={d.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{d.city}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginLeft: 8 }}>{d.venue}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#FFD700" }}>{d.date}</span>
                  {d.ticketUrl && (
                    <Link
                      href={d.ticketUrl}
                      style={{
                        fontSize: 9,
                        fontWeight: 900,
                        padding: "4px 10px",
                        borderRadius: 4,
                        background: "#FFD700",
                        color: "#050510",
                        textDecoration: "none",
                      }}
                    >
                      GET TICKETS
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
