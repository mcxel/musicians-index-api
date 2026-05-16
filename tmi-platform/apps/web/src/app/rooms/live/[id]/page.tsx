import type { Metadata } from "next";
import StageSeatLensRuntime from "@/components/live/StageSeatLensRuntime";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const name = params.id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return { title: `${name} | TMI Live Room`, description: `Live room lobby — ${name}` };
}

export default function LiveRoomPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { lens?: string };
}) {
  const lens = searchParams?.lens === "performer" ? "performer" : "fan";
  return <StageSeatLensRuntime roomId={params.id} lens={lens} />;
}
