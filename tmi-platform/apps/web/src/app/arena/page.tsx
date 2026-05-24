import type { Metadata } from "next";
import BillboardArena from "@/components/arena/BillboardArena";

export const metadata: Metadata = {
  title: "Choose Your District | TMI",
  description: "Enter the Billboard Arena — live concerts, battles, social, magazine, and market districts.",
};

export default function ArenaPage() {
  return <BillboardArena />;
}
