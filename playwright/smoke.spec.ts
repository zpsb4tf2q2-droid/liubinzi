import { expect, test } from "@playwright/test";

import { GET } from "../app/api/healthz/route";

test.describe("healthz smoke", () => {
  test("responds with ok payload", async () => {
    const response = GET();

    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload).toEqual({ status: "ok" });
  });
});
