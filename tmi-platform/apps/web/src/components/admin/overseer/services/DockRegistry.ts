"use client";

export type HQDockItem = {
  id: string;
  label: string;
  href: string;
  tone?: "gold" | "cyan" | "violet" | "rose" | "neutral";
};

const DEFAULT_DOCK_ITEMS: HQDockItem[] = [
  { id: "go-back", label: "Go Back", href: "/admin", tone: "gold" },
  { id: "voice", label: "Voice", href: "/admin/overseer#live-feed-router", tone: "cyan" },
  { id: "audio", label: "Audio", href: "/admin/overseer#live-feed-router", tone: "cyan" },
  { id: "disclaimer", label: "Disclaimer", href: "/legal/disclaimer", tone: "neutral" },
  { id: "revenue", label: "Revenue", href: "/admin/revenue", tone: "gold" },
  { id: "messages", label: "Messages", href: "/admin/messages", tone: "violet" },
  { id: "users", label: "Users", href: "/admin/users", tone: "neutral" },
  { id: "settings", label: "Settings", href: "/admin/settings", tone: "neutral" },
  { id: "power", label: "Power", href: "/", tone: "rose" },
];

export function resolveDockItems(configured?: Array<{ label: string; href: string }>): HQDockItem[] {
  if (!configured || configured.length === 0) {
    return DEFAULT_DOCK_ITEMS;
  }

  return configured.map((item, index) => ({
    id: `${index}-${item.label.toLowerCase().replace(/\s+/g, "-")}`,
    label: item.label,
    href: item.href,
    tone: index % 4 === 0 ? "gold" : index % 4 === 1 ? "cyan" : index % 4 === 2 ? "violet" : "neutral",
  }));
}
