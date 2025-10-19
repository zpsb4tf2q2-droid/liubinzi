import handler from '../../pages/api/health';
import { describe, it, expect, vi } from 'vitest';

function createMockRes() {
  const res: any = {};
  res.status = vi.fn().mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn().mockImplementation((data: any) => {
    res.body = data;
    return res;
  });
  res.setHeader = vi.fn();
  res.writeHead = vi.fn().mockImplementation(() => res);
  res.end = vi.fn();
  return res;
}

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const req: any = { method: 'GET' };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
  });
});
