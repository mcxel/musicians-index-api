import { redirect } from "next/navigation";

interface Props {
  params: { slug: string };
}

export default function VenueSlugPage({ params }: Props) {
  redirect(`/venue/${params.slug}`);
}
