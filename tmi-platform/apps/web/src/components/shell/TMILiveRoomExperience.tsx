'use client';

/**
 * TMILiveRoomExperience — The cinematic live room surface.
 *
 * Implements the design language from the target screenshot:
 *   - 2 big + 2 mini VideoMonitorGrid (center stage)
 *   - Glassmorphic floating panels (Inventory, Memory Wall)
 *   - Right rail: Chat / Room / People tabs
 *   - Bottom HUD: Mic / Cam / Raise Hand / Emotes / Enter Stage
 *   - High depth: backdrop-blur, neon glow borders, scan lines
 *   - All media types in each panel: live stream, ads, performances, video, commercials
 *
 * Curtain rule: curtain only shows in the main video panel when isLive=true
 * or showImminent=true. Never as a static dashboard section.
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoMonitorGrid, { type MonitorFeed, type MonitorConfig } from './VideoMonitorGrid';
import AmbientVisualizer, { VisualSettingsPanel } from './AmbientVisualizer';
import ReleaseAnnouncementOverlay, {
  type ReleaseAnnouncementItem,
  type ReleaseAnnouncementKind,
  type ReleaseAnnouncementPhase,
} from './ReleaseAnnouncementOverlay';
import { ExperienceOrchestrator } from '../../lib/experience/ExperienceOrchestrator';
import { initializeExperienceBroadcastBridge } from '@/lib/broadcast/ExperienceBroadcastBridge';
import { recordStageEvent } from '@/lib/live/stageTelemetryStore';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  emoji?: string;
  ts: string;
  type?: 'chat' | 'tip' | 'reaction';
  amount?: number;
}

interface RoomNearby {
  name: string;
  count: number;
  href: string;
}

interface FriendOnline {
  name: string;
  status: string;
}

interface MissionPrompt {
  id: string;
  title: string;
  body: string;
  anchor: 'top' | 'bottom';
  tone: 'info' | 'success' | 'action';
}

interface ShowcaseReleaseItem extends ReleaseAnnouncementItem {
  releasedAt: string;
  newest?: boolean;
}

const MISSION_PROMPTS: MissionPrompt[] = [
  {
    id: 'go-live',
    title: 'Go Live Mission',
    body: 'Tap Camera and Enter Stage to start your live performance in under 10 seconds.',
    anchor: 'top',
    tone: 'action',
  },
  {
    id: 'memory-wall',
    title: 'Build Your Memory Wall',
    body: 'Capture moments during your stream so fans can replay and share your best highlights.',
    anchor: 'top',
    tone: 'info',
  },
  {
    id: 'playlist',
    title: 'Load Your Playlist',
    body: 'Open the chevron drawer to queue songs, videos, and set transitions before the next segment.',
    anchor: 'bottom',
    tone: 'action',
  },
  {
    id: 'instant-payouts',
    title: 'Instant Payouts Ready',
    body: 'Eligible tips settle to your payout wallet right after capture confirmation.',
    anchor: 'bottom',
    tone: 'success',
  },
];

const STAGE_SHOWCASE_ITEMS: ShowcaseReleaseItem[] = [
  {
    id: 'release-album-1',
    kind: 'album',
    title: 'Neon Crown Deluxe',
    subtitle: 'Album + story + live extras',
    artLabel: 'Album cover',
    href: '/magazine',
    releasedAt: '2026-06-30T09:15:00Z',
    newest: true,
  },
  {
    id: 'release-single-1',
    kind: 'single',
    title: 'Midnight Voltage',
    subtitle: 'Single release with performance replay',
    artLabel: 'Single artwork',
    href: '/live-schedule',
    releasedAt: '2026-06-26T22:30:00Z',
  },
  {
    id: 'release-video-1',
    kind: 'video',
    title: 'Afterparty Lights (Official Video)',
    subtitle: 'Video premiere and behind-the-scenes',
    artLabel: 'Music video art',
    href: '/articles/performer',
    releasedAt: '2026-06-25T19:20:00Z',
  },
  {
    id: 'release-magazine-1',
    kind: 'magazine',
    title: 'Issue 01 Cover Story',
    subtitle: 'Performer profile + review + interview',
    artLabel: 'Magazine cover',
    href: '/magazine',
    releasedAt: '2026-06-24T15:00:00Z',
  },
  {
    id: 'release-tickets-1',
    kind: 'tickets',
    title: 'Thunder Dome Live Tickets',
    subtitle: 'New date added and sections unlocked',
    artLabel: 'Ticket card',
    href: '/tickets',
    releasedAt: '2026-06-23T18:00:00Z',
  },
  {
    id: 'release-merch-1',
    kind: 'merch',
    title: 'Vice Neon Merch Capsule',
    subtitle: 'Limited run apparel now available',
    artLabel: 'Merch drop',
    href: '/store',
    releasedAt: '2026-06-22T10:45:00Z',
  },
  {
    id: 'release-premiere-1',
    kind: 'premiere',
    title: 'World Premiere Segment',
    subtitle: 'Exclusive first look before public launch',
    artLabel: 'Premiere card',
    href: '/home/3',
    releasedAt: '2026-06-20T21:10:00Z',
  },
];

export interface TMILiveRoomExperienceProps {
  // Room info
  roomId: string;
  roomTitle: string;
  performerName: string;
  performerSlug: string;
  genre?: string;
  viewerCount?: number;
  isLive?: boolean;
  showImminent?: boolean;
  quality?: '4K' | '1080p' | '720p';

  // Session user
  userId?: string;
  userName?: string;
  userTier?: string;
  userLevel?: number;
  userXp?: number;
  userXpMax?: number;
  userCoins?: number;
  userPoints?: number;

  // Content
  chatMessages?: ChatMessage[];
  roomsNearby?: RoomNearby[];
  friendsOnline?: FriendOnline[];

  // Accent
  accentColor?: string;

  // Slots for injecting canisters into grid panels
  lobbyWallSlot?: React.ReactNode;
  memoryWallSlot?: React.ReactNode;
  audienceSlot?: React.ReactNode;

  // Floating windows
  inventorySlot?: React.ReactNode;

  // Callbacks
  onLeave?: () => void;
  onEnterStage?: () => void;
  onMicToggle?: (on: boolean) => void;
  onCamToggle?: (on: boolean) => void;
}

// ── Glass panel helper ────────────────────────────────────────────────────────

function GlassPanel({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{
      background: 'rgba(5,5,22,0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TMILiveRoomExperience({
  roomId,
  roomTitle,
  performerName,
  genre = 'Hip Hop',
  viewerCount = 0,
  isLive = false,
  quality = '4K',
  userId,
  userName = 'You',
  userTier = 'Diamond',
  userLevel = 1,
  userXp = 0,
  userXpMax = 25000,
  userCoins = 0,
  userPoints = 0,
  chatMessages = [],
  roomsNearby = [],
  friendsOnline = [],
  accentColor = '#00FFFF',
  lobbyWallSlot,
  memoryWallSlot,
  audienceSlot,
  inventorySlot,
  onLeave,
  onEnterStage,
  onMicToggle,
  onCamToggle,
}: TMILiveRoomExperienceProps) {

  useEffect(() => {
    initializeExperienceBroadcastBridge();
  }, []);

  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [rightTab, setRightTab] = useState<'chat' | 'room' | 'people'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [msgs, setMsgs] = useState<ChatMessage[]>(chatMessages);
  const [showInventory, setShowInventory] = useState(false);
  const [showMemoryWall, setShowMemoryWall] = useState(false);
  const [showShowcaseMenu, setShowShowcaseMenu] = useState(false);
  const [showReleaseAnnouncement, setShowReleaseAnnouncement] = useState(false);
  const [releaseAnnouncementMode, setReleaseAnnouncementMode] = useState<'end-show' | 'showcase'>('showcase');
  const [releaseAnnouncementPhase, setReleaseAnnouncementPhase] = useState<ReleaseAnnouncementPhase>('reveal');
  const [releaseAnnouncementItem, setReleaseAnnouncementItem] = useState<ReleaseAnnouncementItem | null>(null);
  const [releaseToast, setReleaseToast] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [leftRailVisible, setLeftRailVisible] = useState(true);
  const [rightRailVisible, setRightRailVisible] = useState(true);
  const [showPrompt, setShowPrompt] = useState(true);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [bottomTab, setBottomTab] = useState<'playlist' | 'memories' | 'photos' | 'media-locker' | 'achievements' | 'rewards' | 'stats' | 'inventory' | 'uploads' | 'saved' | 'favorites'>('playlist');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPrompt) return;
    const rotationTimer = setInterval(() => {
      setActivePromptIndex((prev) => (prev + 1) % MISSION_PROMPTS.length);
    }, 6500);
    return () => clearInterval(rotationTimer);
  }, [showPrompt]);

  useEffect(() => {
    if (!showReleaseAnnouncement || !releaseAnnouncementItem) return;

    const timers: Array<ReturnType<typeof setTimeout>> = [];
    const mode = releaseAnnouncementMode;

    if (mode === 'end-show') {
      setReleaseAnnouncementPhase('applause');
      timers.push(setTimeout(() => setReleaseAnnouncementPhase('thanks'), 1200));
      timers.push(setTimeout(() => {
        setReleaseAnnouncementPhase('reveal');
        ExperienceOrchestrator.emit('STAGE_ANNOUNCEMENT_REVEAL', {
          roomId,
          itemId: releaseAnnouncementItem.id,
        });
      }, 2500));
      timers.push(setTimeout(() => {
        setReleaseAnnouncementPhase('cta');
        ExperienceOrchestrator.emit('STAGE_ANNOUNCEMENT_CTA', {
          roomId,
          itemId: releaseAnnouncementItem.id,
        });
      }, 3900));
      timers.push(setTimeout(() => setReleaseAnnouncementPhase('closing'), 7000));
      timers.push(setTimeout(() => {
        ExperienceOrchestrator.emit('STAGE_ANNOUNCEMENT_COMPLETE', {
          roomId,
          mode: 'end-show',
          itemId: releaseAnnouncementItem.id,
        });
        setShowReleaseAnnouncement(false);
        onLeave?.();
      }, 8200));
    } else {
      setReleaseAnnouncementPhase('reveal');
      timers.push(setTimeout(() => {
        setReleaseAnnouncementPhase('cta');
        ExperienceOrchestrator.emit('STAGE_ANNOUNCEMENT_CTA', {
          roomId,
          itemId: releaseAnnouncementItem.id,
        });
      }, 900));
      timers.push(setTimeout(() => {
        ExperienceOrchestrator.emit('STAGE_ANNOUNCEMENT_COMPLETE', {
          roomId,
          mode: 'showcase',
          itemId: releaseAnnouncementItem.id,
        });
        setShowReleaseAnnouncement(false);
      }, 5600));
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [onLeave, releaseAnnouncementItem, releaseAnnouncementMode, roomId, showReleaseAnnouncement]);

  useEffect(() => {
    if (!releaseToast) return;
    const timeout = setTimeout(() => setReleaseToast(null), 1800);
    return () => clearTimeout(timeout);
  }, [releaseToast]);

  useEffect(() => {
    const unsubscribeShowcase = ExperienceOrchestrator.on('SHOWCASE_TRIGGERED', (payload) => {
      if (payload.roomId !== roomId) return;
      beginStageAnnouncement('showcase', payload.itemKind);
    });

    const unsubscribeShowEnded = ExperienceOrchestrator.on('SHOW_ENDED', (payload) => {
      if (payload.roomId !== roomId) return;
      beginStageAnnouncement('end-show');
    });

    return () => {
      unsubscribeShowcase();
      unsubscribeShowEnded();
    };
  }, [roomId]);

  const activePrompt = MISSION_PROMPTS[activePromptIndex] ?? MISSION_PROMPTS[0];

  const promptToneColor =
    activePrompt.tone === 'success'
      ? '#00FF88'
      : activePrompt.tone === 'action'
      ? '#FFD700'
      : accentColor;

  const shellGridColumns = `${leftRailVisible ? '180px' : '0px'} 1fr ${rightRailVisible ? '280px' : '0px'}`;

  function getLatestShowcaseItem(kind?: ReleaseAnnouncementKind): ShowcaseReleaseItem {
    const matching = kind
      ? STAGE_SHOWCASE_ITEMS.filter((item) => item.kind === kind)
      : STAGE_SHOWCASE_ITEMS;

    const newestFlagged = matching.find((item) => item.newest);
    if (newestFlagged) return newestFlagged;

    return [...matching]
      .sort((a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime())[0]
      ?? STAGE_SHOWCASE_ITEMS[0];
  }

  function beginStageAnnouncement(mode: 'end-show' | 'showcase', kind?: ReleaseAnnouncementKind) {
    const item = getLatestShowcaseItem(kind);
    setShowShowcaseMenu(false);
    setShowReleaseAnnouncement(true);
    setReleaseAnnouncementMode(mode);
    setReleaseAnnouncementItem(item);
    setReleaseAnnouncementPhase(mode === 'end-show' ? 'applause' : 'reveal');

    ExperienceOrchestrator.emit('STAGE_ANNOUNCEMENT_START', {
      roomId,
      mode,
      itemKind: item.kind,
    });
    recordStageEvent('announcement_started', roomId, {
      mode,
      itemId: item.id,
      itemKind: item.kind,
    });
  }

  function handleReleaseAction(action: 'listen' | 'view' | 'save' | 'share', item: ReleaseAnnouncementItem) {
    if (action === 'listen' || action === 'view') {
      if (item.href) {
        window.location.href = item.href;
      } else {
        setReleaseToast('No destination is configured yet.');
      }
      return;
    }

    if (action === 'save') {
      if (userId) {
        ExperienceOrchestrator.emit('MEMORY_CAPTURED', {
          userId,
          memoryId: `release-${item.id}`,
          type: item.kind,
        });
      }
      recordStageEvent('memory_captured', roomId, {
        itemId: item.id,
        itemKind: item.kind,
      });
      setReleaseToast('Saved to your memory wall.');
      return;
    }

    const shareTarget = item.href ? `${window.location.origin}${item.href}` : window.location.href;
    if (navigator.share) {
      navigator.share({ title: item.title, text: item.subtitle, url: shareTarget }).catch(() => {
        setReleaseToast('Share canceled.');
      });
      return;
    }

    if (!navigator.clipboard) {
      setReleaseToast('Share is unavailable on this device.');
      return;
    }

    navigator.clipboard.writeText(shareTarget).then(() => {
      setReleaseToast('Link copied for sharing.');
    }).catch(() => {
      setReleaseToast('Unable to copy link.');
    });
  }

  function triggerEndShowFlow() {
    ExperienceOrchestrator.emit('CURTAIN_CLOSE', { roomId });
    ExperienceOrchestrator.emit('SHOW_ENDED', { roomId, duration: 0 });
    recordStageEvent('show_ended', roomId, {
      duration: 0,
    });
  }

  function sendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMsgs(prev => [...prev, {
      id: `msg-${Date.now()}`, user: userName, text: chatInput.trim(),
      ts: 'just now', type: 'chat',
    }]);
    setChatInput('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  // ── VideoMonitorGrid slot configs ─────────────────────────────────────────

  // Curtain only shows in the main video panel when live/imminent — never on the dashboard
  const mainFeedDefault: MonitorFeed = isLive ? 'live-stream' : 'empty';

  const slot1: MonitorConfig = {
    defaultFeed: mainFeedDefault,
    availableFeeds: ['live-stream', 'audience', 'battle-feed', 'cypher-feed', 'sponsor'],
    accentColor,
    // Curtain renders inside this slot when live — not as a separate dashboard section
    children: isLive ? audienceSlot : undefined,
  };

  const slot2: MonitorConfig = {
    defaultFeed: 'audience',
    availableFeeds: ['audience', 'billboard', 'battle-feed', 'cypher-feed', 'sponsor'],
    accentColor: '#FF2DAA',
    children: audienceSlot,
  };

  const slot3: MonitorConfig = {
    defaultFeed: 'self-camera',
    availableFeeds: ['self-camera', 'memory-wall', 'sponsor', 'empty'],
    accentColor: '#AA2DFF',
    children: memoryWallSlot,
  };

  const slot4: MonitorConfig = {
    defaultFeed: 'billboard',
    availableFeeds: ['billboard', 'now-available', 'memory-wall', 'playlist', 'sponsor', 'empty'],
    accentColor: '#FFD700',
    children: lobbyWallSlot,
  };

  // ── Tier colors ───────────────────────────────────────────────────────────

  const TIER_COLOR: Record<string, string> = {
    Diamond: '#00FFFF', Platinum: '#E5E4E2', Gold: '#FFD700',
    Silver: '#C0C0C0', Ruby: '#CD7F32', PRO: '#AA2DFF', FREE: '#666',
  };
  const tierColor = TIER_COLOR[userTier] ?? '#666';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: shellGridColumns,
      gridTemplateRows: '1fr',
      height: '100vh',
      background: 'linear-gradient(145deg, #030310 0%, #05050f 50%, #030310 100%)',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Ambient lighting from accent ─────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${accentColor}08 0%, transparent 60%)`,
      }} />

      {/* ══ LEFT NAV RAIL ═══════════════════════════════════════════════════ */}
      {leftRailVisible && (
      <GlassPanel style={{
        borderRight: `1px solid ${accentColor}18`,
        borderRadius: 0,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto', zIndex: 10,
      }}>
        {/* TMI logo + MAIN MENU */}
        <div style={{ padding: '12px 14px 4px', fontSize: 8, fontWeight: 900, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)' }}>
          MAIN MENU
        </div>

        {/* Nav items */}
        {[
          { icon: '🎭', label: 'Live Rooms', sub: '24 Live Now', active: true, color: accentColor },
          { icon: '🌐', label: 'Lobby',     sub: 'Avatar World' },
          { icon: '💬', label: 'Messages',  sub: '12 Unread',  dot: '#FF2DAA' },
          { icon: '👥', label: 'Friends',   sub: '89 Online',  dot: '#00FF88' },
          { icon: '🎒', label: 'Inventory', sub: '145 Items', onClick: () => setShowInventory(v => !v) },
          { icon: '🧠', label: 'Memory Wall', sub: '324 Memories', onClick: () => setShowMemoryWall(v => !v) },
          { icon: '🎵', label: 'Playlists', sub: '42 Playlists' },
          { icon: '📷', label: 'Camera',    sub: 'Go Live' },
          { icon: '⭐', label: 'Rewards',   sub: `${userPoints.toLocaleString()} Points` },
          { icon: '🛒', label: 'Store',     sub: 'New Items' },
          { icon: '⚙️', label: 'Settings',  sub: '' },
        ].map((item) => (
          <div
            key={item.label}
            onClick={item.onClick}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 14px', cursor: 'pointer',
              background: item.active ? `${accentColor}14` : 'transparent',
              borderLeft: item.active ? `2px solid ${item.color ?? accentColor}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = `${accentColor}0a`)}
            onMouseLeave={e => (e.currentTarget.style.background = item.active ? `${accentColor}14` : 'transparent')}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11, fontWeight: item.active ? 700 : 500,
                color: item.active ? '#fff' : 'rgba(255,255,255,0.7)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {item.label}
                {item.active && <span style={{ fontSize: 8, background: `${accentColor}33`, color: accentColor, padding: '1px 5px', borderRadius: 3, fontWeight: 900 }}>›</span>}
              </div>
              {item.sub && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                  {item.dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />}
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{item.sub}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User card */}
        <div style={{
          padding: '10px 12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: `linear-gradient(135deg, ${accentColor}44, #AA2DFF44)`,
              border: `1.5px solid ${tierColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 900,
            }}>
              {userName.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{userName}</div>
              <div style={{ fontSize: 9, color: tierColor, fontWeight: 700, letterSpacing: '0.1em' }}>
                {userTier.toUpperCase()} MEMBER
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>LEVEL {userLevel}</span>
            <span style={{ fontSize: 9, color: accentColor }}>
              {userXp.toLocaleString()} / {userXpMax.toLocaleString()} XP
            </span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: `linear-gradient(90deg, ${accentColor}, #FF2DAA)`,
              width: `${Math.min((userXp / userXpMax) * 100, 100)}%`,
              transition: 'width 0.5s',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {[['128K', 'Fans'], ['2.3K', 'Following'], ['842', 'Rooms']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>
      )}

      {/* ══ CENTER STAGE ════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 5 }}>

        {/* Rail collapse controls for cinematic focus */}
        <div style={{ position: 'absolute', left: 10, top: 10, zIndex: 30 }}>
          <button
            onClick={() => setLeftRailVisible((v) => !v)}
            style={{
              background: 'rgba(0,0,0,0.65)',
              border: `1px solid ${accentColor}33`,
              color: '#fff',
              borderRadius: 999,
              width: 28,
              height: 28,
              cursor: 'pointer',
              fontSize: 12,
            }}
            title={leftRailVisible ? 'Hide left panel' : 'Show left panel'}
          >
            {leftRailVisible ? '◀' : '▶'}
          </button>
        </div>
        <div style={{ position: 'absolute', right: 10, top: 10, zIndex: 30 }}>
          <button
            onClick={() => setRightRailVisible((v) => !v)}
            style={{
              background: 'rgba(0,0,0,0.65)',
              border: `1px solid ${accentColor}33`,
              color: '#fff',
              borderRadius: 999,
              width: 28,
              height: 28,
              cursor: 'pointer',
              fontSize: 12,
            }}
            title={rightRailVisible ? 'Hide right panel' : 'Show right panel'}
          >
            {rightRailVisible ? '▶' : '◀'}
          </button>
        </div>

        {/* Room title bar */}
        <div style={{
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: `1px solid ${accentColor}18`,
          background: 'rgba(0,0,0,0.4)',
        }}>
          <span style={{ background: '#E63000', color: '#fff', fontSize: 8, fontWeight: 900, padding: '2px 7px', borderRadius: 3, letterSpacing: '0.1em' }}>
            🔥 LIVE NOW
          </span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{roomTitle}</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
            {genre} · {quality} Ultra HD
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => ExperienceOrchestrator.emit('SHOWCASE_TRIGGERED', { roomId })}
              style={{
                background: 'rgba(0,200,255,0.12)',
                border: '1px solid rgba(0,200,255,0.45)',
                color: '#00C8FF',
                fontSize: 8,
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: 999,
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >
              🔴 NOW AVAILABLE
            </button>
            <span style={{
              background: 'rgba(0,255,136,0.12)',
              border: '1px solid rgba(0,255,136,0.45)',
              color: '#00FF88',
              fontSize: 8,
              fontWeight: 900,
              padding: '3px 8px',
              borderRadius: 999,
              letterSpacing: '0.08em',
            }}>
              INSTANT PAYOUTS ACTIVE
            </span>
            <span style={{
              background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,215,0,0.5)',
              color: '#FFD700', fontSize: 9, fontWeight: 900, padding: '3px 8px', borderRadius: 4,
              letterSpacing: '0.05em',
            }}>{quality} ULTRA HD</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
              👁 {viewerCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Guided mission prompt layer */}
        <AnimatePresence>
          {showPrompt && (
            <motion.div
              key={activePrompt.id}
              initial={{ opacity: 0, y: activePrompt.anchor === 'top' ? -14 : 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: activePrompt.anchor === 'top' ? -12 : 12, scale: 0.97 }}
              transition={{ duration: 0.24 }}
              style={{
                position: 'absolute',
                top: activePrompt.anchor === 'top' ? 52 : 'auto',
                bottom: activePrompt.anchor === 'bottom' ? 118 : 'auto',
                left: 22,
                zIndex: 40,
                maxWidth: 360,
                background: 'rgba(3,3,14,0.92)',
                border: `1px solid ${promptToneColor}66`,
                borderRadius: 12,
                boxShadow: `0 0 22px ${promptToneColor}22`,
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: promptToneColor }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: promptToneColor }}>
                  {activePrompt.title.toUpperCase()}
                </span>
                <button
                  onClick={() => setShowPrompt(false)}
                  style={{
                    marginLeft: 'auto',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    fontSize: 14,
                    lineHeight: 1,
                  }}
                  title="Hide tips"
                >
                  ×
                </button>
              </div>
              <div style={{ fontSize: 10, lineHeight: 1.45, color: 'rgba(255,255,255,0.78)' }}>
                {activePrompt.body}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4-Monitor Grid — main experience */}
        <div style={{ flex: 1, padding: '8px 12px', minHeight: 0 }}>
          <VideoMonitorGrid
            slot1={slot1} slot2={slot2} slot3={slot3} slot4={slot4}
            accentColor={accentColor}
            style={{ height: '100%' }}
          />
        </div>

        {/* ── Collapsible bottom canister — Playlist / Memories / Photos ── */}
        <AnimatePresence>
          {bottomOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 180, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ overflow: 'hidden', borderTop: `1px solid ${accentColor}22` }}
            >
              <div style={{
                height: 180,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(12px)',
                padding: '8px 12px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Beat-reactive ambient layer — reads VisualSettingsStore, honours Low Motion Mode */}
                <AmbientVisualizer accentColor={accentColor} height={180} />
                {/* Tab bar — full Lock Rule #4 content list */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 10, overflowX: 'auto' }}>
                  {([
                    ['playlist',    '🎵', 'Playlist'],
                    ['memories',    '🧠', 'Memories'],
                    ['photos',      '📸', 'Photos'],
                    ['media-locker','🎬', 'Media Locker'],
                    ['achievements','🏆', 'Achievements'],
                    ['rewards',     '⭐', 'Rewards'],
                    ['stats',       '📊', 'Stats'],
                    ['inventory',   '🎒', 'Inventory'],
                    ['uploads',     '⬆️', 'Uploads'],
                    ['saved',       '💾', 'Saved'],
                    ['favorites',   '❤️', 'Favorites'],
                  ] as const).map(([tab, icon, label]) => (
                    <button
                      key={tab}
                      onClick={() => setBottomTab(tab)}
                      style={{
                        flexShrink: 0,
                        background: bottomTab === tab ? `${accentColor}22` : 'transparent',
                        border: `1px solid ${bottomTab === tab ? accentColor + '55' : 'rgba(255,255,255,0.1)'}`,
                        color: bottomTab === tab ? accentColor : 'rgba(255,255,255,0.4)',
                        borderRadius: 6, padding: '4px 10px',
                        fontSize: 8, fontWeight: 700, cursor: 'pointer',
                        letterSpacing: '0.06em', whiteSpace: 'nowrap',
                      }}
                    >
                      {icon} {label.toUpperCase()}
                    </button>
                  ))}
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>
                    Click items to open full view
                  </span>
                </div>
                {/* Content */}
                <div style={{ overflowX: 'auto', display: 'flex', gap: 8 }}>
                  {bottomTab === 'playlist' && (
                    <>
                      {['Hustle & Flow', 'Crown Night', 'Neon Pulse', 'LIVE SET Vol.4', 'Big Energy'].map((track, i) => (
                        <div key={track} style={{
                          flexShrink: 0, width: 100,
                          background: i === 0 ? `${accentColor}18` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${i === 0 ? accentColor + '44' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: 8, padding: '8px 8px',
                          cursor: 'pointer',
                        }}>
                          <div style={{ fontSize: 20, marginBottom: 4 }}>🎵</div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: i === 0 ? accentColor : '#fff' }}>{track}</div>
                          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>3:28</div>
                          {i === 0 && <div style={{ fontSize: 7, color: accentColor, fontWeight: 900, marginTop: 3 }}>NOW PLAYING</div>}
                        </div>
                      ))}
                    </>
                  )}
                  {bottomTab === 'memories' && (
                    <>
                      {['Thunder Dome', 'Battle Win', 'Concert Night', 'VIP Ticket', 'Fan Moment'].map(mem => (
                        <div key={mem} style={{
                          flexShrink: 0, width: 100, height: 90,
                          background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)',
                          borderRadius: 8, padding: 8, cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                        }}>
                          <div style={{ fontSize: 20, marginBottom: 4 }}>🏆</div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: '#FFD700' }}>{mem}</div>
                        </div>
                      ))}
                    </>
                  )}
                  {bottomTab === 'photos' && (
                    ['📸','🎤','🎵','👑','🔥'].map((icon, i) => (
                      <div key={i} style={{ flexShrink: 0, width: 90, height: 90, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{icon}</div>
                    ))
                  )}
                  {bottomTab === 'achievements' && (
                    [['🏆','First Win'],['🌟','Crowd Favorite'],['🔥','Standing Ovation'],['🎤','Stage Master'],['💎','Diamond League'],['⭐','100 Shows']].map(([icon, label]) => (
                      <div key={label} style={{ flexShrink: 0, width: 90, textAlign: 'center', background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 8, padding: '10px 6px', cursor: 'pointer' }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                        <div style={{ fontSize: 7, color: '#FFD700', fontWeight: 700 }}>{label}</div>
                      </div>
                    ))
                  )}
                  {(bottomTab === 'rewards' || bottomTab === 'stats' || bottomTab === 'inventory' || bottomTab === 'uploads' || bottomTab === 'media-locker' || bottomTab === 'saved' || bottomTab === 'favorites') && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', color: 'rgba(255,255,255,0.3)', fontSize: 10, padding: 20 }}>
                      {bottomTab === 'rewards' && '⭐ Your rewards load from the Rewards Engine'}
                      {bottomTab === 'stats' && '📊 Analytics load when audience threshold is met'}
                      {bottomTab === 'inventory' && '🎒 Inventory loads from InventoryCanister'}
                      {bottomTab === 'uploads' && '⬆️ Uploads load from your Media Locker'}
                      {bottomTab === 'media-locker' && '🎬 Your full media library — songs, videos, broadcasts'}
                      {bottomTab === 'saved' && '💾 Saved broadcasts and recordings'}
                      {bottomTab === 'favorites' && '❤️ Your favorited performers and venues'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chevron toggle — between grid and HUD */}
        <div
          onClick={() => setBottomOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '5px 12px', cursor: 'pointer',
            background: 'rgba(0,0,0,0.5)',
            borderTop: `1px solid ${accentColor}18`,
            borderBottom: `1px solid ${accentColor}18`,
            fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 700,
            letterSpacing: '0.12em',
          }}
        >
          <span>🎵 PLAYLIST</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span>🧠 MEMORIES</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span>📸 PHOTOS</span>
          <motion.span
            animate={{ rotate: bottomOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ marginLeft: 8, display: 'inline-block' }}
          >
            ⌄
          </motion.span>
        </div>

        {/* Bottom HUD */}
        <div style={{
          padding: '8px 16px',
          borderTop: `1px solid ${accentColor}18`,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          {/* Leave Room */}
          <button
            onClick={onLeave}
            style={{
              background: 'rgba(230,48,0,0.15)', border: '1.5px solid #E63000',
              color: '#E63000', borderRadius: 8, padding: '7px 14px',
              fontSize: 10, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.08em',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ◀ LEAVE ROOM
          </button>

          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />

          {/* Mic */}
          <HudButton
            icon="🎤" label="MIC" active={micOn} accentColor="#00FF88"
            onClick={() => { const next = !micOn; setMicOn(next); onMicToggle?.(next); }}
          />
          {/* Cam */}
          <HudButton
            icon="📷" label="CAM" active={camOn} accentColor={accentColor}
            onClick={() => { const next = !camOn; setCamOn(next); onCamToggle?.(next); }}
          />
          <HudButton icon="✋" label="RAISE HAND" accentColor="#FFD700" />
          <HudButton icon="😊" label="EMOTES" accentColor="#AA2DFF" />

          <div style={{ flex: 1 }} />

          {/* Advanced Settings button */}
          <button
            onClick={() => setShowAdvanced(true)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '7px 12px',
              fontSize: 9, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >
            ⚙️ ADVANCED
          </button>

          <button
            onClick={() => ExperienceOrchestrator.emit('SHOWCASE_TRIGGERED', { roomId })}
            style={{
              background: 'rgba(0,200,255,0.12)',
              border: '1px solid rgba(0,200,255,0.45)',
              color: '#00C8FF',
              borderRadius: 8,
              padding: '7px 10px',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            🎵 NOW AVAILABLE
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowShowcaseMenu((v) => !v)}
              style={{
                background: 'rgba(255,45,170,0.12)',
                border: '1px solid rgba(255,45,170,0.45)',
                color: '#FF2DAA',
                borderRadius: 8,
                padding: '7px 10px',
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.06em',
                cursor: 'pointer',
              }}
            >
              🎉 SHOWCASE ▾
            </button>

            <AnimatePresence>
              {showShowcaseMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  style={{
                    position: 'absolute',
                    bottom: 42,
                    right: 0,
                    width: 170,
                    background: 'rgba(6,6,20,0.94)',
                    border: '1px solid rgba(255,45,170,0.38)',
                    borderRadius: 10,
                    padding: 6,
                    boxShadow: '0 12px 26px rgba(0,0,0,0.58)',
                    zIndex: 250,
                  }}
                >
                  {[
                    ['album', '💿 Album'],
                    ['single', '🎵 Single'],
                    ['video', '🎥 Video'],
                    ['merch', '👕 Merch'],
                    ['tickets', '🎟 Tour'],
                    ['magazine', '📰 Magazine'],
                    ['premiere', '🎤 Premiere'],
                  ].map(([kind, label]) => (
                    <button
                      key={kind}
                      onClick={() => {
                        ExperienceOrchestrator.emit('SHOWCASE_TRIGGERED', {
                          roomId,
                          itemKind: kind as ReleaseAnnouncementKind,
                        });
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.03)',
                        color: 'rgba(255,255,255,0.88)',
                        borderRadius: 7,
                        padding: '6px 8px',
                        fontSize: 9,
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginBottom: 4,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid rgba(0,255,136,0.4)',
            color: '#00FF88',
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: '0.06em',
            background: 'rgba(0,255,136,0.08)',
          }}>
            TIPS SETTLE TO WALLET INSTANTLY
          </div>

          {/* Enter Stage */}
          <button
            onClick={onEnterStage}
            style={{
              background: `linear-gradient(135deg, ${accentColor}33, #AA2DFF33)`,
              border: `1.5px solid ${accentColor}66`,
              color: accentColor, borderRadius: 8, padding: '7px 16px',
              fontSize: 10, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.08em',
            }}
          >
            ⭐ ENTER STAGE
          </button>

          <button
            onClick={triggerEndShowFlow}
            style={{
              background: 'rgba(230,48,0,0.15)',
              border: '1.5px solid rgba(230,48,0,0.72)',
              color: '#FF7A66',
              borderRadius: 8,
              padding: '7px 12px',
              fontSize: 10,
              fontWeight: 900,
              cursor: 'pointer',
              letterSpacing: '0.08em',
            }}
          >
            🛑 END SHOW
          </button>
        </div>

        {/* Bottom nav strip (RECORD / SHARE / QUALITY etc) */}
        <div style={{
          padding: '5px 16px', background: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'center', gap: 4,
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          {['🏠 HOME','🔍 DISCOVER','🔴 LIVE NOW','🌐 LOBBY','💬 MESSAGES','🔔 NOTIF','📸 SCREENSHOT','⏺ RECORD','📤 SHARE',`📺 ${quality}`].map(label => (
            <button key={label} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: 8, cursor: 'pointer', padding: '3px 8px', borderRadius: 4,
              fontWeight: 700, letterSpacing: '0.06em',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => ((e.target as HTMLButtonElement).style.color = '#fff')}
            onMouseLeave={e => ((e.target as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)')}
            >
              {label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 8, color: '#00FF88', fontWeight: 900, letterSpacing: '0.1em' }}>
            PERFECT CONNECTION 48ms
          </div>
        </div>
      </div>

      {/* ══ RIGHT RAIL ══════════════════════════════════════════════════════ */}
      {rightRailVisible && (
      <GlassPanel style={{
        borderLeft: `1px solid ${accentColor}18`,
        borderRadius: 0, display: 'flex', flexDirection: 'column', zIndex: 10,
      }}>
        {/* Chat / Room / People tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {(['chat', 'room', 'people'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setRightTab(tab)}
              style={{
                flex: 1, padding: '10px 4px', background: 'none', border: 'none',
                color: rightTab === tab ? '#fff' : 'rgba(255,255,255,0.35)',
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
                borderBottom: rightTab === tab ? `2px solid ${accentColor}` : '2px solid transparent',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}
            >
              {tab === 'chat' ? '💬' : tab === 'room' ? '🏠' : '👥'} {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '10px 8px', fontSize: 14 }}>···</button>
        </div>

        {rightTab === 'chat' && (
          <>
            {/* Room header */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{roomTitle}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                ⬡ {viewerCount.toLocaleString()} people watching
              </div>
            </div>

            {/* Chat messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {msgs.map(msg => (
                <div key={msg.id} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  {msg.type === 'tip' ? (
                    <div style={{ fontSize: 9, color: '#FFD700' }}>
                      💰 <strong>{msg.user}</strong> tipped ${msg.amount}
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: 9, fontWeight: 700, color: accentColor, flexShrink: 0 }}>{msg.user}</span>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{msg.text}</span>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto', flexShrink: 0 }}>{msg.ts}</span>
                    </>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <form onSubmit={sendChat} style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 6 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a message..."
                maxLength={120}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                  padding: '6px 10px', fontSize: 10, color: '#fff',
                  outline: 'none',
                }}
              />
              <button type="submit" style={{
                background: accentColor, color: '#000', border: 'none',
                borderRadius: 8, padding: '6px 10px', fontSize: 11,
                fontWeight: 900, cursor: 'pointer',
              }}>↑</button>
            </form>

            {/* Rooms Nearby */}
            {roomsNearby.length > 0 && (
              <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                  ROOMS NEARBY <span style={{ float: 'right', color: accentColor, cursor: 'pointer' }}>VIEW ALL</span>
                </div>
                {roomsNearby.slice(0, 3).map(r => (
                  <div key={r.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10 }}>{r.name}</span>
                    <span style={{ fontSize: 9, color: accentColor }}>• {r.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Friends Online */}
            {friendsOnline.length > 0 && (
              <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                  FRIENDS ONLINE • {friendsOnline.length} <span style={{ float: 'right', color: accentColor, cursor: 'pointer' }}>VIEW ALL</span>
                </div>
                {friendsOnline.map(f => (
                  <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>{f.name}</div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>{f.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {rightTab === 'room' && (
          <div style={{ padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Room Info</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              <div>Genre: {genre}</div>
              <div>Quality: {quality} Ultra HD</div>
              <div>Viewers: {viewerCount.toLocaleString()}</div>
            </div>
          </div>
        )}

        {rightTab === 'people' && (
          <div style={{ padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>People ({viewerCount.toLocaleString()})</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
              Audience list loads via audience runtime.
            </div>
          </div>
        )}
      </GlassPanel>
      )}

      {/* ══ FLOATING INVENTORY WINDOW ══════════════════════════════════════ */}
      <AnimatePresence>
        {showInventory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'fixed', bottom: 120, left: 200, zIndex: 1000,
              width: 240,
            }}
          >
            <GlassPanel style={{
              border: `1.5px solid ${accentColor}44`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 24px ${accentColor}18`,
            }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em' }}>INVENTORY</span>
                <button onClick={() => setShowInventory(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
              <div style={{ padding: 10 }}>
                {inventorySlot ?? <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 20 }}>No items yet.</div>}
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ FLOATING MEMORY WALL WINDOW ════════════════════════════════════ */}
      <AnimatePresence>
        {showMemoryWall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'fixed', bottom: 120, right: 300, zIndex: 1000,
              width: 300,
            }}
          >
            <GlassPanel style={{
              border: `1.5px solid #FFD70044`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 24px rgba(255,215,0,0.1)',
            }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em' }}>MEMORY WALL</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['ALL','PHOTOS','VIDEOS','TICKETS'].map(t => (
                    <button key={t} style={{ background: t === 'ALL' ? '#FFD70022' : 'none', border: 'none', color: t === 'ALL' ? '#FFD700' : 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 700, cursor: 'pointer', padding: '2px 5px', borderRadius: 3 }}>{t}</button>
                  ))}
                  <button onClick={() => setShowMemoryWall(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 16, marginLeft: 4 }}>×</button>
                </div>
              </div>
              <div style={{ padding: 10 }}>
                {memoryWallSlot ?? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {['Thunder Dome', 'MarcelD Live', 'VIP Ticket', 'Concert'].map(mem => (
                      <div key={mem} style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 8, padding: 12, textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>🎵</div>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>{mem}</div>
                      </div>
                    ))}
                  </div>
                )}
                <button style={{
                  width: '100%', marginTop: 8, padding: '8px', borderRadius: 8,
                  background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)',
                  color: '#FFD700', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                }}>VIEW ALL MEMORIES</button>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      <ReleaseAnnouncementOverlay
        visible={showReleaseAnnouncement}
        phase={releaseAnnouncementPhase}
        mode={releaseAnnouncementMode}
        item={releaseAnnouncementItem}
        accentColor={accentColor}
        onAction={handleReleaseAction}
      />

      <AnimatePresence>
        {releaseToast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{
              position: 'fixed',
              right: 22,
              bottom: 88,
              zIndex: 3500,
              background: 'rgba(3,5,16,0.94)',
              color: 'rgba(255,255,255,0.92)',
              border: `1px solid ${accentColor}66`,
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.03em',
              boxShadow: `0 12px 24px rgba(0,0,0,0.58), 0 0 20px ${accentColor}22`,
            }}
          >
            {releaseToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ ADVANCED SETTINGS MODAL ════════════════════════════════════════ */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)', zIndex: 9000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={() => setShowAdvanced(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ width: 440, maxHeight: '80vh', overflowY: 'auto' }}
            >
              <GlassPanel style={{
                border: `1.5px solid ${accentColor}44`,
                boxShadow: `0 24px 64px rgba(0,0,0,0.8), 0 0 48px ${accentColor}12`,
              }}>
                <div style={{
                  padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: '0.05em' }}>ADVANCED SETTINGS</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Audience, Venue & Room Controls</div>
                  </div>
                  <button onClick={() => setShowAdvanced(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 20 }}>×</button>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Audience Settings */}
                  <section>
                    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: accentColor, marginBottom: 10 }}>AUDIENCE SETTINGS</div>
                    {[
                      { label: 'Max Audience Size', value: '2,730', type: 'input' },
                      { label: 'Bot Fill (Rule 15)', value: '92%', type: 'range' },
                      { label: 'Allow Anonymous Viewers', type: 'toggle', on: true },
                      { label: 'Audience Reactions Visible', type: 'toggle', on: true },
                      { label: 'Fan Camera On Stage', type: 'toggle', on: false },
                    ].map(s => (
                      <SettingRow key={s.label} {...s} accentColor={accentColor} />
                    ))}
                  </section>
                  {/* Venue Settings */}
                  <section>
                    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#FF2DAA', marginBottom: 10 }}>VENUE SETTINGS</div>
                    {[
                      { label: 'Venue Skin', value: 'Thunder Dome', type: 'select' },
                      { label: 'Stage Lighting', value: 'Neon Purple', type: 'select' },
                      { label: 'Seat Sections', value: 'Front/General/Balcony', type: 'input' },
                      { label: 'Allow Crowd Noise', type: 'toggle', on: true },
                    ].map(s => (
                      <SettingRow key={s.label} {...s} accentColor="#FF2DAA" />
                    ))}
                  </section>
                  {/* Quality */}
                  <section>
                    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#FFD700', marginBottom: 10 }}>STREAM QUALITY</div>
                    {[
                      { label: 'Resolution', value: quality, type: 'select' },
                      { label: 'Bitrate', value: '8 Mbps', type: 'select' },
                      { label: 'Studio Mode (AI enhance)', type: 'toggle', on: false },
                    ].map(s => (
                      <SettingRow key={s.label} {...s} accentColor="#FFD700" />
                    ))}
                  </section>
                  {/* Visual Experience — reads/writes VisualSettingsStore */}
                  <section>
                    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: accentColor, marginBottom: 10 }}>VISUAL EXPERIENCE</div>
                    <VisualSettingsPanel accentColor={accentColor} />
                  </section>
                </div>
                <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button onClick={() => setShowAdvanced(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>CANCEL</button>
                  <button onClick={() => setShowAdvanced(false)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: accentColor, color: '#000', fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>SAVE SETTINGS</button>
                </div>
              </GlassPanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function HudButton({ icon, label, active = false, accentColor, onClick }: {
  icon: string; label: string; active?: boolean; accentColor?: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${accentColor}22` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? accentColor + '66' : 'rgba(255,255,255,0.1)'}`,
        color: active ? accentColor : 'rgba(255,255,255,0.7)',
        borderRadius: 8, padding: '6px 10px',
        fontSize: 9, fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 5,
        letterSpacing: '0.06em',
        transition: 'all 0.15s',
      }}
    >
      {icon} {label}
      {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: accentColor }} />}
    </button>
  );
}

function SettingRow({ label, value, type, on, accentColor }: {
  label: string; value?: string; type?: string; on?: boolean; accentColor?: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{label}</span>
      {type === 'toggle' ? (
        <div style={{
          width: 32, height: 17, borderRadius: 9, cursor: 'pointer',
          background: on ? accentColor : 'rgba(255,255,255,0.15)',
          position: 'relative', transition: 'background 0.2s',
        }}>
          <div style={{
            position: 'absolute', top: 2, width: 13, height: 13, borderRadius: '50%',
            background: '#fff', transition: 'left 0.2s',
            left: on ? 17 : 2,
          }} />
        </div>
      ) : (
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{value}</span>
      )}
    </div>
  );
}
