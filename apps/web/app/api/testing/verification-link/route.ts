import { NextResponse, type NextRequest } from "next/server";
import { pickLatestMagicLink, clearMagicLinks } from "@/src/lib/magic-link-store";
import { serverEnv } from "@/src/env/server";

const NOT_FOUND = NextResponse.json({ error: "Not found" }, { status: 404 });

export async function GET(request: NextRequest) {
  if (serverEnv.NODE_ENV === "production") {
    return NOT_FOUND;
  }

  const identifier = request.nextUrl.searchParams.get("email") ?? undefined;
  const shouldConsume = request.nextUrl.searchParams.get("consume") === "true";

  const magicLink = pickLatestMagicLink(identifier);
  if (!magicLink) {
    return NOT_FOUND;
  }

  if (shouldConsume) {
    clearMagicLinks();
  }

  return NextResponse.json(magicLink);
}

export async function DELETE() {
  if (serverEnv.NODE_ENV === "production") {
    return NOT_FOUND;
  }

  clearMagicLinks();
  return NextResponse.json({ success: true });
}
