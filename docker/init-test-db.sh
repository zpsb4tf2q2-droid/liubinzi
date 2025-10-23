#!/bin/bash
set -euo pipefail

if [ -z "${POSTGRES_TEST_DB:-}" ]; then
  echo "POSTGRES_TEST_DB not set. Skipping test database initialization."
  exit 0
fi

echo "Resetting test database '${POSTGRES_TEST_DB}'..."

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" <<-EOSQL
  SELECT format('DROP DATABASE IF EXISTS %I;', '${POSTGRES_TEST_DB}')\gexec
  SELECT format('CREATE DATABASE %I WITH TEMPLATE = template0;', '${POSTGRES_TEST_DB}')\gexec
  SELECT format('GRANT ALL PRIVILEGES ON DATABASE %I TO %I;', '${POSTGRES_TEST_DB}', '${POSTGRES_USER}')\gexec
EOSQL

echo "Test database '${POSTGRES_TEST_DB}' is ready."
