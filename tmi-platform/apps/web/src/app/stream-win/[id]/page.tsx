import { redirect } from "next/navigation";

export default function StreamWinPage({ params }: { params: { id: string } }) {
  redirect(`/shows/${params.id}`);
}
