"use client";

import { useState } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { followUser, unfollowUser, listFollowersForUser } from "@/lib/social/FollowEngine";
import { sendDirectMessage } from "@/lib/social/DMEngine";

interface ArtistProfileClientProps {
  artistSlug: string;
  artistName: string;
  genre: string;
  tier: string;
  followers: number;
  following: number;
}

export default function ArtistProfileClient({ 
  artistSlug, 
  artistName,
  genre,
  tier,
  followers,
  following,
}: ArtistProfileClientProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const userId = "profile-guest-user";

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        unfollowUser(userId, artistSlug);
        setIsFollowing(false);
        setActionFeedback("Unfollowed");
      } else {
        followUser(userId, artistSlug);
        setIsFollowing(true);
        setActionFeedback("Following!");
      }
      setTimeout(() => setActionFeedback(null), 2000);
    } catch (err) {
      setActionFeedback("Action failed");
    }
  };

  const handleMessage = async () => {
    try {
      setIsMessaging(true);
      sendDirectMessage(artistSlug, userId, `Hey ${artistName}, checked out your work!`);
      setActionFeedback("Message sent!");
      setTimeout(() => setActionFeedback(null), 2000);
    } catch (err) {
      setActionFeedback("Failed to send");
    } finally {
      setIsMessaging(false);
    }
  };

  const handleTip = () => {
    setActionFeedback("Tip sent!");
    setTimeout(() => setActionFeedback(null), 2000);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Social Action Buttons */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
        <button
          onClick={handleFollow}
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "1px solid rgba(255,45,170,0.4)",
            background: isFollowing ? "#FF2DAA" : "rgba(255,45,170,0.1)",
            color: isFollowing ? "#050510" : "#FF2DAA",
            fontWeight: 700,
            fontSize: 11,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {isFollowing ? "Following ✓" : "Follow"}
        </button>

        <button
          onClick={handleMessage}
          disabled={isMessaging}
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "1px solid rgba(0,255,255,0.3)",
            background: "rgba(0,255,255,0.08)",
            color: "#00FFFF",
            fontWeight: 700,
            fontSize: 11,
            cursor: isMessaging ? "wait" : "pointer",
            opacity: isMessaging ? 0.6 : 1,
          }}
        >
          {isMessaging ? "Sending..." : "Message"}
        </button>

        <button
          onClick={handleTip}
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "1px solid rgba(255,215,0,0.3)",
            background: "rgba(255,215,0,0.08)",
            color: "#FFD700",
            fontWeight: 700,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          Tip 💰
        </button>

        <button style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: "1px solid rgba(170,45,255,0.3)",
            background: "rgba(170,45,255,0.08)",
            color: "#AA2DFF",
            fontWeight: 700,
            fontSize: 11,
            cursor: "pointer",
          }}>
          Book Performance
        </button>
      </div>

      {/* Action Feedback */}
      {actionFeedback && (
        <div style={{
          marginTop: 12,
          padding: "8px 12px",
          borderRadius: 6,
          background: "#00FF88",
          color: "#050510",
          fontSize: 11,
          fontWeight: 700,
          textAlign: "center",
        }}>
          {actionFeedback}
        </div>
      )}
    </div>
  );
}
