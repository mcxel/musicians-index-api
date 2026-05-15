import HomeSurfacePage from '@/components/home/system/HomeSurfacePage';
import Link from 'next/link';

export default function HomeCoverPage() {
  return (
    <main role="main" tabIndex={-1} data-telemetry="home.cover.render">
      <Link href="#content" className="sr-only focus:not-sr-only">
        Skip to content
      </Link>
      <HomeSurfacePage surfaceId={1} />
    </main>
  );
}
