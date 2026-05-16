import { buildDeepLink, type DeepLinkContext } from './DeepLinkEngine';

const PROD_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://themusiciansindex.com';

export interface ShareTarget {
  title: string;
  text?: string;
  path: string;
  context?: DeepLinkContext;
}

export function buildShareUrl(target: ShareTarget): string {
  return buildDeepLink(PROD_URL, target.path, target.context);
}

export function buildSmsShare(target: ShareTarget): string {
  const url = buildShareUrl(target);
  const body = `${target.text || target.title} ${url}`.trim();
  return `sms:?&body=${encodeURIComponent(body)}`;
}

export function buildEmailShare(target: ShareTarget): string {
  const url = buildShareUrl(target);
  const subject = encodeURIComponent(target.title);
  const body = encodeURIComponent(`${target.text || target.title}\n\n${url}`);
  return `mailto:?subject=${subject}&body=${body}`;
}

export function buildTwitterShare(target: ShareTarget): string {
  const url = buildShareUrl(target);
  const text = encodeURIComponent(target.text || target.title);
  return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
}

export function buildFacebookShare(target: ShareTarget): string {
  const url = buildShareUrl(target);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function buildInstagramCopyPrompt(target: ShareTarget): string {
  const url = buildShareUrl(target);
  return `${target.text || target.title}\n${url}`;
}

export function buildTikTokCopyPrompt(target: ShareTarget): string {
  const url = buildShareUrl(target);
  return `${target.text || target.title} 🎤 ${url}`;
}
