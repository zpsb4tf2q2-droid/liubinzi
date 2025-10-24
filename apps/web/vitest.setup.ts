import "@testing-library/jest-dom/vitest";

process.env.NEXT_PUBLIC_APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Test App";
process.env.NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";
process.env.BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:3333";
process.env.EMAIL_FROM = process.env.EMAIL_FROM ?? "test@example.com";
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "test-secret";
