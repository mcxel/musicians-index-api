import VenueWorldShell from "@/components/venues/VenueWorldShell";

export default function VenueBackstagePage({ params }: { params: { slug: string } }) {
  return <VenueWorldShell slug={params.slug} focus="backstage" />;
}
