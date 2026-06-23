export interface MediaRoute {
  mediaId: string;
  destination: "headquarters" | "profile" | "live-room" | "billboard";
  destinationId?: string;
}

export interface MediaRouter {
  routeMedia(route: MediaRoute): Promise<void>;
}
