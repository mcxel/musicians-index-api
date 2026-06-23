export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/email/test
 * Body: { to: string, type: string }
 *
 * Admin-only route that sends a real email of the specified type to any address.
 * Allows Marcel to verify email delivery and template rendering in production.
 * Supports all 20 EmailType values defined in TMIEmailSystem.ts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sendEmail, type EmailType } from '@/lib/email/TMIEmailSystem';

const ALLOWED_ADMIN_EMAILS = new Set(['berntmusic33@gmail.com']);

/** Safe demo payloads for every email type so each template renders fully. */
function demoDataFor(type: EmailType, to: string): Record<string, unknown> {
  const name = to.split('@')[0] ?? 'Test User';
  const now = new Date();
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const MAP: Record<EmailType, Record<string, unknown>> = {
    welcome_artist:   { name, slug: 'test-artist' },
    welcome_fan:      { name },
    welcome_venue:    { name, venueName: `${name} Venue`, venueSlug: 'test-venue' },
    welcome_diamond:  { name },
    welcome_admin:    { name },
    welcome_advertiser: { name },
    welcome_promoter: { name },
    sponsor_confirmation: {
      sponsorName: name, packageName: 'Gold Sponsor',
      monthlyBudget: '500', activeUntil: futureDate,
      repEmail: 'sponsors@themusiciansindex.com',
    },
    verify_email:     { token: 'test-token-abc123' },
    password_reset:   { token: 'reset-token-xyz789', link: 'https://themusiciansindex.com/auth/reset-password/test' },
    invite:           { inviterName: 'Marcel Dickens', inviteCode: 'TMI-TEST', inviteLink: 'https://themusiciansindex.com/signup?ref=test' },
    profile_reminder: { name, statXP: '4,200', statRank: 'Top 500' },
    battle_invite:    { challenger: 'Ray Journey', genre: 'Hip-Hop', format: 'Best-of-3', prize: 'Crown + 2,000 XP', inviteId: 'battle-test-001' },
    contest_win:      { name, placement: '1st Place', contestName: 'Monday Night Stage', prizeDescription: 'TMI Crown + $500 credit', contestId: 'contest-test-001' },
    contest_loss:     { name, contestName: 'Monday Night Stage' },
    ticket_confirmation: {
      eventName: 'Monday Night Stage — Live Finals',
      date: futureDate,
      venue: 'The Musician\'s Index Virtual Arena',
      seat: 'VIP-A12',
      confirmationCode: 'TKT-TEST01',
      ticketId: 'tk_test_session_001',
    },
    nft_receipt:      { tokenName: 'TMI Genesis #001', tokenId: 'NFT-001', creatorName: 'Ray Journey', edition: '1/1', priceUsd: '49.99', priceCredits: 4999 },
    beat_receipt:     { beatTitle: 'Midnight Cypher', producerName: 'DJ Marcel', bpm: '94', key: 'Am', license: 'Non-Exclusive', priceUsd: '29.99', beatId: 'beat-test-001' },
    tip_received:     { fanName: 'TestFan', amount: '25.00', roomName: 'Monday Night Stage', message: 'You killed it tonight!' },
    new_follower:     { followerName: 'TestFan', followerSlug: 'test-fan' },
    room_went_live:   { hostName: 'Ray Journey', roomName: 'Monday Night Cypher', viewerCount: 42, roomSlug: 'monday-night-cypher' },
    security_alert:   { location: 'New York, NY', time: now.toUTCString(), device: 'Chrome on Windows' },
    new_login:        { location: 'New York, NY', time: now.toUTCString(), device: 'Chrome on Windows' },
    subscription_start: { plan: 'GOLD', priceMonthly: '14.99', renewalDate: futureDate },
    subscription_renew: { plan: 'GOLD', nextRenewalDate: futureDate },
    subscription_cancel: { accessUntil: futureDate },
    subscription_upgrade: { oldPlan: 'PRO', newPlan: 'GOLD' },
    weekly_digest: {
      weekEnding: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      stats: [
        { label: 'XP Earned', value: '+1,250', color: '#00FFFF' },
        { label: 'Streams',   value: '847',    color: '#FF2DAA' },
        { label: 'Tips',      value: '$42',    color: '#22c55e' },
      ],
    },
    magazine_drop: { issueName: 'TMI Issue 1 — June 2026', teaser: 'The Crown changes hands. New voices rise.', articleCount: 8, featuredArtist: 'Ray Journey' },
    payout_queued:   { amount: '250.00', reason: 'Monthly Idol 1st Place Prize' },
    payout_approved: { amount: '250.00', method: 'Bank transfer', eta: '3–5 business days' },
    streak_warning:  { currentStreak: 12, multiplier: '1.5', longestStreak: 30 },
    payment_failed:  { plan: 'GOLD', updateUrl: 'https://themusiciansindex.com/settings/billing', failureReason: 'Card declined' },
    booking_request: {
      bookingId: 'BK-TEST001',
      venueName: 'The Musician\'s Index Virtual Stage',
      eventDate: futureDate,
      eventType: 'concert',
      estimatedTotal: 3500,
      contractId: 'ct_test_001',
    },
    booking_confirmed: {
      showTitle: 'Monday Night Live — Special Edition',
      venueName: 'The Musician\'s Index Virtual Stage',
      showDate: futureDate,
      showTime: '8:00 PM EST',
      artistName: name,
      fee: '1,500',
      ticketUrl: 'https://themusiciansindex.com/bookings',
    },
  };

  return MAP[type] ?? { name };
}

const VALID_TYPES = new Set<string>([
  'welcome_artist', 'welcome_fan', 'welcome_venue', 'welcome_diamond', 'welcome_admin',
  'welcome_advertiser', 'welcome_promoter',
  'verify_email', 'password_reset', 'invite', 'profile_reminder',
  'battle_invite', 'contest_win', 'contest_loss',
  'ticket_confirmation', 'nft_receipt', 'beat_receipt',
  'tip_received', 'new_follower', 'room_went_live',
  'security_alert', 'new_login',
  'subscription_start', 'subscription_renew', 'subscription_cancel', 'subscription_upgrade',
  'sponsor_confirmation', 'weekly_digest', 'magazine_drop',
  'payout_queued', 'payout_approved', 'streak_warning',
  'payment_failed', 'booking_request', 'booking_confirmed',
]);

export async function POST(req: NextRequest) {
  const jar = cookies();
  const sessionId = jar.get('tmi_session_id')?.value;
  const role      = jar.get('tmi_role')?.value;
  const userEmail = jar.get('tmi_user_email')?.value ?? '';

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }
  if (role !== 'ADMIN' && !ALLOWED_ADMIN_EMAILS.has(userEmail)) {
    return NextResponse.json({ ok: false, error: 'Admin only' }, { status: 403 });
  }

  let body: { to?: string; type?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const to   = body.to?.trim() ?? '';
  const type = body.type?.trim() ?? '';

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ ok: false, error: 'Valid `to` email required' }, { status: 400 });
  }

  if (!type || !VALID_TYPES.has(type)) {
    return NextResponse.json({
      ok: false,
      error: `Invalid email type. Valid types: ${[...VALID_TYPES].join(', ')}`,
    }, { status: 400 });
  }

  const emailType = type as EmailType;
  const data = demoDataFor(emailType, to);

  const result = await sendEmail({ to, type: emailType, data });

  if (!result.success) {
    return NextResponse.json({
      ok:    false,
      error: result.error ?? 'Send failed',
      type:  emailType,
    }, { status: 502 });
  }

  return NextResponse.json({
    ok:        true,
    messageId: result.messageId,
    type:      emailType,
    sentTo:    to,
    sentAt:    new Date().toISOString(),
  });
}
