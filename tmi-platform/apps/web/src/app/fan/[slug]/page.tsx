import { redirect } from "next/navigation";

export default async function FanProfileAliasPage({ params }: { params: { slug: string } }) {
  redirect(`/profile/fan/${params.slug}`);
}
