import { redirect } from 'next/navigation';
import { BOT_ACCOUNT_REGISTRY } from '@/lib/bots/BotAccountRegistry';

interface Props {
  params: { slug: string };
}

/**
 * /bots/[slug] — redirects to the bot roster admin page.
 * Bot profiles are managed in the admin console, not as public pages.
 * Rule 14: every link must resolve to a real destination.
 */
export default function BotProfileRedirectPage({ params }: Props) {
  const bot = BOT_ACCOUNT_REGISTRY.find((b) => b.slug === params.slug);
  if (!bot) redirect('/admin/bots/roster');
  redirect('/admin/bots/roster');
}
