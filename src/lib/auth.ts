import { prisma } from "@/lib/prisma";

export type Session = {
  userId: string;
};

function sanitize(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function getSession(request: Request): Promise<Session | null> {
  const userIdHeader = sanitize(request.headers.get("x-user-id"));
  const userEmailHeader = sanitize(request.headers.get("x-user-email"));

  if (!userIdHeader && !userEmailHeader) {
    return null;
  }

  if (userIdHeader) {
    const userById = await prisma.user.findUnique({ where: { id: userIdHeader } });
    if (userById) {
      return { userId: userById.id };
    }
  }

  if (userEmailHeader) {
    const userByEmail = await prisma.user.findUnique({ where: { email: userEmailHeader } });
    if (userByEmail) {
      return { userId: userByEmail.id };
    }
  }

  return null;
}
