// apps/web/src/lib/api/api-client.ts
// Typed API client for all platform API calls.
// All fetch calls go through here — never raw fetch in components.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

class APIError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new APIError(res.status, err.code || "UNKNOWN", err.message || "Request failed");
  }
  return res.json();
}

// ── AUTH ──────────────────────────────────────────────
export const authAPI = {
  login:    (email: string, password: string) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (data: Record<string, string>) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  logout:   () => request("/auth/logout", { method: "POST" }),
  me:       () => request("/auth/me"),
};

// ── ROOMS (ALWAYS viewers_asc — Platform Law #1) ──────
export const roomsAPI = {
  getLobby:  () => request<any[]>("/rooms"),  // returns ORDER BY viewer_count ASC
  getRoom:   (id: string) => request(`/rooms/${id}`),
  joinRoom:  (id: string) => request(`/rooms/${id}/join`, { method: "POST" }),
  leaveRoom: (id: string) => request(`/rooms/${id}/leave`, { method: "POST" }),
};

// ── ADS (always 200 — Platform Law #7) ───────────────
export const adsAPI = {
  getSlot:       (zone: string) => request(`/ads/slot/${zone}`),
  impression:    (placementId: string) => request("/ads/impressions", { method: "POST", body: JSON.stringify({ placementId }) }),
  click:         (placementId: string) => request("/ads/clicks", { method: "POST", body: JSON.stringify({ placementId }) }),
};

// ── ARTISTS ───────────────────────────────────────────
export const artistsAPI = {
  getAll:   (params?: Record<string, string>) => request(`/artists?${new URLSearchParams(params)}`),
  getBySlug:(slug: string) => request(`/artists/${slug}`),
  getStats: (slug: string) => request(`/artists/${slug}/stats`),
};

// ── ARTICLES ─────────────────────────────────────────
export const articlesAPI = {
  getAll:   (params?: Record<string, string>) => request(`/articles?${new URLSearchParams(params)}`),
  getBySlug:(slug: string) => request(`/articles/${slug}`),
  like:     (id: string) => request(`/articles/${id}/like`, { method: "POST" }),
};

// ── GAMES ─────────────────────────────────────────────
export const gamesAPI = {
  getAll:    () => request("/games"),
  getById:   (id: string) => request(`/games/${id}`),
  join:      (id: string) => request(`/games/${id}/join`, { method: "POST" }),
  vote:      (id: string, targetId: string) => request(`/games/${id}/vote`, { method: "POST", body: JSON.stringify({ targetId }) }),
  nextRound: (id: string) => request(`/games/${id}/round/next`, { method: "POST" }),
};

// ── WALLET ───────────────────────────────────────────
export const walletAPI = {
  getMine:      () => request("/wallet/mine"),
  transactions: () => request("/wallet/transactions"),
  tip:          (artistId: string, amountCents: number) => request("/wallet/tip", { method: "POST", body: JSON.stringify({ artistId, amountCents }) }),
  payoutRequest:(amountCents: number) => request("/wallet/payout-request", { method: "POST", body: JSON.stringify({ amountCents }) }),
};

// ── ECONOMY ──────────────────────────────────────────
export const economyAPI = {
  getShop:     (zone?: string) => request(`/economy/shop${zone ? `?zone=${zone}` : ""}`),
  purchase:    (itemId: string) => request("/economy/purchase", { method: "POST", body: JSON.stringify({ itemId }) }),
  getInventory:() => request("/economy/inventory"),
  equip:       (loadout: Record<string, string>) => request("/economy/equip", { method: "POST", body: JSON.stringify({ loadout }) }),
};

// ── TICKETS ──────────────────────────────────────────
export const ticketsAPI = {
  getMine:   () => request("/tickets/mine"),
  getById:   (id: string) => request(`/tickets/${id}`),
  purchase:  (data: { eventId: string; tierId: string; quantity: number }) =>
    request("/tickets/purchase-intent", { method: "POST", body: JSON.stringify(data) }),
};

// ── SCORING ──────────────────────────────────────────
export const scoringAPI = {
  getLeaderboard: (type: string) => request(`/scoring/leaderboard/${type}`),
  getCrown:       () => request("/scoring/crown"),
};

// ── SEARCH ───────────────────────────────────────────
export const searchAPI = {
  search: (q: string, type?: string) => request(`/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ""}`),
};

// ── NOTIFICATIONS ─────────────────────────────────────
export const notificationsAPI = {
  getAll:  () => request("/notifications"),
  markRead:(id: string) => request(`/notifications/${id}/read`, { method: "POST" }),
  readAll: () => request("/notifications/read-all", { method: "POST" }),
};

// ── MEDIA ─────────────────────────────────────────────
export const mediaAPI = {
  getUploadUrl: (type: string, filename: string) => request("/media/upload-url", { method: "POST", body: JSON.stringify({ type, filename }) }),
  confirmUpload:(id: string) => request(`/media/confirm/${id}`, { method: "POST" }),
  getStatus:    (id: string) => request(`/media/${id}/status`),
};
