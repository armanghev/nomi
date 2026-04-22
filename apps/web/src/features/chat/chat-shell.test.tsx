import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  const clipboardWriteTextMock = vi.fn();

  beforeEach(() => {
    pushMock.mockReset();
    clipboardWriteTextMock.mockReset();
    Object.defineProperty(globalThis.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: clipboardWriteTextMock,
      },
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it("renders inline tool rows while running and resolves with final assistant output", () => {
    const seeded = createSeededMockDomainState(2);
    const activeConversationId = seeded.conversations[0].id;
    getMockDomainStore().reset(seeded);

    render(<ChatWorkspacePageRoot conversationId={activeConversationId} />);

    fireEvent.change(screen.getByPlaceholderText("Ask anything"), {
      target: { value: "Use GitHub to inspect my pull request." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    act(() => {
      vi.advanceTimersByTime(220);
    });

    const conversation = getMockDomainStore()
      .getState()
      .conversations.find((item) => item.id === activeConversationId);
    const prefaceMessage = conversation?.messages.at(-1);
    expect(prefaceMessage?.role).toBe("assistant");
    expect((prefaceMessage?.content ?? "").length).toBeGreaterThan(0);
    expect(document.querySelector('[data-slot="tool-call-row"]')).toBeFalsy();

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(document.querySelector('[data-slot="tool-call-row"][data-status="running"]')).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Expand tool call details" }));
    expect(screen.getByText("Account:", { exact: false })).toBeVisible();
    expect(screen.getByText("Duration:", { exact: false })).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(2_800);
    });

    expect(document.querySelector('[data-slot="tool-call-row"][data-status="failed"]')).toBeTruthy();
    expect(screen.getByText("Tool execution finished", { exact: false })).toBeVisible();
    expect(screen.getByText("expired OAuth token", { exact: false })).toBeVisible();
  });

  it("adds copy and edit controls to user messages and rewinds history after edit", () => {
    const seeded = createSeededMockDomainState(29);
    const activeConversationId = seeded.conversations[0].id;
    const initialUserContent =
      seeded.conversations[0].messages.find((message) => message.role === "user")
        ?.content ?? "";
    getMockDomainStore().reset(seeded);

    render(<ChatWorkspacePageRoot conversationId={activeConversationId} />);

    const copyButton = screen.getByRole("button", { name: "Copy message" });
    expect(copyButton.querySelector(".lucide-copy")).toBeTruthy();

    fireEvent.click(copyButton);
    expect(clipboardWriteTextMock).toHaveBeenCalledWith(initialUserContent);
    expect(copyButton.querySelector(".lucide-copy-check")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(screen.getByRole("button", { name: "Copy message" }).querySelector(".lucide-copy")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Edit message" }));

    const editInput = screen.getByLabelText("Edit user message");
    fireEvent.change(editInput, {
      target: { value: "Share token status and next steps." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save edit" }));

    let conversation = getMockDomainStore()
      .getState()
      .conversations.find((item) => item.id === activeConversationId);
    expect(conversation?.messages).toHaveLength(1);
    expect(conversation?.messages[0]?.content).toBe("Share token status and next steps.");

    act(() => {
      vi.advanceTimersByTime(2_500);
    });

    conversation = getMockDomainStore()
      .getState()
      .conversations.find((item) => item.id === activeConversationId);
    expect(conversation?.messages.at(-1)?.role).toBe("assistant");
    expect((conversation?.messages.at(-1)?.content ?? "").length).toBeGreaterThan(0);
  });
});
