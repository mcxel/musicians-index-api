import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Inventory Catalog' };

const CATALOG = [
  { sku: 'KIOSK-CABLE-001', name: 'Kiosk Cable Pack', stock: 'In Stock' },
  { sku: 'SIGN-MOUNT-004', name: 'Signage Mount Kit', stock: 'Low Stock' },
  { sku: 'SCREEN-GUARD-008', name: 'Outdoor Screen Guard', stock: 'In Stock' },
  { sku: 'CHARGE-LOCK-011', name: 'Charge Locker Core', stock: 'Backorder' },
];

export default function InventoryPage() {
  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '2rem 1.25rem' }}>
      <h1 style={{ marginTop: 0 }}>Inventory Catalog</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #232338', padding: '0.5rem' }}>SKU</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #232338', padding: '0.5rem' }}>Item</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #232338', padding: '0.5rem' }}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {CATALOG.map((row) => (
            <tr key={row.sku}>
              <td style={{ borderBottom: '1px solid #1a1b2c', padding: '0.5rem' }}>{row.sku}</td>
              <td style={{ borderBottom: '1px solid #1a1b2c', padding: '0.5rem' }}>{row.name}</td>
              <td style={{ borderBottom: '1px solid #1a1b2c', padding: '0.5rem' }}>{row.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
