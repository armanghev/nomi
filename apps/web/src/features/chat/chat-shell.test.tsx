import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatWorkspacePageRoot } from "@/features/chat/chat-workspace-page-root";
import { createSeededMockDomainState } from "@/features/mock-domain/seed";
import { getMockDomainStore } from "@/features/mock-domain/store";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("chat workspace page root", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it("shows a draft state at /chat and keeps sidebar items unselected", () => {
    const seeded = createSeededMockDomainState(2);
    getMockDomainStore().reset(seeded);

    render(<ChatWorkspacePageRoot conversationId={null} />);

    expect(screen.queryByText("Conversation sources")).not.toBeInTheDocument();
    expect(screen.queryByText("Linked station events")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start with Nomi" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Operator baseline" })).not.toHaveAttribute(
      "data-active"
    );

    fireEvent.click(screen.getByRole("button", { name: "New chat" }));
    expect(pushMock).toHaveBeenCalledWith("/chat");
  });

  it("renders a selected conversation from the URL and navigates when selecting another one", () => {
    const seeded = createSeededMockDomainState(2);
    getMockDomainStore().reset(seeded);

    render(<ChatWorkspacePageRoot conversationId={seeded.conversations[0].id} />);

    expect(screen.getByLabelText("Send message")).toBeVisible();
    expect(screen.getByRole("button", { name: "Operator baseline" })).toHaveAttribute(
      "data-active"
    );

    fireEvent.click(screen.getByRole("button", { name: "Deploy checklist" }));
    expect(pushMock).toHaveBeenCalledWith(
      `/chat/${seeded.conversations[1].id}`
    );
  });
});
