import Home4AdMagazine from "@/components/home/Home4AdMagazine";
import SponsorRail from '@/components/sponsors/SponsorRail';

const SEED_SPONSORS = [
  { id: 'amplify',   name: 'AMPLIFY RECORDS',     tagline: 'Platinum Partner' },
  { id: 'beatlab',   name: 'BEATLAB STUDIOS',      tagline: 'Gold Partner'    },
  { id: 'velocity',  name: 'VELOCITY AUDIO',       tagline: 'Gold Partner'    },
  { id: 'nova',      name: 'NOVA MEDIA GROUP',     tagline: 'Silver Partner'  },
  { id: 'crown',     name: 'CROWN & CO.',          tagline: ''                },
  { id: 'frequency', name: 'FREQUENCY LABS',       tagline: ''                },
  { id: 'vault',     name: 'THE VAULT COLLECTIVE', tagline: ''                },
  { id: 'sonic',     name: 'SONIC AXIS',           tagline: ''                },
];

export default function Home4Page() {
  return (
    <>
      <SponsorRail sponsors={SEED_SPONSORS} zone="home-4-top" />
      <Home4AdMagazine />
    </>
  );
}
