import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome</h1>
          <p>Sign in or create an account to continue.</p>
        </div>
        <div className="auth-actions">
          <Link className="primary" href="/login">
            Sign in
          </Link>
          <Link className="secondary" href="/register">
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
