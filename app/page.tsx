import Image from "next/image";

const resources = [
  {
    href: "https://nextjs.org/docs/app",
    label: "Documentation",
  },
  {
    href: "https://nextjs.org/learn",
    label: "Learn Next.js",
  },
  {
    href: "https://vercel.com/templates?framework=next.js",
    label: "Starter Templates",
  },
];

export default function Home() {
  return (
    <main>
      <div className="home">
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={120}
          height={24}
          priority
        />
        <h1>Welcome to liubinzi</h1>
        <p>
          Get started by editing <code>app/page.tsx</code> and saving this file.
        </p>
        <nav>
          {resources.map(({ href, label }) => (
            <a key={href} href={href} target="_blank" rel="noreferrer noopener">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </main>
  );
}
