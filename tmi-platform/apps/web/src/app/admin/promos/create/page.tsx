// /admin/promos/create: Admin promo code creation page
'use client';

import { PromoAuditEngine } from '@/lib/promos/PromoAuditEngine';
import {
  PromoCodeEngine,
  PromoCodeType,
  PromoDuration,
  PromoRole,
  PromoTier,
} from '@/lib/promos/PromoCodeEngine';
import { useState } from 'react';

const codeTypes: PromoCodeType[] = [
  'free_trial',
  'discount',
  'temporary_membership',
  'lifetime_grant',
  'founder_grant',
  'artist_invite',
  'fan_invite',
  'performer_invite',
];
const tiers: PromoTier[] = ['free', 'pro', 'bronze', 'gold', 'platinum', 'diamond'];
const roles: PromoRole[] = [
  'fan',
  'artist',
  'performer',
  'producer',
  'venue',
  'sponsor',
  'advertiser',
];
const durations: PromoDuration[] = [7, 30, 60, 90, 'lifetime'];

export default function AdminPromoCreatePage() {
  const [form, setForm] = useState({
    code: '',
    type: 'free_trial' as PromoCodeType,
    tier: 'free' as PromoTier,
    role: 'fan' as PromoRole,
    duration: 7 as PromoDuration,
    emails: '',
    redemptionLimit: 1,
    expirationDate: '',
  });
  const [status, setStatus] = useState<string | null>(null);
  const handleCreate = () => {
    PromoCodeEngine.createCode({
      code: form.code,
      type: form.type,
      tier: form.tier,
      role: form.role,
      duration: form.duration,
      emails: form.emails
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean),
      redemptionLimit: Number(form.redemptionLimit),
      expirationDate: form.expirationDate ? new Date(form.expirationDate) : undefined,
      createdBy: 'admin',
    });
    PromoAuditEngine.log('created', form.code, 'admin', form);
    setStatus('Promo code created!');
  };
  return (
    <div className="max-w-lg mx-auto p-8 bg-black/90 rounded-xl mt-12 text-white">
      <h1 className="text-2xl font-bold mb-4">Create Promo Code</h1>
      <input
        className="w-full p-2 mb-2 rounded bg-gray-900 border border-cyan-400"
        placeholder="Code"
        value={form.code}
        onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
      />
      <select
        className="w-full p-2 mb-2 rounded bg-gray-900 border border-cyan-400"
        value={form.type}
        onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PromoCodeType }))}
      >
        {codeTypes.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <select
        className="w-full p-2 mb-2 rounded bg-gray-900 border border-cyan-400"
        value={form.tier}
        onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value as PromoTier }))}
      >
        {tiers.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <select
        className="w-full p-2 mb-2 rounded bg-gray-900 border border-cyan-400"
        value={form.role}
        onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as PromoRole }))}
      >
        {roles.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <select
        className="w-full p-2 mb-2 rounded bg-gray-900 border border-cyan-400"
        value={form.duration}
        onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value as PromoDuration }))}
      >
        {durations.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
      <input
        className="w-full p-2 mb-2 rounded bg-gray-900 border border-cyan-400"
        placeholder="Emails (comma separated)"
        value={form.emails}
        onChange={(e) => setForm((f) => ({ ...f, emails: e.target.value }))}
      />
      <input
        className="w-full p-2 mb-2 rounded bg-gray-900 border border-cyan-400"
        placeholder="Redemption Limit"
        type="number"
        value={form.redemptionLimit}
        onChange={(e) => setForm((f) => ({ ...f, redemptionLimit: Number(e.target.value) }))}
      />
      <input
        className="w-full p-2 mb-2 rounded bg-gray-900 border border-cyan-400"
        placeholder="Expiration Date (YYYY-MM-DD)"
        value={form.expirationDate}
        onChange={(e) => setForm((f) => ({ ...f, expirationDate: e.target.value }))}
      />
      <button
        className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 rounded font-bold"
        onClick={handleCreate}
      >
        Create
      </button>
      {status && <div className="mt-4 text-fuchsia-400">{status}</div>}
    </div>
  );
}
