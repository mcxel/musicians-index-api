/**
 * TMI Notification Engine
 * In-memory notification store for the current session.
 * Covers: system alerts, room events, achievement unlocks, tip received, battle result, new follower.
 */

export type NotificationType =
  | "system"
  | "room_joined"
  | "room_started"
  | "battle_result"
  | "battle_invite"
  | "tip_received"
  | "tip_sent"
  | "achievement"
  | "follower"
  | "mention"
  | "ticket_confirmed"
  | "payout"
  | "subscription"
  | "magazine_drop"
  | "nft_sale"
  | "beat_purchase"
  | "moderation"
  | "bot_alert"
  | "radio";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface TMINotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  read: boolean;
  ts: number;
  href?: string;         // destination route when clicked
  emoji?: string;
  data?: Record<string, unknown>;
}

type NotificationListener = (n: TMINotification) => void;

// ── Engine ───────────────────────────────────────────────────────────────────

class NotificationEngineClass {
  private store: TMINotification[] = [];
  private listeners: Set<NotificationListener> = new Set();
  private idCounter = 1;

  push(
    type: NotificationType,
    title: string,
    body: string,
    opts: {
      priority?: NotificationPriority;
      href?: string;
      emoji?: string;
      data?: Record<string, unknown>;
    } = {}
  ): TMINotification {
    const n: TMINotification = {
      id: `notif-${this.idCounter++}-${Date.now()}`,
      type,
      title,
      body,
      priority: opts.priority ?? "medium",
      read: false,
      ts: Date.now(),
      href: opts.href,
      emoji: opts.emoji ?? this.defaultEmoji(type),
      data: opts.data,
    };
    this.store.unshift(n);
    // Cap store at 200
    if (this.store.length > 200) this.store.length = 200;
    this.listeners.forEach(fn => fn(n));
    return n;
  }

  getAll(): TMINotification[] { return [...this.store]; }
  getUnread(): TMINotification[] { return this.store.filter(n => !n.read); }
  getUnreadCount(): number { return this.store.filter(n => !n.read).length; }

  markRead(id: string) {
    const n = this.store.find(n => n.id === id);
    if (n) n.read = true;
  }

  markAllRead() { this.store.forEach(n => { n.read = true; }); }

  clear() { this.store = []; }

  subscribe(fn: NotificationListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // Convenience methods
  system(title: string, body: string, href?: string) {
    return this.push("system", title, body, { priority: "medium", href });
  }
  alert(title: string, body: string) {
    return this.push("system", title, body, { priority: "high" });
  }
  battleResult(winnerName: string, battleId: string) {
    return this.push("battle_result", "Battle Result", `${winnerName} won the battle`, {
      emoji: "👑", href: `/battles/${battleId}`, data: { battleId },
    });
  }
  tipReceived(from: string, amount: number) {
    return this.push("tip_received", "Tip Received!", `${from} sent you $${amount.toFixed(2)}`, {
      emoji: "💰", priority: "high",
    });
  }
  achievement(name: string, desc: string) {
    return this.push("achievement", `Achievement: ${name}`, desc, {
      emoji: "🏆", priority: "high",
    });
  }
  follower(name: string, href: string) {
    return this.push("follower", "New Follower", `${name} is now following you`, {
      emoji: "👥", href,
    });
  }
  ticketConfirmed(event: string, href: string) {
    return this.push("ticket_confirmed", "Ticket Confirmed", `Your ticket for ${event} is ready`, {
      emoji: "🎟️", href, priority: "high",
    });
  }
  magazineDrop(issueTitle: string) {
    return this.push("magazine_drop", "New Issue Dropped", issueTitle, {
      emoji: "📰", href: "/magazine", priority: "low",
    });
  }
  nftSale(itemName: string, price: string) {
    return this.push("nft_sale", "NFT Sold", `${itemName} sold for ${price}`, {
      emoji: "🖼️", href: "/nft", priority: "high",
    });
  }
  beatPurchase(beatTitle: string, buyerName: string) {
    return this.push("beat_purchase", "Beat Purchased", `${buyerName} bought "${beatTitle}"`, {
      emoji: "🎵", href: "/beats", priority: "high",
    });
  }
  radioSessionLive(trackTitle: string) {
    return this.push("radio", "Your Stream & Win session is live", `"${trackTitle}" is now available in the radio room.`, {
      emoji: "📻", href: "/radio", priority: "high",
    });
  }
  radioWaitingRoom(joined: number, threshold: number) {
    return this.push("radio", "Waiting Room Update", `Artists joined: ${joined} of ${threshold}. Session launches when the room fills.`, {
      emoji: "📻", href: "/radio", priority: "medium",
    });
  }

  private defaultEmoji(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      system: "🔔", room_joined: "🚪", room_started: "🎬",
      battle_result: "👑", battle_invite: "⚔️", tip_received: "💰",
      tip_sent: "💸", achievement: "🏆", follower: "👥",
      mention: "💬", ticket_confirmed: "🎟️", payout: "💵",
      subscription: "⭐", magazine_drop: "📰", nft_sale: "🖼️",
      beat_purchase: "🎵", moderation: "🛡️", bot_alert: "🤖",
      radio: "📻",
    };
    return map[type] ?? "🔔";
  }
}

export const NotificationEngine = new NotificationEngineClass();
