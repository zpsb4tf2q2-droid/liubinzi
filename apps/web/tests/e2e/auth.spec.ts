import { expect, test, type APIRequestContext } from "@playwright/test";

const TEST_EMAIL = "playwright-user@example.com";

async function pollMagicLink(request: APIRequestContext, email: string) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const response = await request.get(
      `/api/testing/verification-link?email=${encodeURIComponent(email)}&consume=true`,
    );

    if (response.status() === 200) {
      return (await response.json()) as { url: string };
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Magic link was not generated in time");
}

test("can request magic link and access protected dashboard", async ({ page, request }) => {
  await page.goto("/sign-in");

  await page.getByLabel("Work email").fill(TEST_EMAIL);
  await page.getByRole("button", { name: /send magic link/i }).click();

  await expect(page.getByText(/we sent a magic link/i)).toBeVisible();

  const { url } = await pollMagicLink(request, TEST_EMAIL);

  await page.goto(url);

  await page.waitForURL("**/dashboard", { timeout: 15_000 });

  await expect(page.getByRole("heading", { name: /session details/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /sign out/i })).toBeVisible();
});
