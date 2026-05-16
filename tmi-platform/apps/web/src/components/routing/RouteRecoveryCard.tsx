import { getRouteStatus, resolveRoute } from '@/lib/routing/RouteClosureRegistry';

type Props = {
  route: string;
};

export default function RouteRecoveryCard({ route }: Props) {
  const status = getRouteStatus(route);
  const safeRoute = resolveRoute(route);

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.18)', borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 700 }}>ROUTE RECOVERY</div>
      <div style={{ fontSize: 12, marginTop: 4 }}>Route: {route}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.62)' }}>Status: {status?.status ?? 'untracked'}</div>
      <div style={{ fontSize: 11, color: '#00FFFF' }}>Fallback: {safeRoute}</div>
    </div>
  );
}
