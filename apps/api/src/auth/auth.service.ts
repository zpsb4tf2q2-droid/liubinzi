import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { IncomingHttpHeaders } from 'http';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppConfig } from '../config/config.schema';
import { AuthenticatedUser } from './authenticated-user.interface';

const AUTHENTICATED_USER_SELECT = {
  id: true,
  email: true,
  displayName: true
} satisfies Prisma.UserSelect;

@Injectable()
export class AuthService {
  private readonly sessionHeaderName: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>
  ) {
    this.sessionHeaderName = configService.get('SESSION_HEADER_NAME', { infer: true });
  }

  async authenticate(headers: IncomingHttpHeaders): Promise<AuthenticatedUser> {
    const sessionUser = await this.resolveBySessionToken(headers);
    if (sessionUser) {
      return sessionUser;
    }

    const bearerUser = await this.resolveByBearer(headers);
    if (bearerUser) {
      return bearerUser;
    }

    throw new UnauthorizedException('Missing authentication credentials');
  }

  private async resolveBySessionToken(headers: IncomingHttpHeaders): Promise<AuthenticatedUser | null> {
    const tokenValue = this.getHeaderValue(headers, this.sessionHeaderName);
    if (!tokenValue) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { sessionToken: tokenValue },
      select: AUTHENTICATED_USER_SELECT
    });

    if (!user) {
      throw new UnauthorizedException('Invalid session token provided');
    }

    return user;
  }

  private async resolveByBearer(headers: IncomingHttpHeaders): Promise<AuthenticatedUser | null> {
    const authorization = this.getHeaderValue(headers, 'authorization');
    if (!authorization) {
      return null;
    }

    if (!authorization.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Unsupported authorization header format');
    }

    const token = authorization.substring(7).trim();
    if (!token) {
      throw new UnauthorizedException('Bearer token cannot be empty');
    }

    let payload: Record<string, unknown>;
    try {
      payload = await this.jwtService.verifyAsync<Record<string, unknown>>(token);
    } catch (error) {
      throw new UnauthorizedException('Bearer token verification failed');
    }

    const subject = this.extractSubject(payload);
    if (!subject) {
      throw new UnauthorizedException('Bearer token payload missing subject');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: subject },
      select: AUTHENTICATED_USER_SELECT
    });

    if (!user) {
      throw new UnauthorizedException('Authenticated user no longer exists');
    }

    return user;
  }

  private extractSubject(payload: Record<string, unknown>): string | null {
    const subjectCandidate = payload.sub ?? payload.userId ?? payload.id;
    return typeof subjectCandidate === 'string' ? subjectCandidate : null;
  }

  private getHeaderValue(headers: IncomingHttpHeaders, rawHeaderName: string): string | null {
    const headerName = rawHeaderName.toLowerCase();
    const value = headers[headerName];
    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    if (typeof value === 'string') {
      return value;
    }

    return null;
  }
}
