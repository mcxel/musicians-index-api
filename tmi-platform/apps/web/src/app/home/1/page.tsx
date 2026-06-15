import React from 'react';
import Home1CoverPage from '@/components/home/Home1CoverPage';
import SponsorRail from '@/components/sponsors/SponsorRail';
import EventReel from '@/components/events/EventReel';

const SEED_SPONSORS = [
  { id: 'amplify',   name: 'AMPLIFY RECORDS',       tagline: 'Platinum Partner' },
  { id: 'beatlab',   name: 'BEATLAB STUDIOS',        tagline: 'Gold Partner'    },
  { id: 'velocity',  name: 'VELOCITY AUDIO',         tagline: 'Gold Partner'    },
  { id: 'nova',      name: 'NOVA MEDIA GROUP',       tagline: 'Silver Partner'  },
  { id: 'crown',     name: 'CROWN & CO.',            tagline: ''                },
  { id: 'frequency', name: 'FREQUENCY LABS',         tagline: ''                },
  { id: 'vault',     name: 'THE VAULT COLLECTIVE',   tagline: ''                },
  { id: 'sonic',     name: 'SONIC AXIS',             tagline: ''                },
];

export default function Home1Route() {
  return (
    <>
      <SponsorRail sponsors={SEED_SPONSORS} zone="home-1-top" />
      <Home1CoverPage />
      <EventReel zone="home-1" />
    </>
  );
}