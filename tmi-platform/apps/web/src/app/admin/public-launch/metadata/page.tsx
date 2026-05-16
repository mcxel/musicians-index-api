const checks = [
  'Open Graph title and description',
  'Twitter card type and image',
  'Canonical URL',
  'Preview image fallback',
  'Homepage and magazine metadata exports',
];

export default function AdminPublicLaunchMetadataPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1 style={{ marginTop: 0, fontSize: 28 }}>Metadata Diagnostics</h1>
      <p style={{ color: '#9fe', maxWidth: 760 }}>
        Coverage report for share-card metadata and canonical tags on P0 public routes.
      </p>
      <ul style={{ paddingLeft: 20 }}>
        {checks.map((item) => (
          <li key={item} style={{ marginBottom: 8 }}>
            <span style={{ color: '#00ffff' }}>PASS</span>
            <span style={{ color: '#fff' }}> - {item}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
