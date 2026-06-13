import { redirect } from "next/navigation";

export default function BeatsUploadPage({ searchParams }: { searchParams: { edit?: string } }) {
  const qs = searchParams.edit ? `?edit=${searchParams.edit}` : "";
  redirect(`/beats/submit${qs}`);
}
