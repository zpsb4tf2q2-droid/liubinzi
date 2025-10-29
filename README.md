# liubinzi

A lightweight TypeScript HTTP service used for experimentation and integration examples.

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or the Docker Engine with Docker Compose v2
- [pnpm](https://pnpm.io/) (only required if you prefer to run the project outside of Docker)

### Running the development stack with Docker Compose

1. Build and start the containers:

   ```bash
   docker compose up --build
   ```

   The application container installs dependencies with pnpm, builds the TypeScript sources, and starts the development server. Source files from the host machine are mounted into the container, so code changes trigger automatic reloads.

2. Once the stack is up, the HTTP service is available at [http://localhost:3000/health](http://localhost:3000/health).

   The application connects to the bundled PostgreSQL database by using the credentials defined in the `docker-compose.yml`. The database data is stored in a named Docker volume so that it persists across restarts.

### Stopping the stack

- Stop the containers while preserving the database volume:

  ```bash
  docker compose down
  ```

- Stop the containers and remove all named volumes (including the PostgreSQL data volume):

  ```bash
  docker compose down -v
  ```

### Services

| Service | Description | Host → Container Port |
| ------- | ----------- | --------------------- |
| `app`   | Node.js development server (pnpm dev) | `3000` → `3000` |
| `db`    | PostgreSQL 16 instance                 | `5432` → `5432` |

You can customise the exposed ports by setting the optional `APP_PORT` and `DB_PORT` environment variables before running `docker compose`.

### Environment variables

The application service consumes the following environment variables (default values are defined in the compose file):

- `PORT` – HTTP server port (defaults to `3000`).
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` – granular database connection settings.
- `DATABASE_URL` – connection string equivalent to the values above; useful for ORMs or client libraries that prefer a single URL.

## Project Structure

Project structure details will evolve alongside the implementation. The top-level layout currently includes:

- `src/index.ts` – HTTP server entry point.
- `src/lib/database.ts` – PostgreSQL connection utilities.
- `docker-compose.yml` and `Dockerfile` – local development and container build assets.

## Contributing

Contributions are welcome! Please:

- Open issues using the [bug report](.github/ISSUE_TEMPLATE/bug_report.md) or [feature request](.github/ISSUE_TEMPLATE/feature_request.md) templates.
- Submit changes using the [pull request template](.github/PULL_REQUEST_TEMPLATE.md).
- Follow the coding standards and guidelines established in this repository.

## License

This project is licensed under the [MIT License](LICENSE).
