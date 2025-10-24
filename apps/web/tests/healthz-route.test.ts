import { describe, expect, it } from "vitest";

import { GET } from "../app/api/healthz/route";

describe("GET /api/healthz", () => {
  it("returns an ok payload", async () => {
    const response = GET();

    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.status).toBe("ok");
    expect(typeof payload.timestamp).toBe("number");
  });
});
