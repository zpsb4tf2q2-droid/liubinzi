import { describe, expect, it, vi } from "vitest";

describe("environment validation", () => {
  it("parses server environment variables", async () => {
    vi.resetModules();
    const mod = await import("@/src/env/server");
    expect(mod.serverEnv.BACKEND_API_URL).toBe("http://localhost:3333");
    expect(mod.env.NEXT_PUBLIC_APP_NAME).toBe("Test App");
  });

  it("throws when critical variables are missing", async () => {
    vi.resetModules();
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    process.env.NEXTAUTH_SECRET = "";

    await expect(import("@/src/env/server")).rejects.toThrowError();

    process.env.NEXTAUTH_SECRET = nextAuthSecret;
  });
});
