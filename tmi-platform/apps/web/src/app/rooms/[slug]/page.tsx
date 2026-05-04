import { redirect } from "next/navigation";

export default function LegacyRoomRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/lobbies/${params.slug}`);
}
