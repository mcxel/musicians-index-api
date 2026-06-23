import { redirect } from "next/navigation";

export default function ArtistPublicProfileAlias({ params }: { params: { slug: string } }) {
  redirect(`/profile/artist/${params.slug}`);
}
