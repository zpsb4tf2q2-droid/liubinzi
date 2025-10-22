import Link from 'next/link';

import FeatureCard from '@/components/ui/feature-card';

const features = [
  {
    title: 'First-class DX',
    description:
      'Start building immediately with a fully typed Next.js 14 stack, Tailwind CSS, ESLint, and Prettier ready to go.',
    icon: '⚡️',
  },
  {
    title: 'App Router ready',
    description:
      'Leverage the latest routing, data fetching, and streaming primitives with an App Router-first project structure.',
    icon: '🧭',
  },
  {
    title: 'API included',
    description: 'Ship production-ready health checks with a typed API route in minutes.',
    icon: '✅',
  },
] as const;

export default function HomePage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-12 px-6 py-24">
      <section className="flex flex-col gap-6 text-center">
        <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-sm font-medium text-primary">
          <span className="text-base" aria-hidden>
            🚀
          </span>
          Next.js 14 Starter Toolkit
        </span>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Build modern web experiences faster.
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-base text-slate-600 sm:text-lg">
          Opinionated defaults for teams who want to ship quickly without compromising on developer
          ergonomics. Tailwind CSS, strict TypeScript, linting, formatting, and health monitoring are
          all wired up.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={
              <span className="text-lg" aria-hidden>
                {feature.icon}
              </span>
            }
          />
        ))}
      </section>

      <section className="flex flex-col items-center gap-4 text-center">
        <code className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-slate-100">
          pnpm dev
        </code>
        <p className="text-sm text-slate-500">
          Run the development server and visit&nbsp;
          <a className="font-medium text-primary" href="http://localhost:3000" target="_blank" rel="noreferrer">
            localhost:3000
          </a>
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Sign in to your dashboard
        </Link>
      </section>
    </main>
  );
}
