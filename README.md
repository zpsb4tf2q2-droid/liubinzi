# liubinzi

A Next.js application showcasing email/password and optional Google OAuth flows backed by NextAuth and Prisma.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and fill in the values you need:

   ```bash
   cp .env.example .env
   ```

   The default configuration uses SQLite (`file:./dev.db`) for local development.

3. Generate the Prisma client and apply the schema:

   ```bash
   npx prisma db push
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to access the app.

## Authentication Flows

- **Email & Password** – Users can sign up on `/register`. Passwords are hashed with bcrypt before being stored. Duplicate email registrations are rejected.
- **Credentials Sign-in** – Users sign in at `/login`. Successful authentication redirects to the protected dashboard at `/dashboard`.
- **Optional Google OAuth** – Provide `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and set `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true` to surface the Google button and enable the provider.

Sessions are persisted using the Prisma adapter so you can view session records inside your database. The `/dashboard` route is protected both by middleware and server-side session checks.

## Scripts

- `npm run dev` – Start the Next.js development server.
- `npm run build` – Create a production build.
- `npm start` – Start the production server.
- `npm run lint` – Run ESLint.
- `npm test` – Execute Jest tests (placeholder configuration).
