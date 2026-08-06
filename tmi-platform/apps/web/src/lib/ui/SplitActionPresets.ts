export interface SplitActionMenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  action?: () => void;
  description?: string;
}

export interface SplitActionPreset {
  id: string;
  primaryLabel: string;
  primaryIcon: string;
  primaryHref: string;
  accentColor: string;
  menuItems: SplitActionMenuItem[];
}

export const SPLIT_ACTION_PRESETS: Record<string, SplitActionPreset> = {
  "go-live": {
    id: "go-live",
    primaryLabel: "GO LIVE",
    primaryIcon: "🔴",
    primaryHref: "/go-live",
    accentColor: "#FF2DAA",
    menuItems: [
      { id: "instant-stream", label: "Instant Go Live", icon: "⚡", href: "/go-live?mode=instant", description: "Start broadcast immediately" },
      { id: "private-stage", label: "Private Stage", icon: "🔒", href: "/go-live?mode=private", description: "Rehearsal and invite-only" },
      { id: "audio-only", label: "Audio Stream Ticker", icon: "📻", href: "/go-live?mode=audio", description: "Low-bandwidth audio broadcast" },
      { id: "broadcast-settings", label: "Broadcast Settings", icon: "⚙️", href: "/admin/settings", description: "Mic camera and bitrate config" },
    ],
  },
  challenge: {
    id: "challenge",
    primaryLabel: "CHALLENGE",
    primaryIcon: "⚔️",
    primaryHref: "/cypher/live",
    accentColor: "#FFD700",
    menuItems: [
      { id: "direct-battle", label: "Head-to-Head Battle", icon: "🥊", href: "/cypher/live?type=battle", description: "Challenge an artist directly" },
      { id: "cypher-ring", label: "Cypher Ring", icon: "🎙️", href: "/cypher/live?type=cypher", description: "Join open rotation mic" },
      { id: "beat-clash", label: "Beat Clash", icon: "🎹", href: "/cypher/live?type=beat", description: "Producer instrumental battle" },
      { id: "belt-rules", label: "Championship Rules", icon: "🏆", href: "/admin/runtime-check", description: "Belt ladder and scoring criteria" },
    ],
  },
  "mint-nft": {
    id: "mint-nft",
    primaryLabel: "MINT NFT",
    primaryIcon: "💎",
    primaryHref: "/marketplace",
    accentColor: "#00FFFF",
    menuItems: [
      { id: "track-nft", label: "Single Track NFT", icon: "🎵", href: "/marketplace?type=track", description: "Mint single audio collectible" },
      { id: "album-drop", label: "Album Drop", icon: "💿", href: "/marketplace?type=album", description: "Mint full album edition" },
      { id: "merch-bundle", label: "Merch and Ticket Bundle", icon: "🎟️", href: "/marketplace?type=bundle", description: "Physical merch and VIP ticket" },
      { id: "royalty-split", label: "Royalty Split Specs", icon: "📊", href: "/admin/revenue", description: "Configure smart contract split" },
    ],
  },
  messages: {
    id: "messages",
    primaryLabel: "MESSAGES",
    primaryIcon: "💬",
    primaryHref: "/admin/messages",
    accentColor: "#00FFFF",
    menuItems: [
      { id: "direct-message", label: "Direct Message", icon: "✉️", href: "/admin/messages?action=new", description: "Send private note to user" },
      { id: "fan-broadcast", label: "Fan Club Broadcast", icon: "📢", href: "/admin/messages?action=broadcast", description: "Blast update to all followers" },
      { id: "sponsor-outreach", label: "Sponsor Outreach", icon: "🤝", href: "/admin/messages?action=sponsor", description: "Inquire about brand slot" },
      { id: "message-filters", label: "Message Filters", icon: "🔍", href: "/admin/messages?filter=unread", description: "View unread and flagged" },
    ],
  },
  "invite-fans": {
    id: "invite-fans",
    primaryLabel: "INVITE FANS",
    primaryIcon: "🚀",
    primaryHref: "/account",
    accentColor: "#AA2DFF",
    menuItems: [
      { id: "qr-code", label: "Show Stage QR Code", icon: "📱", href: "/account?view=qr", description: "Scan to open live profile" },
      { id: "email-invite", label: "Send Email Blast", icon: "📧", href: "/account?view=email", description: "Invite fan contact list" },
      { id: "referral-link", label: "Copy Referral Link", icon: "🔗", href: "/account?view=referral", description: "Earn promo points on signup" },
      { id: "social-card", label: "Download Social Card", icon: "🖼️", href: "/account?view=social", description: "Branded graphic for Instagram" },
    ],
  },
  uploads: {
    id: "uploads",
    primaryLabel: "UPLOADS",
    primaryIcon: "☁️",
    primaryHref: "/admin/beat-locker",
    accentColor: "#00FF88",
    menuItems: [
      { id: "single-audio", label: "Upload Track Audio", icon: "🎧", href: "/admin/beat-locker?type=audio", description: "WAV or MP3 master upload" },
      { id: "music-video", label: "Upload Music Video", icon: "🎬", href: "/admin/beat-locker?type=video", description: "4K or 1080p video master" },
      { id: "stem-pack", label: "Upload Stem Pack", icon: "🎛️", href: "/admin/beat-locker?type=stems", description: "Multi-track remix stems" },
      { id: "cover-art", label: "Upload Cover Art", icon: "🎨", href: "/admin/beat-locker?type=art", description: "3000x3000px artwork file" },
    ],
  },
};
