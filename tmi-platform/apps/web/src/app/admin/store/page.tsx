import Link from 'next/link';

const ITEMS = [
  { id: '1', name: 'Julius Gold Skin', category: 'AVATAR', price: '$4.99', currency: 'USD', stock: 999, sold: 342, status: 'ACTIVE', rarity: 'EPIC' },
  { id: '2', name: 'Confetti Burst Effect', category: 'EFFECT', price: '$1.99', currency: 'USD', stock: 999, sold: 1204, status: 'ACTIVE', rarity: 'COMMON' },
  { id: '3', name: 'VIP Lobby Pass', category: 'PASS', price: '$9.99', currency: 'USD', stock: 500, sold: 87, status: 'ACTIVE', rarity: 'RARE' },
  { id: '4', name: 'Spotlight Filter', category: 'EFFECT', price: '$2.49', currency: 'USD', stock: 999, sold: 456, status: 'ACTIVE', rarity: 'COMMON' },
  { id: '5', name: 'Arena Season Pass', category: 'PASS', price: '$19.99', currency: 'USD', stock: 200, sold: 34, status: 'DRAFT', rarity: 'LEGENDARY' },
  { id: '6', name: 'Julius Shoulder Pet', category: 'AVATAR', price: '$3.99', currency: 'USD', stock: 999, sold: 678, status: 'ACTIVE', rarity: 'RARE' },
];

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'text-gray-400',
  RARE: 'text-blue-400',
  EPIC: 'text-purple-400',
  LEGENDARY: 'text-yellow-400',
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  DRAFT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ARCHIVED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function AdminStorePage() {
  const totalRevenue = '$12,847';
  const activeItems = ITEMS.filter((i) => i.status === 'ACTIVE').length;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard/admin" className="text-gray-400 hover:text-white text-sm transition-colors">← Admin</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-gray-300">Store</span>
      </div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#ff6b35]">Store Management</h1>
          <p className="text-gray-400 mt-1">Manage all store items, passes, effects, and avatar items.</p>
        </div>
        <button className="px-4 py-2 bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white text-sm font-semibold rounded-xl transition-colors">
          + Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Items', value: ITEMS.length, color: 'text-white' },
          { label: 'Active', value: activeItems, color: 'text-green-400' },
          { label: 'Total Sold', value: ITEMS.reduce((s, i) => s + i.sold, 0).toLocaleString(), color: 'text-[#ff6b35]' },
          { label: 'Revenue', value: totalRevenue, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'AVATAR', 'EFFECT', 'PASS'].map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              cat === 'ALL'
                ? 'bg-[#ff6b35] border-[#ff6b35] text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ITEMS.map((item) => (
          <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-white">{item.name}</h3>
                <p className="text-xs text-gray-400">{item.category}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[item.status]}`}>
                {item.status}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-[#ff6b35]">{item.price}</span>
              <span className={`text-xs font-semibold ${RARITY_COLORS[item.rarity]}`}>{item.rarity}</span>
            </div>
            <div className="text-xs text-gray-500 mb-3">{item.sold} sold · {item.stock} stock</div>
            <div className="flex gap-2">
              <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 rounded-lg transition-colors">Edit</button>
              <button className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs text-red-400 rounded-lg transition-colors">Archive</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
