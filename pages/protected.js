export default function ProtectedPage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      <h1>Protected Content</h1>
      <p>You are logged in.</p>
      <a href="/api/logout">Logout</a>
    </main>
  );
}
