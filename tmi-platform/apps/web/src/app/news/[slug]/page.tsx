import { redirect } from "next/navigation";

export default function NewsSlugPage({ params }: { params: { slug: string } }) {
  redirect(`/magazine/news/${params.slug}`);
}
