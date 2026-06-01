import { redirect } from "next/navigation";

type Props = { params: { feature: string } };

const FEATURE_ROUTES: Record<string, string> = {
  "live-merch":      "/shop",
  "backstage-pass":  "/season-pass",
  "nft-drops":       "/nft-lab/drops",
  "collab-studio":   "/go-live?type=collab",
  "artist-academy":  "/articles",
  "fan-club":        "/hub/fan",
  "watch-parties":   "/live/rooms",
  "cypher-league":   "/cypher",
  "ai-mastering":    "/beats/submit",
  "booking-pro":     "/booking",
  "merch":           "/shop",
  "vip-rooms":       "/live/rooms",
  "analytics":       "/analytics",
  "magazine":        "/magazine",
};

export default function ComingSoonPage({ params }: Props) {
  const dest = FEATURE_ROUTES[params.feature] ?? "/home/1";
  redirect(dest);
}
