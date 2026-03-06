export type Role = "USER" | "ADMIN" | "ARTIST" | "STAFF";
export type UserPublic = {
    id: string;
    role: Role;
    name: string | null;
    email: string | null;
    image: string | null;
    emailVerified?: string | null;
};
export type ArtistPublic = {
    id: string;
    name: string;
    userId: string;
    bio: string | null;
};
export type ApiError = {
    message: string;
    code?: string;
};
export type ApiResponse<T> = {
    ok: true;
    data: T;
} | {
    ok: false;
    error: ApiError;
};
export type ProductKey = string & {
    __brand?: "ProductKey";
};
export type PlacementSurface = string & {};
export type PlacementContext = {
    surface: PlacementSurface;
    moduleKey: string;
    route?: string;
    locale?: string;
    userRole?: Role;
    sessionId?: string;
    userId?: string;
};
export type PromoCreative = {
    id?: string;
    title?: string;
    headline?: string;
    subhead?: string;
    body?: string;
    cta?: string;
    href?: string;
    badge?: string;
    imageUrl?: string;
};
export type PromoSlot = {
    id: string;
    product: ProductKey;
    priority: number;
    creative: PromoCreative;
    impressionKey: string;
};
