import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../src/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('UsersService', () => {
  const userProfile = {
    id: 'user-1',
    email: 'test@example.com',
    displayName: 'Test User'
  };

  it('returns a profile when the user exists', async () => {
    const findUnique = jest.fn().mockResolvedValue(userProfile);
    const prisma = { user: { findUnique } } as unknown as PrismaService;
    const service = new UsersService(prisma);

    await expect(service.getProfile('user-1')).resolves.toEqual(userProfile);
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' }
      })
    );
  });

  it('throws when the user does not exist', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const prisma = { user: { findUnique } } as unknown as PrismaService;
    const service = new UsersService(prisma);

    await expect(service.getProfile('missing-user')).rejects.toBeInstanceOf(NotFoundException);
  });
});
