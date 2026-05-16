// FRIEND ACCEPTANCE ENGINE — Friendship Lifecycle Management
// Purpose: Handle friend requests, acceptances, blocks, and relationship state
// Ensures bidirectional friendship establishment and rejection flows

import { randomUUID } from 'crypto';

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked' | 'rejected';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: FriendshipStatus;
  sentAt: string;
  respondedAt?: string;
  message?: string;
}

export interface Friendship {
  id: string;
  userId1: string;
  userId2: string;
  status: 'active' | 'blocked';
  connectedAt: string;
  mutualFriends: number;
}

export interface FriendProfile {
  userId: string;
  totalFriends: number;
  pendingRequests: number;
  blockedCount: number;
  lastActivityAt?: string;
}

// Friend requests registry (id → request)
const FRIEND_REQUESTS = new Map<string, FriendRequest>();

// Accepted friendships (userId:userId → friendship, sorted)
const FRIENDSHIPS = new Map<string, Friendship>();

// Blocked relationships (blockerId:blockedId)
const BLOCKS = new Map<string, boolean>();

// User friend profiles
const FRIEND_PROFILES = new Map<string, FriendProfile>();

function generateFriendshipKey(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join(':');
}

export class FriendAcceptanceEngine {
  /**
   * Send friend request
   */
  static async sendFriendRequest(
    fromUserId: string,
    toUserId: string,
    message?: string
  ): Promise<FriendRequest | null> {
    // Prevent self-requests
    if (fromUserId === toUserId) return null;

    // Check if already friends
    const key = generateFriendshipKey(fromUserId, toUserId);
    if (FRIENDSHIPS.has(key)) return null;

    // Check if blocked
    const blockKey1 = `${toUserId}:${fromUserId}`;
    if (BLOCKS.has(blockKey1)) return null;

    // Create request
    const request: FriendRequest = {
      id: randomUUID(),
      fromUserId,
      toUserId,
      status: 'pending',
      sentAt: new Date().toISOString(),
      message,
    };

    FRIEND_REQUESTS.set(request.id, request);

    // Update recipient profile
    this.updateProfile(toUserId, (p) => {
      p.pendingRequests += 1;
    });

    return request;
  }

  /**
   * Accept friend request
   */
  static async acceptFriendRequest(requestId: string): Promise<Friendship | null> {
    const request = FRIEND_REQUESTS.get(requestId);
    if (!request || request.status !== 'pending') return null;

    // Create bidirectional friendship
    const key = generateFriendshipKey(request.fromUserId, request.toUserId);

    const friendship: Friendship = {
      id: randomUUID(),
      userId1: request.fromUserId,
      userId2: request.toUserId,
      status: 'active',
      connectedAt: new Date().toISOString(),
      mutualFriends: 0,
    };

    FRIENDSHIPS.set(key, friendship);

    // Update request status
    request.status = 'accepted';
    request.respondedAt = new Date().toISOString();

    // Update both user profiles
    this.updateProfile(request.fromUserId, (p) => {
      p.totalFriends += 1;
    });

    this.updateProfile(request.toUserId, (p) => {
      p.totalFriends += 1;
      p.pendingRequests -= 1;
    });

    return friendship;
  }

  /**
   * Reject friend request
   */
  static async rejectFriendRequest(requestId: string): Promise<void> {
    const request = FRIEND_REQUESTS.get(requestId);
    if (!request || request.status !== 'pending') return;

    request.status = 'rejected';
    request.respondedAt = new Date().toISOString();

    // Update recipient profile
    this.updateProfile(request.toUserId, (p) => {
      p.pendingRequests = Math.max(0, p.pendingRequests - 1);
    });
  }

  /**
   * Remove friend (mutual unfriend)
   */
  static async removeFriend(userId1: string, userId2: string): Promise<boolean> {
    const key = generateFriendshipKey(userId1, userId2);
    const friendship = FRIENDSHIPS.get(key);

    if (!friendship) return false;

    FRIENDSHIPS.delete(key);

    // Update both profiles
    this.updateProfile(userId1, (p) => {
      p.totalFriends = Math.max(0, p.totalFriends - 1);
    });

    this.updateProfile(userId2, (p) => {
      p.totalFriends = Math.max(0, p.totalFriends - 1);
    });

    return true;
  }

  /**
   * Block user
   */
  static async blockUser(blockerId: string, blockedId: string): Promise<void> {
    // Remove friendship if exists
    const key = generateFriendshipKey(blockerId, blockedId);
    if (FRIENDSHIPS.has(key)) {
      FRIENDSHIPS.delete(key);
      this.updateProfile(blockerId, (p) => {
        p.totalFriends = Math.max(0, p.totalFriends - 1);
      });
      this.updateProfile(blockedId, (p) => {
        p.totalFriends = Math.max(0, p.totalFriends - 1);
      });
    }

    // Record block
    const blockKey = `${blockerId}:${blockedId}`;
    BLOCKS.set(blockKey, true);

    // Update blocker profile
    this.updateProfile(blockerId, (p) => {
      p.blockedCount += 1;
    });
  }

  /**
   * Unblock user
   */
  static async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const blockKey = `${blockerId}:${blockedId}`;
    BLOCKS.delete(blockKey);

    // Update profile
    this.updateProfile(blockerId, (p) => {
      p.blockedCount = Math.max(0, p.blockedCount - 1);
    });
  }

  /**
   * Check if users are friends
   */
  static async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const key = generateFriendshipKey(userId1, userId2);
    const friendship = FRIENDSHIPS.get(key);
    return friendship !== undefined && friendship.status === 'active';
  }

  /**
   * Check if user is blocked
   */
  static async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const blockKey = `${blockerId}:${blockedId}`;
    return BLOCKS.has(blockKey);
  }

  /**
   * Get pending friend requests for user
   */
  static async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    return Array.from(FRIEND_REQUESTS.values()).filter(
      (r) => r.toUserId === userId && r.status === 'pending'
    );
  }

  /**
   * Get friend list
   */
  static async getFriends(userId: string): Promise<string[]> {
    const friends: string[] = [];

    FRIENDSHIPS.forEach((friendship) => {
      if (friendship.status === 'active') {
        if (friendship.userId1 === userId) {
          friends.push(friendship.userId2);
        } else if (friendship.userId2 === userId) {
          friends.push(friendship.userId1);
        }
      }
    });

    return friends;
  }

  /**
   * Get blocked users list
   */
  static async getBlocked(blockerId: string): Promise<string[]> {
    const blocked: string[] = [];

    BLOCKS.forEach((_, key) => {
      const [bId, blockedId] = key.split(':');
      if (bId === blockerId) {
        blocked.push(blockedId);
      }
    });

    return blocked;
  }

  /**
   * Get user friend profile
   */
  static async getProfile(userId: string): Promise<FriendProfile> {
    return (
      FRIEND_PROFILES.get(userId) || {
        userId,
        totalFriends: 0,
        pendingRequests: 0,
        blockedCount: 0,
      }
    );
  }

  /**
   * Update friend profile (internal utility)
   */
  private static updateProfile(userId: string, updater: (p: FriendProfile) => void): void {
    let profile = FRIEND_PROFILES.get(userId);
    if (!profile) {
      profile = {
        userId,
        totalFriends: 0,
        pendingRequests: 0,
        blockedCount: 0,
      };
      FRIEND_PROFILES.set(userId, profile);
    }

    updater(profile);
    profile.lastActivityAt = new Date().toISOString();
  }

  /**
   * Get friend suggestion (mutual friends)
   */
  static async getSuggestions(userId: string, limit: number = 5): Promise<string[]> {
    const userFriends = new Set(await this.getFriends(userId));
    const suggestions = new Map<string, number>();

    // Count mutual friend overlaps
    userFriends.forEach((friendId) => {
      this.getFriends(friendId).then((friendOfFriendsList) => {
        friendOfFriendsList.forEach((fof) => {
          if (fof !== userId && !userFriends.has(fof)) {
            suggestions.set(fof, (suggestions.get(fof) || 0) + 1);
          }
        });
      });
    });

    // Return top suggestions by mutual friend count
    return Array.from(suggestions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([userId]) => userId);
  }
}

export default FriendAcceptanceEngine;
