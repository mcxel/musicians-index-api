import VenueTicketRail from "@/components/venue/VenueTicketRail";
import VenueSeatRail from "@/components/venue/VenueSeatRail";
import VenueBookingRail from "@/components/venue/VenueBookingRail";
import VenueAnalyticsRail from "@/components/venue/VenueAnalyticsRail";

export default function VenueHubShell() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto grid max-w-7xl gap-4">
        <header className="rounded-xl border border-cyan-400/35 bg-[linear-gradient(135deg,rgba(6,12,26,0.95),rgba(18,9,30,0.9))] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Venue Hub</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Economic Runtime: Venue Control</h1>
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Ticketing · Seat Map · Booking · Analytics
          </p>
        </header>

        <div className="grid gap-4">
          <VenueTicketRail />
          <VenueSeatRail />
          <VenueBookingRail />
          <VenueAnalyticsRail />
        </div>
      </div>
    </main>
  );
}
