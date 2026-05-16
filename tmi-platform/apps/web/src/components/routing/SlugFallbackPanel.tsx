import { resolveSlug, type SlugEntity } from '@/lib/routing/SlugRecoveryEngine';

type Props = {
  entity: SlugEntity;
  slug: string;
};

export default function SlugFallbackPanel({ entity, slug }: Props) {
  const resolution = resolveSlug(entity, slug);

  return (
    <div style={{ border: '1px solid rgba(255,215,0,0.32)', borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 10, color: '#FFD700', fontWeight: 700 }}>SLUG FALLBACK</div>
      <div style={{ fontSize: 12, marginTop: 4 }}>{entity}:{slug}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.62)' }}>Found: {resolution.found ? 'yes' : 'no'}</div>
      <div style={{ fontSize: 11, color: '#FFD700' }}>Fallback route: {resolution.fallbackRoute}</div>
    </div>
  );
}
