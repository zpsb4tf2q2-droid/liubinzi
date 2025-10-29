# liubinzi

A Next.js application starter configured with Tailwind CSS and shadcn/ui components.

## Getting Started

1. Install dependencies

```bash
pnpm install
```

2. Run the development server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the Tailwind + shadcn/ui showcase page. Edits to files inside the `app` directory will hot reload automatically.

## Scripts

- `pnpm dev` – start the Next.js development server
- `pnpm build` – create an optimized production build
- `pnpm start` – run the production server
- `pnpm lint` – lint the project with Next.js ESLint config
- `pnpm test` – execute Jest unit tests
- `pnpm shadcn` – open the shadcn/ui component generator CLI

## Project Structure Highlights

```
app/             # App Router pages, including Tailwind demonstration page
components/      # Reusable UI components (shadcn/ui)
lib/             # Shared utilities (e.g., Tailwind class merger)
src/             # Legacy utilities & example unit tests
```

## License

This project is licensed under the [MIT License](LICENSE).
