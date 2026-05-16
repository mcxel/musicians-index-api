import VenueWorldShell from "@/components/venues/VenueWorldShell";

export default function VenueStagePage({ params }: { params: { slug: string } }) {
  return <VenueWorldShell slug={params.slug} focus="stage" />;
}
