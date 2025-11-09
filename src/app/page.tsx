import { ExampleComponent } from '@/components/ExampleComponent'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Next.js 14!
        </h1>
        <p className="text-lg mb-8">
          Get started by editing <code className="font-mono font-bold">src/app/page.tsx</code>
        </p>
        <ExampleComponent />
      </div>
    </main>
  )
}
