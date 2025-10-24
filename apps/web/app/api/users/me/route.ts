import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/src/env/server";

export async function GET(request: NextRequest) {
  const rawToken = await getToken({ req: request, raw: true, secret: serverEnv.NEXTAUTH_SECRET });

  if (!rawToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const upstreamUrl = new URL("/v1/users/me", serverEnv.BACKEND_API_URL);

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${rawToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: response.statusText }));
      return NextResponse.json(errorBody, { status: response.status });
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("[api/users/me] proxy error", error);
    return NextResponse.json(
      { error: "Failed to reach upstream service" },
      { status: 502 },
    );
  }
}
