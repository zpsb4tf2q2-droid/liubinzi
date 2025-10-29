import { Button, Input } from '@/components/ui';

const highlights = [
  {
    title: 'Composable Primitives',
    description:
      'Mix and match shadcn/ui components with Tailwind utilities to build responsive interfaces fast.'
  },
  {
    title: 'Themeable by Design',
    description:
      'Customize design tokens in a single place and reflect updates instantly across the entire app.'
  },
  {
    title: 'Ready for Production',
    description:
      'Accessible, keyboard-friendly components with zero-runtime styling powered by Tailwind CSS.'
  }
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted">
      <div className="container flex max-w-5xl flex-col items-center gap-12 py-16">
        <section className="flex w-full flex-col items-center text-center">
          <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Design system starter
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Tailwind CSS meets shadcn/ui
          </h1>
          <p className="mt-4 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            Explore how utility-first styling pairs with a headless component library to create a cohesive,
            themeable design system. Edit this page and see changes instantly with hot reloading.
          </p>
          <form className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row" action="#" method="post">
            <Input className="shadow-sm" placeholder="you@example.com" type="email" aria-label="Email" />
            <Button type="submit" className="whitespace-nowrap">
              Request Access
            </Button>
          </form>
        </section>

        <section className="grid w-full gap-4 sm:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border bg-card p-6 text-left shadow-sm transition hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-card-foreground">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
