export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 py-24 text-slate-100">
      <section className="flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-100/20 bg-slate-100/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest">
          Next.js + Tailwind
        </span>
        <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
          Build modern web experiences faster.
        </h1>
        <p className="text-pretty text-base text-slate-300 sm:text-lg">
          This project comes with TypeScript, ESLint, Prettier, and Tailwind CSS preconfigured so you
          can focus on shipping features.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <a
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
            href="http://localhost:3000"
            rel="noreferrer"
          >
            View App
          </a>
          <code className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-200">
            npm run dev
          </code>
        </div>
      </section>
    </main>
  );
}
