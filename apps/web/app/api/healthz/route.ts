import { NextResponse } from "next/server";

import { createHealthPayload } from "@project/shared";

export function GET() {
  return NextResponse.json(createHealthPayload());
}
