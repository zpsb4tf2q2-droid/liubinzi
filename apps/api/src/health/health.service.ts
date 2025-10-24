import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthStatus {
  status: 'ok';
  database: 'up';
  timestamp: string;
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthStatus> {
    await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);

    return {
      status: 'ok',
      database: 'up',
      timestamp: new Date().toISOString()
    } as const;
  }
}
