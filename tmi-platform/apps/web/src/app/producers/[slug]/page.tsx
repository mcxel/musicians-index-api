import { redirect } from "next/navigation";

export default function ProducerAliasPage({ params }: { params: { slug: string } }) {
  redirect(`/producer/${params.slug}`);
}