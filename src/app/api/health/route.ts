import { NextResponse } from 'next/server';

type HealthResponse = {
  status: 'ok';
  timestamp: string;
};

export function GET(): NextResponse<HealthResponse> {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
