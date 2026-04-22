import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatWorkspacePageRoot } from "@/features/chat/chat-workspace-page-root";
import { createSeededMockDomainState } from "@/features/mock-domain/seed";
import { getMockDomainStore } from "@/features/mock-domain/store";

describe("chat workspace page root", () => {
  it("renders chat-only workspace with composer", () => {
    const seeded = createSeededMockDomainState(2);
    getMockDomainStore().reset(seeded);

    render(<ChatWorkspacePageRoot />);

    expect(screen.queryByText("Conversation sources")).not.toBeInTheDocument();
    expect(screen.queryByText("Linked station events")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Send message")).toBeVisible();
    expect(screen.getByText("You")).toBeVisible();
    expect(screen.getByText("Nomi")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "New chat" }));
    expect(screen.getByText("Start a new conversation to begin chatting.")).toBeVisible();
  });
});
