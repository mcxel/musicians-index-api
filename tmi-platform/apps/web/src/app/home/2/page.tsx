import LiveDiscoverySurface from "@/components/home/LiveDiscoverySurface";

export default function Home2Page() {
  return (
    <LiveDiscoverySurface
      title="Concert Wall"
      subtitle="Shows & Live Performances"
      genres={["concert", "live"]}
      accent="#FF2DAA"
      backHref="/home/1"
    />
  );
}
