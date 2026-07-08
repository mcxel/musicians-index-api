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

export function buildWhatsAppShare(target: ShareTarget): string {
  const url = buildShareUrl(target);
  const text = encodeURIComponent(`${target.text || target.title} ${url}`.trim());
  return `https://wa.me/?text=${text}`;
}

export function buildRedditShare(target: ShareTarget): string {
  const url = buildShareUrl(target);
  const title = encodeURIComponent(target.title);
  return `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${title}`;
}

export function buildThreadsShare(target: ShareTarget): string {
  const url = buildShareUrl(target);
  const text = encodeURIComponent(`${target.text || target.title} ${url}`.trim());
  return `https://www.threads.net/intent/post?text=${text}`;
}

export function buildMessengerShare(target: ShareTarget): string {
  const url = buildShareUrl(target);
  return `fb-messenger://share?link=${encodeURIComponent(url)}`;
}

export function buildInstagramCopyPrompt(target: ShareTarget): string {
  const url = buildShareUrl(target);
  return `${target.text || target.title}\n${url}`;
}

export function buildTikTokCopyPrompt(target: ShareTarget): string {
  const url = buildShareUrl(target);
  return `${target.text || target.title} 🎤 ${url}`;
}

export function buildDiscordCopyPrompt(target: ShareTarget): string {
  const url = buildShareUrl(target);
  return `${target.text || target.title}\n${url}\n\nJoin me on TMI.`;
}

export function buildSnapchatCopyPrompt(target: ShareTarget): string {
  const url = buildShareUrl(target);
  return `${target.text || target.title} 👻 ${url}`;
}

export function buildInviteFriendsPrompt(target: ShareTarget): string {
  const url = buildShareUrl({
    ...target,
    context: {
      ...(target.context ?? {}),
      source: 'invite_friends',
      medium: 'social',
      campaign: 'growth_loop',
    },
  });
  return `Join me on The Musician's Index. ${target.text || target.title}\n${url}`;
}
