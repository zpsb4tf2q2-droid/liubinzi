import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    const params = new URLSearchParams({ callbackUrl: "/dashboard" });
    redirect(`/login?${params.toString()}`);
  }

  const { user } = session;

  return (
    <main>
      <div className="dashboard">
        <h1>Dashboard</h1>
        <p>
          Signed in as <strong>{user.name ?? user.email}</strong>
        </p>
        <p>Your email address is {user.email ?? "not provided"}</p>
        <div className="auth-actions" style={{ marginTop: "1.5rem" }}>
          <SignOutButton />
        </div>
        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/">Return home</Link>
        </div>
      </div>
    </main>
  );
}
