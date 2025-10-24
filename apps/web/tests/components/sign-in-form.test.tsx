import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import type { SignInResponse } from "next-auth/react";
import { SignInForm } from "@/src/components/sign-in-form";
import { publicEnv } from "@/src/env/public";
import { signIn } from "next-auth/react";

vi.mock("next-auth/react", async () => {
  const actual = await vi.importActual<typeof import("next-auth/react")>("next-auth/react");
  return {
    ...actual,
    signIn: vi.fn(),
  };
});

describe("SignInForm", () => {
  beforeEach(() => {
    vi.mocked(signIn).mockReset();
  });

  it("requires an email address", async () => {
    render(<SignInForm />);

    fireEvent.click(screen.getByRole("button", { name: /send magic link/i }));

    expect(await screen.findByText(/email address is required/i)).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("submits email sign-in and shows success message", async () => {
    vi.mocked(signIn).mockResolvedValue({ ok: true, status: 200 } as SignInResponse);

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: "user@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send magic link/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("email", {
        callbackUrl: "/dashboard",
        email: "user@example.com",
        redirect: false,
      });
    });

    expect(
      await screen.findByText(new RegExp(`We sent a magic link to user@example.com`, "i")),
    ).toHaveTextContent(publicEnv.NEXT_PUBLIC_APP_NAME);
  });
});
