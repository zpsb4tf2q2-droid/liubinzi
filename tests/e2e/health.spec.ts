import { expect, test } from '@playwright/test';

const HEALTH_ENDPOINT = '/health';

test.describe('health check', () => {
  test('responds with ok status', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });
});
