import { redirect } from "next/navigation";

export default async function ArtistProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/performers/${slug}`);
}
