import { redirect } from "next/navigation";

export default async function ArtistVaultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/artists/${slug}`);
}
