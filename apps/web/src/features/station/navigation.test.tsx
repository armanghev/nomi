import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StationShell } from "@/components/station/station-shell";
import { ChatShell } from "@/components/chat/chat-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/station/dashboard",
}));

describe("station and chat shells", () => {
  it("renders station navigation items", () => {
    render(
      <StationShell>
        <div>dashboard body</div>
      </StationShell>
    );

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Agents" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Memories" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Connections" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Tokens" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Events" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Chat" })).toBeVisible();
  });

  it("renders chat shell with back navigation", () => {
    render(
      <ChatShell>
        <div>chat workspace</div>
      </ChatShell>
    );

    const backLink = screen.getByRole("link", {
      name: /back to station/i,
    });

    expect(backLink).toHaveAttribute("href", "/station/dashboard");
  });
});
