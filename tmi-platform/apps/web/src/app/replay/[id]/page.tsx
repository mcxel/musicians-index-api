import { redirect } from "next/navigation";

export default function ReplayPage({ params }: { params: { id: string } }) {
  redirect(`/shows/${params.id}?replay=1`);
}
