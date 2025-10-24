import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserProfileDto } from './dto/user-profile.dto';

const USER_PROFILE_SELECT = {
  id: true,
  email: true,
  displayName: true
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_PROFILE_SELECT
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
