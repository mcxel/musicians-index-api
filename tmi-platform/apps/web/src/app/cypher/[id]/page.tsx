import { redirect } from "next/navigation";

export default function CypherByIdPage({ params }: { params: { id: string } }) {
  redirect(`/cypher/${params.id}`);
}
