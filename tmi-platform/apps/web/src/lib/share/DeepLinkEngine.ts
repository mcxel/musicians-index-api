export interface DeepLinkContext {
  source?: string;
  medium?: string;
  campaign?: string;
  ref?: string;
}

function sanitizePath(path: string): string {
  if (!path) return '/';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const url = new URL(path);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return '/';
    }
  }
  return path.startsWith('/') ? path : `/${path}`;
}

export function buildDeepLink(baseUrl: string, path: string, context?: DeepLinkContext): string {
  const target = new URL(sanitizePath(path), baseUrl);

  if (context?.source) target.searchParams.set('utm_source', context.source);
  if (context?.medium) target.searchParams.set('utm_medium', context.medium);
  if (context?.campaign) target.searchParams.set('utm_campaign', context.campaign);
  if (context?.ref) target.searchParams.set('ref', context.ref);

  return target.toString();
}

export function buildRelativeDeepLink(path: string, context?: DeepLinkContext): string {
  const normalized = sanitizePath(path);
  const query = new URLSearchParams();

  if (context?.source) query.set('utm_source', context.source);
  if (context?.medium) query.set('utm_medium', context.medium);
  if (context?.campaign) query.set('utm_campaign', context.campaign);
  if (context?.ref) query.set('ref', context.ref);

  const raw = query.toString();
  return raw ? `${normalized}?${raw}` : normalized;
}
