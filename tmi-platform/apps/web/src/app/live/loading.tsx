import SeatArrivalTransition from "@/components/live/SeatArrivalTransition";

export default function LiveLoading() {
  return (
    <>
      <SeatArrivalTransition />
      <main className="min-h-screen bg-[#050510]" aria-label="Entering live room" />
    </>
  );
}

