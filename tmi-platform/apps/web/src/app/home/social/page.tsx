import HomeSurfacePage from '@/components/home/system/HomeSurfacePage';
import Link from 'next/link';

export default function HomeSocialHubPage() {
  return (
    <main role="main" tabIndex={-1} data-telemetry="home.social.render">
      <Link href="#content" className="sr-only focus:not-sr-only">
        Skip to content
      </Link>
      <HomeSurfacePage surfaceId={4} />
    </main>
  );
}
