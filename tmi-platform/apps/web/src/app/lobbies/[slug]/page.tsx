import { redirect } from "next/navigation";

// /lobbies/[slug] → /rooms/[slug]?autoSeat=1
// Instant entry: no manual seat picker, no countdown shell
// rooms/[slug] handles auto-seating via LobbyTheaterShell + autoSeat param
export default function LobbySlugPage({ params }: { params: { slug: string } }) {
  redirect(`/rooms/${params.slug}?autoSeat=1`);
}
