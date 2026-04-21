import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SignInScreen } from "./sign-in-screen";

describe("SignInScreen", () => {
  it("renders both magic-link and Google sign-in options when email auth is configured", () => {
    render(
      <SignInScreen
        isMagicLinkEnabled
        onEmailSignIn={vi.fn()}
        onGoogleSignIn={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Welcome to Nomi" })).toBeVisible();
    expect(screen.getByLabelText("Email")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Send magic link" })
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Continue with Google" })
    ).toBeVisible();
  });

  it("keeps the email field visible but disables magic-link submission when it is unavailable", () => {
    render(
      <SignInScreen
        isMagicLinkEnabled={false}
        onEmailSignIn={vi.fn()}
        onGoogleSignIn={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send magic link" })).toBeDisabled();
    expect(
      screen.getByText("Magic-link email is not configured for this environment yet.")
    ).toBeVisible();
  });
});
