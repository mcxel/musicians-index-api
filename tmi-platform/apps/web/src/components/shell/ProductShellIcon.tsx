"use client";

/**
 * Canonical white line icons for Hub left-rail / GPS OC buttons.
 * Authority: Lucide strokes only (#FFFFFF). Never emoji / Twemoji / OC.icon cartoons.
 */

import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Camera,
  Crown,
  Drum,
  Headphones,
  IdCard,
  MessageCircle,
  Music,
  Newspaper,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trophy,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/** Maps OperatingCenter.id (+ session shortcut keys) → white stroke icon. */
const ICONS: Record<string, LucideIcon> = {
  avatar: UserRound,
  memory: Camera,
  rewards: Trophy,
  achievement_center: Crown,
  championship_center: Trophy,
  yopho: IdCard,
  statistics: BarChart3,
  communication: MessageCircle,
  booking: CalendarDays,
  media: Music,
  bio_magazine: Newspaper,
  commerce_center: ShoppingCart,
  commercial: Wallet,
  analytics: BarChart3,
  shop_center: Store,
  marketplace_center: ShoppingBag,
  beat_locker: Headphones,
  beat_queue: Drum,
  beat_analytics: BarChart3,
  beat_marketplace_center: Store,
  "your-page": BookOpen,
  magazine: Newspaper,
  articles: Newspaper,
  welcome: BookOpen,
  settings: Settings,
};

export function ProductShellIcon({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return (
    <Icon
      size={size}
      strokeWidth={1.75}
      aria-hidden
      color="#FFFFFF"
      fill="none"
      data-product-shell-icon={name}
    />
  );
}
