import { redirect } from "next/navigation";

export default function PerformerAliasPage({ params }: { params: { slug: string } }) {
  redirect(`/profile/performer/${params.slug}`);
}
