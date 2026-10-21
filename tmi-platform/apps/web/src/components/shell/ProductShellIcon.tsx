"use client";

import {
  Archive,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  Clapperboard,
  Drum,
  Headphones,
  Medal,
  MessageSquare,
  Newspaper,
  ShoppingBag,
  Store,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  communication: MessageSquare,
  booking: CalendarDays,
  media: Headphones,
  bio_magazine: Newspaper,
  commerce_center: Store,
  commercial: BarChart3,
  analytics: BarChart3,
  achievement_center: Medal,
  championship_center: Award,
  yopho: Clapperboard,
  shop_center: ShoppingBag,
  marketplace_center: Store,
  avatar: UserRound,
  memory: Archive,
  rewards: Trophy,
  statistics: BarChart3,
  beat_locker: Headphones,
  beat_queue: Drum,
  beat_analytics: BarChart3,
  beat_marketplace_center: Store,
  "your-page": BookOpen,
  magazine: Newspaper,
  articles: Newspaper,
  welcome: BookOpen,
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
  return <Icon size={size} strokeWidth={1.75} aria-hidden color="currentColor" />;
}
