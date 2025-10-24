import { HealthService } from '../src/health/health.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('HealthService', () => {
  it('returns an ok status when the database responds', async () => {
    const queryMock = jest.fn().mockResolvedValue([{ ok: 1 }]);
    const prisma = { $queryRaw: queryMock } as unknown as PrismaService;
    const service = new HealthService(prisma);

    const result = await service.check();

    expect(result).toEqual({ status: 'ok', database: 'up', timestamp: expect.any(String) });
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from the database layer', async () => {
    const queryMock = jest.fn().mockRejectedValue(new Error('Database unreachable'));
    const prisma = { $queryRaw: queryMock } as unknown as PrismaService;
    const service = new HealthService(prisma);

    await expect(service.check()).rejects.toThrow('Database unreachable');
  });
});
