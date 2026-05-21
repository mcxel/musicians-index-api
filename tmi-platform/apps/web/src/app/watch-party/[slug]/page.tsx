import { redirect } from "next/navigation";

export default function WatchPartyPage({ params }: { params: { slug: string } }) {
  redirect(`/rooms/watch-party?show=${params.slug}`);
}
