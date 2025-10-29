# liubinzi

A lightweight Node.js HTTP service that exposes a `/health` endpoint. The service is designed to run locally with Node.js 20 and can be deployed as a serverless function on Vercel.

## Requirements

- Node.js 20.x (see [`.nvmrc`](.nvmrc))
- npm 10.x or later (bundled with Node.js 20)

## Local development

1. Copy the example environment file and provide values for the variables that apply to your deployment targets:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build and run the production bundle when you need to mimic the production build:
   ```bash
   npm run build
   npm start
   ```

## Environment variables

The application relies on the following environment variables. Populate them when running locally or in Vercel. See [`.env.example`](.env.example) for an annotated reference.

| Variable               | Description                                                                                   | Example Value                    |
| ---------------------- | --------------------------------------------------------------------------------------------- | -------------------------------- |
| `PORT`                 | Port used when running the HTTP server locally.                                               | `3000`                           |
| `NEXTAUTH_URL`         | Public URL used by NextAuth to craft callback URLs.                                           | `https://example.com`            |
| `NEXTAUTH_SECRET`      | Secret for encrypting NextAuth session tokens. Generate with `openssl rand -base64 32`.       | `super-secret-value`             |
| `GOOGLE_CLIENT_ID`     | OAuth client ID for Google sign-in.                                                           | `123.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret for Google sign-in.                                                       | `abc123`                         |
| `GITHUB_CLIENT_ID`     | OAuth client ID for GitHub sign-in.                                                           | `Iv1.23456789`                   |
| `GITHUB_CLIENT_SECRET` | OAuth client secret for GitHub sign-in.                                                       | `abcdef123456`                   |
| `DATABASE_URL`         | Primary database connection string (e.g., PostgreSQL).                                        | `postgres://...`                 |
| `DATABASE_DIRECT_URL`  | Elevated connection string used exclusively for migrations when required.                    | `postgres://...`                 |
| `SENTRY_DSN`           | Sentry DSN for error reporting.                                                               | `https://public@sentry.io/1`     |
| `SENTRY_ENVIRONMENT`   | Environment label forwarded to Sentry (e.g., `development`, `staging`, `production`).         | `production`                     |

> **Note:** Not every variable is consumed by the current implementation, but they are documented so future features (authentication, database access, monitoring) can be configured consistently across environments.

## Deployment (Vercel)

The repository includes a [`vercel.json`](vercel.json) file that captures the project configuration used by Vercel deployments:

- **Build command:** `npm run build && npm run migrate` compiles the TypeScript sources and executes the post-deployment migration script.
- **Install command:** `npm ci` installs dependencies exactly as locked in `package-lock.json`.
- **Dev command:** `npm run dev` mirrors the local development workflow when using `vercel dev`.
- **Runtime:** The serverless function at [`api/index.ts`](api/index.ts) is pinned to the `nodejs20.x` runtime with conservative memory (`1024 MB`) and execution duration limits.
- **Region:** Deployments target Vercel's `iad1` (US-East) region by default to reduce cold-start latency for most North American users.
- **Environment variables:** The configuration maps the required env vars to Vercel project secrets (`@variable_name`). Define these secrets in the Vercel dashboard or via the CLI before deploying.

### Step-by-step deployment checklist

1. Create or link a project in Vercel that points to this repository.
2. In **Project Settings → Environment Variables**, add the variables listed above. You can also run `vercel env add` for each secret to keep them synced with `vercel.json`.
3. Deploy using the Vercel dashboard or the CLI. When using the CLI:
   ```bash
   vercel --prod
   ```
   The configured build command will compile the project and invoke the migration script.
4. After the deployment completes, verify the health check:
   ```bash
   curl https://<your-project>.vercel.app/health
   ```
   You should receive `{"status":"ok"}`.
5. Keep your local environment in sync with production secrets when necessary:
   ```bash
   vercel env pull .env.local
   ```

### Post-deployment migrations

`npm run migrate` executes the compiled script at `dist/scripts/migrate.js`. The default implementation simply logs a message so Vercel's post-build command succeeds even before real migrations exist. Replace the contents of [`src/scripts/migrate.ts`](src/scripts/migrate.ts) with your database migration logic (for example, Prisma's `prisma migrate deploy`) when you introduce persistent storage.

### Docker-based deployments

This project is optimised for Vercel's serverless runtime via `api/index.ts`. If you need to deploy a containerised instance instead, create a Dockerfile that installs dependencies, runs `npm run build`, and launches the compiled server with `npm start`. No Dockerfile is committed by default to avoid conflicting with the Vercel serverless configuration.

## Contributing

Contributions are welcome! Please:

- Open issues using the [bug report](.github/ISSUE_TEMPLATE/bug_report.md) or [feature request](.github/ISSUE_TEMPLATE/feature_request.md) templates.
- Submit changes using the [pull request template](.github/PULL_REQUEST_TEMPLATE.md).
- Follow the coding standards and guidelines established in this repository.

## License

This project is licensed under the [MIT License](LICENSE).
