import Link from 'next/link';

const TRANSACTIONS = [
  { id: '1', user: 'DJ Kenzo', type: 'PURCHASE', item: 'Julius Gold Skin', amount: '+$4.99', currency: 'USD', time: '5 min ago' },
  { id: '2', user: 'Amara Osei', type: 'TIP', item: 'Tip to FatimaDiallo', amount: '+$2.00', currency: 'USD', time: '12 min ago' },
  { id: '3', user: 'Yusuf Bello', type: 'TICKET', item: 'Jakarta Hip-Hop Summit', amount: '+$30.00', currency: 'USD', time: '18 min ago' },
  { id: '4', user: 'Siti Rahma', type: 'PAYOUT', item: 'Artist Payout', amount: '-$120.00', currency: 'USD', time: '1 hr ago' },
  { id: '5', user: 'Kwame Asante', type: 'SUBSCRIPTION', item: 'Pro Plan Monthly', amount: '+$9.99', currency: 'USD', time: '2 hrs ago' },
];

const TYPE_COLORS: Record<string, string> = {
  PURCHASE: 'text-blue-400',
  TIP: 'text-pink-400',
  TICKET: 'text-purple-400',
  PAYOUT: 'text-red-400',
  SUBSCRIPTION: 'text-green-400',
  REFUND: 'text-yellow-400',
};

export default function AdminEconomyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard/admin" className="text-gray-400 hover:text-white text-sm transition-colors">← Admin</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-gray-300">Economy</span>
      </div>
      <h1 className="text-3xl font-bold text-[#ff6b35] mb-2">Economy Controls</h1>
      <p className="text-gray-400 mb-8">Monitor platform-wide wallet activity, payouts, tips, and revenue.</p>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Revenue', value: '$48,320', color: 'text-green-400', sub: 'All time' },
          { label: 'This Month', value: '$6,840', color: 'text-[#ff6b35]', sub: 'Jun 2025' },
          { label: 'Pending Payouts', value: '$2,140', color: 'text-yellow-400', sub: '12 artists' },
          { label: 'Active Wallets', value: '1,204', color: 'text-white', sub: 'Users' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Currency Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { currency: 'USD', flag: '🇺🇸', revenue: '$38,200', users: 820 },
          { currency: 'NGN', flag: '🇳🇬', revenue: '₦4,200,000', users: 280 },
          { currency: 'IDR', flag: '🇮🇩', revenue: 'Rp 15,400,000', users: 104 },
        ].map((c) => (
          <div key={c.currency} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <span className="text-3xl">{c.flag}</span>
            <div>
              <p className="font-bold text-white">{c.currency}</p>
              <p className="text-sm text-green-400 font-semibold">{c.revenue}</p>
              <p className="text-xs text-gray-400">{c.users} users</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Breakdown by Type */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {[
          { type: 'Store Sales', value: '$12,847', pct: 27 },
          { type: 'Ticket Sales', value: '$19,860', pct: 41 },
          { type: 'Subscriptions', value: '$8,400', pct: 17 },
          { type: 'Tips', value: '$3,200', pct: 7 },
          { type: 'Ads Revenue', value: '$2,800', pct: 6 },
          { type: 'Other', value: '$1,213', pct: 2 },
        ].map((r) => (
          <div key={r.type} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{r.type}</p>
            <p className="font-bold text-white">{r.value}</p>
            <div className="w-full h-1 bg-white/10 rounded-full mt-2">
              <div className="h-1 bg-[#ff6b35] rounded-full" style={{ width: `${r.pct}%` }} />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">{r.pct}% of total</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-gray-300">Recent Transactions</h2>
          <button className="text-xs text-[#ff6b35] hover:underline">View All</button>
        </div>
        <div className="divide-y divide-white/5">
          {TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-[#ff6b35]">
                  {tx.user.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{tx.user}</p>
                  <p className="text-xs text-gray-400">{tx.item}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold ${TYPE_COLORS[tx.type] ?? 'text-gray-400'}`}>{tx.type}</span>
                <span className={`text-sm font-bold ${tx.amount.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>{tx.amount}</span>
                <span className="text-xs text-gray-500 hidden sm:block">{tx.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Process Payouts', color: 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20' },
          { label: 'Issue Refund', color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20' },
          { label: 'Freeze Wallet', color: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' },
          { label: 'Export Report', color: 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' },
        ].map((a) => (
          <button key={a.label} className={`py-2.5 text-xs font-semibold rounded-xl border transition-colors ${a.color}`}>
            {a.label}
          </button>
        ))}
      </div>
    </main>
  );
}
