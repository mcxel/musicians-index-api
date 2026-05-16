import type { PageId } from "./VisualOwnershipMap";

export interface PageIdentity {
  mood: string;
  purpose: string;
  category: string;
}

export function resolvePageIdentity(pageId: PageId): PageIdentity {
  switch (pageId) {
    case "cover":
    case "home1":
      return { mood: "prestige", purpose: "showcase", category: "cover" };
    case "home1-2":
      return { mood: "hype", purpose: "compete", category: "rankings" };
    case "home2":
      return { mood: "editorial", purpose: "discover", category: "editorial" };
    case "home3":
      return { mood: "live", purpose: "spectate", category: "events" };
    case "home4":
      return { mood: "commercial", purpose: "transact", category: "sponsors" };
    case "home5":
      return { mood: "battle", purpose: "compete", category: "arena" };
    case "games":
      return { mood: "playful", purpose: "interact", category: "games" };
    default:
      return { mood: "neutral", purpose: "browse", category: "general" };
  }
}