import HomeSurfacePage from '@/components/home/system/HomeSurfacePage';
import Link from 'next/link';

export default function HomeControlPage() {
  return (
    <main role="main" tabIndex={-1} data-telemetry="home.control.render">
      <Link href="#content" className="sr-only focus:not-sr-only">
        Skip to content
      </Link>
      <HomeSurfacePage surfaceId={5} />
    </main>
  );
}
