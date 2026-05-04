import { redirect } from "next/navigation";

export default async function ArtistStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/artists/${slug}`);
}
