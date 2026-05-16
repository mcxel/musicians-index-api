import RouteStubPage from '@/components/routing/RouteStubPage';

export default function DiscoverPage({ params }: { params: { id: string } }) {
  return (
    <RouteStubPage
      title="Discover Detail"
      subtitle="Placeholder discovery route for genres, featured talent, and trend clusters."
      route={`/discover/${params.id}`}
    />
  );
}
