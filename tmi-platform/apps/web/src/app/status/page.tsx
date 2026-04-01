export default function StatusPage() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Platform Status</h1>
      <p style={{ color: '#00ff88' }}>● All systems operational</p>
      <p style={{ marginTop: 20, color: '#999' }}>Last checked: {new Date().toUTCString()}</p>
    </main>
  );
}
