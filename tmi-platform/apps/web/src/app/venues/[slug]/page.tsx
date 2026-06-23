import { redirect } from "next/navigation";

interface Props {
  params: { slug: string };
}

export default function VenueAliasPage({ params }: Props) {
  redirect(`/venue/${params.slug}`);
}
