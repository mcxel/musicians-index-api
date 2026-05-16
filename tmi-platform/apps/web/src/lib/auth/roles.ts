// lib/auth/roles.ts — Role permission matrix for TMI platform

export type TMIRole =
  | "MEMBER"
  | "ARTIST"
  | "PERFORMER"
  | "SPONSOR"
  | "ADVERTISER"
  | "VENUE"
  | "ADMIN"
  | "BOT";

export type TMIPermission =
  | "view:public" | "view:rooms" | "chat:public" | "vote:contests"
  | "earn:xp" | "earn:wallet" | "create:profile" | "upload:media"
  | "create:article" | "enter:backstage" | "enter:green-room"
  | "enter:host-control" | "enter:vip" | "manage:booking"
  | "manage:venue" | "manage:campaigns" | "manage:placements"
  | "manage:sponsor-rewards" | "purchase:sponsor-slot"
  | "purchase:ad-slot" | "purchase:spotlight" | "tip:artists"
  | "subscribe:platform" | "access:beat-lab" | "access:nft-lab"
  | "access:cypher" | "host:events" | "admin:users" | "admin:bots"
  | "admin:revenue" | "admin:moderation" | "admin:system" | "admin:all";

const ROLE_PERMISSIONS: Record<TMIRole, TMIPermission[]> = {
  MEMBER: [
    "view:public","view:rooms","chat:public","vote:contests",
    "earn:xp","earn:wallet","create:profile","tip:artists","subscribe:platform",
  ],
  ARTIST: [
    "view:public","view:rooms","chat:public","vote:contests",
    "earn:xp","earn:wallet","create:profile","upload:media","create:article",
    "enter:backstage","enter:green-room","enter:vip","tip:artists",
    "subscribe:platform","access:beat-lab","access:nft-lab","access:cypher","host:events",
  ],
  PERFORMER: [
    "view:public","view:rooms","chat:public","vote:contests",
    "earn:xp","earn:wallet","create:profile","upload:media",
    "enter:backstage","enter:green-room","access:cypher",
    "host:events","tip:artists","subscribe:platform",
  ],
  SPONSOR: [
    "view:public","view:rooms","chat:public","earn:xp","earn:wallet",
    "create:profile","manage:sponsor-rewards","purchase:sponsor-slot",
    "manage:campaigns","subscribe:platform",
  ],
  ADVERTISER: [
    "view:public","view:rooms","chat:public","earn:xp","earn:wallet",
    "create:profile","manage:campaigns","manage:placements",
    "purchase:ad-slot","subscribe:platform",
  ],
  VENUE: [
    "view:public","view:rooms","chat:public","earn:xp","earn:wallet",
    "create:profile","manage:venue","manage:booking",
    "host:events","enter:host-control","subscribe:platform",
  ],
  ADMIN: [
    "view:public","view:rooms","chat:public","vote:contests",
    "earn:xp","earn:wallet","create:profile","upload:media","create:article",
    "enter:backstage","enter:green-room","enter:host-control","enter:vip",
    "manage:booking","manage:venue","manage:campaigns","manage:placements","manage:sponsor-rewards",
    "purchase:sponsor-slot","purchase:ad-slot","purchase:spotlight",
    "tip:artists","subscribe:platform","access:beat-lab","access:nft-lab","access:cypher","host:events",
    "admin:users","admin:bots","admin:revenue","admin:moderation","admin:system","admin:all",
  ],
  BOT: ["view:public","view:rooms","chat:public"],
};

export function hasPermission(role: TMIRole, permission: TMIPermission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
export function getPermissions(role: TMIRole): TMIPermission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
export function getRoleLabel(role: TMIRole): string {
  const m: Record<TMIRole,string> = { MEMBER:"Member",ARTIST:"Artist",PERFORMER:"Performer",SPONSOR:"Sponsor",ADVERTISER:"Advertiser",VENUE:"Venue",ADMIN:"Admin",BOT:"Bot" };
  return m[role] ?? role;
}
export function getRoleColor(role: TMIRole): string {
  const m: Record<TMIRole,string> = { MEMBER:"#00FFFF",ARTIST:"#FF2DAA",PERFORMER:"#FF9500",SPONSOR:"#AA2DFF",ADVERTISER:"#FFD700",VENUE:"#00FF88",ADMIN:"#FF3C3C",BOT:"#888888" };
  return m[role] ?? "#ffffff";
}
export function getRoleIcon(role: TMIRole): string {
  const m: Record<TMIRole,string> = { MEMBER:"🎧",ARTIST:"🎤",PERFORMER:"🎭",SPONSOR:"🏆",ADVERTISER:"📢",VENUE:"🏟️",ADMIN:"⚡",BOT:"🤖" };
  return m[role] ?? "👤";
}
export function getDashboardRoute(role: TMIRole): string {
  const m: Record<TMIRole,string> = { ADMIN:"/admin",ARTIST:"/artists/dashboard",PERFORMER:"/hub/performer",SPONSOR:"/sponsor/dashboard",ADVERTISER:"/advertiser/dashboard",VENUE:"/venues/dashboard",MEMBER:"/dashboard",BOT:"/admin/bots" };
  return m[role] ?? "/dashboard";
}
