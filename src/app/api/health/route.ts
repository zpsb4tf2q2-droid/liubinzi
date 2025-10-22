import { NextResponse } from 'next/server';
import { env } from '@/config/env';

type HealthResponse = {
  status: 'ok';
  timestamp: string;
  environment: typeof env.NODE_ENV;
};

export function GET(): NextResponse<HealthResponse> {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
}
