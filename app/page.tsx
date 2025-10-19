export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="container">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h1 className="bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
            Next.js 14 + Tailwind
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            You are up and running with Next.js App Router and Tailwind CSS.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/api/health"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:border-indigo-300 hover:shadow"
            >
              Check API health
            </a>
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
            >
              Next.js Docs
            </a>
            <a
              href="https://tailwindcss.com/docs"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              Tailwind Docs
            </a>
          </div>

          <div className="mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Tailwind Ready</h2>
              <p className="mt-2 text-sm text-slate-600">Utility classes are available out of the box.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Health Endpoint</h2>
              <p className="mt-2 text-sm text-slate-600">Visit <code className="font-mono">/api/health</code> for a simple JSON response.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
