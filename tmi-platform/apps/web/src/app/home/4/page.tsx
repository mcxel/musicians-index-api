import Home4MarketplacePage from "@/components/home/Home4MarketplacePage";
import SponsorRail from '@/components/sponsors/SponsorRail';
import EventReel from '@/components/events/EventReel';
import { getRailSponsors } from '@/lib/commerce/SponsorRegistry';

export default function Home4Page() {
  const sponsors = getRailSponsors('home-4');
  return (
    <>
      <SponsorRail sponsors={sponsors} zone="home-4-top" />
      <Home4MarketplacePage />
      <EventReel zone="home-4" />
    </>
  );
}
