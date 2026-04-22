import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatWorkspacePageRoot } from "@/features/chat/chat-workspace-page-root";
import { createSeededMockDomainState } from "@/features/mock-domain/seed";
import { getMockDomainStore } from "@/features/mock-domain/store";

describe("chat workspace page root", () => {
  it("renders grouped sources and can pin or unpin", () => {
    const seeded = createSeededMockDomainState(2);
    getMockDomainStore().reset(seeded);

    render(<ChatWorkspacePageRoot />);

    expect(screen.getByText("Conversation sources")).toBeVisible();
    expect(
      screen.getAllByRole("button", { name: /Pin source/i }).length
    ).toBeGreaterThan(0);

    const toggle = screen.getAllByRole("button", { name: /Unpin source|Pin source/i })[0];
    fireEvent.click(toggle);

    expect(screen.getByText("Linked station events")).toBeVisible();
  });
});
