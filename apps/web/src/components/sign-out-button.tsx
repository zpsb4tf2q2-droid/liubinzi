"use client";

import { signOut } from "next-auth/react";
import { Button } from "@repo/ui";

export function SignOutButton() {
  return (
    <Button type="button" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </Button>
  );
}
