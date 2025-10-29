# liubinzi

_A placeholder description for the liubinzi project._

## Getting Started

1. Clone the repository.
2. Install the core dependencies for your environment.
3. Run the appropriate development or build commands for the stack.

## Project Structure

Project structure details will be added here as the implementation evolves.

## Contributing

Contributions are welcome! Please:

- Open issues using the [bug report](.github/ISSUE_TEMPLATE/bug_report.md) or [feature request](.github/ISSUE_TEMPLATE/feature_request.md) templates.
- Submit changes using the [pull request template](.github/PULL_REQUEST_TEMPLATE.md).
- Follow the coding standards and guidelines established in this repository.

## Database Setup

1. Copy `.env.example` to `.env` and update the `DATABASE_URL` value to point at your Postgres instance.
2. Start the database locally or run `docker compose up -d db` if using the provided Docker setup.
3. Run `pnpm prisma migrate dev` (or `pnpm prisma:migrate`) to apply the schema.
4. Seed demo data with `pnpm prisma db seed` (or `pnpm prisma:seed`).

## License

This project is licensed under the [MIT License](LICENSE).
