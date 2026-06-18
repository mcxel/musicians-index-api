import Home4AdMagazine from "@/components/home/Home4AdMagazine";
import SponsorRail from '@/components/sponsors/SponsorRail';
import EventReel from '@/components/events/EventReel';
import { getRailSponsors } from '@/lib/commerce/SponsorRegistry';

export default function Home4Page() {
  const sponsors = getRailSponsors('home-4');
  return (
    <>
      <SponsorRail sponsors={sponsors} zone="home-4-top" />
      <Home4AdMagazine />
      <EventReel zone="home-4" />
    </>
  );
}
