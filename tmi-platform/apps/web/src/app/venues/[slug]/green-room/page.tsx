import VenueWorldShell from "@/components/venues/VenueWorldShell";

export default function VenueGreenRoomPage({ params }: { params: { slug: string } }) {
  return <VenueWorldShell slug={params.slug} focus="green-room" />;
}
