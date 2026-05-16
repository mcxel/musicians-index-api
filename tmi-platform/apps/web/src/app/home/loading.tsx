import ClosedMagazineShell from "@/components/magazine/ClosedMagazineShell";

export default function HomeLoading() {
  return (
    <main className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-[#06070d]">
      <ClosedMagazineShell title="TMI Home Issue" subtitle="Initializing magazine shell..." />
    </main>
  );
}
