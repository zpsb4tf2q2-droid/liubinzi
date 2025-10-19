export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      <h1>Next.js + Prisma + PostgreSQL</h1>
      <p>Starter environment for Auth.js-ready Prisma schema.</p>
      <ul>
        <li>Run `docker-compose up --build` to start app + Postgres</li>
        <li>Then run `pnpm prisma:migrate` and `pnpm prisma:seed`</li>
      </ul>
    </main>
  );
}
