"use client";

/**
 * ProfileSocialSection — Universal social tab for all role profiles.
 * Includes: Follow, DM, Voice Call, Video Call, Friends list, Search,
 *           track upload shortcut, and invite friends.
 */

import { useState, useCallback } from "react";
import FollowButton from "./FollowButton";
import DirectMessagePanel from "./DirectMessagePanel";
import VoiceVideoCallWidget from "./VoiceVideoCallWidget";
import FriendsList, { type Friend } from "./FriendsList";
import UserSearchPanel from "./UserSearchPanel";
import type { Conversation } from "./DirectMessagePanel";

export type SocialTab = "overview" | "friends" | "messages" | "search" | "call";

interface ProfileSocialSectionProps {
  /** The profile being viewed */
  profileUserId:   string;
  profileName:     string;
  profileRole:     string;
  /** The logged-in viewer */
  viewerId:        string;
  viewerName:      string;
  viewerTier:      string;
  /** Is the viewer the profile owner? */
  isOwner:         boolean;
  /** Is the viewer following this profile? */
  initialFollowing?: boolean;
  initialFollowers?: number;
  friends?:         Friend[];
  conversations?:   Conversation[];
  accent?:          string;
}

const TAB_ICONS: Record<SocialTab, string> = {
  overview: "👤",
  friends:  "👥",
  messages: "💬",
  search:   "🔍",
  call:     "📹",
};

const TAB_LABELS: Record<SocialTab, string> = {
  overview: "Overview",
  friends:  "Friends",
  messages: "Messages",
  search:   "Discover",
  call:     "Call",
};

export default function ProfileSocialSection({
  profileUserId,
  profileName,
  profileRole,
  viewerId,
  viewerName,
  viewerTier,
  isOwner,
  initialFollowing  = false,
  initialFollowers  = 0,
  friends           = [],
  conversations     = [],
  accent            = "#FF2DAA",
}: ProfileSocialSectionProps) {
  const [tab, setTab]               = useState<SocialTab>("overview");
  const [showDM, setShowDM]         = useState(false);
  const [showCall, setShowCall]     = useState(false);
  const [callType, setCallType]     = useState<"voice" | "video">("video");
  const [dmTarget, setDmTarget]     = useState<{ id: string; name: string } | null>(null);

  const openDM = useCallback((targetId: string, targetName: string) => {
    setDmTarget({ id: targetId, name: targetName });
    setShowDM(true);
    setTab("messages");
  }, []);

  const startCall = useCallback((type: "voice" | "video") => {
    setCallType(type);
    setShowCall(true);
    setTab("call");
  }, []);

  const BG     = "#06080f";
  const BORDER = "rgba(255,255,255,0.07)";

  const tabs: SocialTab[] = isOwner
    ? ["friends", "messages", "search", "call"]
    : ["overview", "messages", "call"];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "0 0 12px",
          borderBottom: `1px solid ${BORDER}`,
          marginBottom: 14,
          overflowX: "auto",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "7px 13px", borderRadius: 9,
              background: tab === t ? `${accent}18` : "rgba(255,255,255,0.03)",
              border: `1px solid ${tab === t ? accent + "44" : "rgba(255,255,255,0.06)"}`,
              color: tab === t ? accent : "rgba(255,255,255,0.45)",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              flexShrink: 0, transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 13 }}>{TAB_ICONS[t]}</span>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* OVERVIEW tab — profile visitor view */}
      {tab === "overview" && !isOwner && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Follow + action buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <FollowButton
              targetUserId={profileUserId}
              targetName={profileName}
              initialFollowing={initialFollowing}
              initialFollowers={initialFollowers}
              variant="button"
              accent={accent}
            />
            <button
              type="button"
              onClick={() => openDM(profileUserId, profileName)}
              style={{ padding: "9px 18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}
            >
              💬 Message
            </button>
            <button
              type="button"
              onClick={() => startCall("voice")}
              style={{ padding: "9px 18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}
            >
              🎙️ Voice
            </button>
            <button
              type="button"
              onClick={() => startCall("video")}
              style={{ padding: "9px 18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}
            >
              📹 Video
            </button>
          </div>

          {/* Role card */}
          <div style={{ padding: "14px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 10 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", fontWeight: 700, marginBottom: 6 }}>PROFILE</div>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{profileName}</div>
            <div style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: "0.08em" }}>{profileRole}</div>
            {initialFollowers > 0 && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                {initialFollowers.toLocaleString()} followers
              </div>
            )}
          </div>
        </div>
      )}

      {/* FRIENDS tab */}
      {tab === "friends" && (
        <FriendsList
          friends={friends}
          onMessage={(f) => openDM(f.id, f.name)}
          accent={accent}
          showInviteButton
          onInvite={() => { window.location.href = '/messages/new?subject=invite'; }}
        />
      )}

      {/* MESSAGES tab */}
      {tab === "messages" && (
        <div style={{ position: "relative" }}>
          <DirectMessagePanel
            currentUserId={viewerId}
            currentUserName={viewerName}
            initialConversations={
              showDM && dmTarget
                ? [{ userId: dmTarget.id, userName: dmTarget.name, userRole: "FAN" }, ...conversations]
                : conversations
            }
            accent={accent}
            onClose={showDM ? () => { setShowDM(false); setDmTarget(null); } : undefined}
            style={{ width: "100%", height: 480 }}
          />
        </div>
      )}

      {/* SEARCH / DISCOVER tab */}
      {tab === "search" && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", marginBottom: 10 }}>FIND PERFORMERS & FANS</div>
          <UserSearchPanel
            accent={accent}
            onSelect={(user) => openDM(user.id, user.name)}
            filters={["all", "performer", "artist", "fan"]}
          />
        </div>
      )}

      {/* CALL tab */}
      {tab === "call" && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {showCall ? (
            <VoiceVideoCallWidget
              currentUserId={viewerId}
              currentUserName={viewerName}
              targetUserId={dmTarget?.id ?? profileUserId}
              targetName={dmTarget?.name ?? profileName}
              callType={callType}
              accent={accent}
              onClose={() => { setShowCall(false); setTab("overview"); }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📹</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Start a call with {isOwner ? "a friend" : profileName}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
                {viewerTier === "diamond" ? "HD video & voice calls" : "Voice calls available. Upgrade for HD video."}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button type="button" onClick={() => { setDmTarget({ id: profileUserId, name: profileName }); startCall("voice"); }}
                  style={{ padding: "11px 24px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                  🎙️ Voice Call
                </button>
                <button type="button" onClick={() => { setDmTarget({ id: profileUserId, name: profileName }); startCall("video"); }}
                  style={{ padding: "11px 24px", background: `${accent}22`, border: `1px solid ${accent}44`, borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700, color: accent, display: "flex", alignItems: "center", gap: 6 }}>
                  📹 Video Call
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
