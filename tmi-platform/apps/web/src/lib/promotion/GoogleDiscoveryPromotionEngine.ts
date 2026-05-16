import { getCountry } from "@/lib/global/GlobalCountryRegistry";

export interface GoogleDiscoveryCopy {
  title: string;
  description: string;
  keywords: string[];
}

export class GoogleDiscoveryPromotionEngine {
  static buildLiveMusicTonight(city: string): GoogleDiscoveryCopy {
    return {
      title: `Live Music Tonight in ${city} | BernoutGlobal`,
      description: `See live music, battles, and cyphers happening tonight in ${city} on The Musician's Index by BernoutGlobal.`,
      keywords: ["live music tonight", city, "BernoutGlobal", "The Musician's Index"],
    };
  }

  static buildBattleTonight(city: string): GoogleDiscoveryCopy {
    return {
      title: `Battle of the Bands Tonight in ${city} | BernoutGlobal`,
      description: `Discover tonight's live music battles in ${city} on The Musician's Index.`,
      keywords: ["battle of the bands", city, "music battle live now", "BernoutGlobal"],
    };
  }

  static buildCountryCampaign(countryCode: string): GoogleDiscoveryCopy {
    const country = getCountry(countryCode);
    const countryName = country?.name ?? countryCode.toUpperCase();
    return {
      title: `Top Music Promotions in ${countryName} | The Musician's Index`,
      description: `Explore artist promotions, billboards, and live events in ${countryName} by BernoutGlobal.`,
      keywords: [countryName, "artist promotion", "billboards", "The Musician's Index"],
    };
  }
}

export default GoogleDiscoveryPromotionEngine;
