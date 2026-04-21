import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatScreen } from "./chat-screen";

describe("ChatScreen", () => {
  it("submits a message from the composer", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);

    render(
      <ChatScreen
        messages={[]}
        conversations={[]}
        activeConversationId={null}
        activeConversationTitle={null}
        onSend={onSend}
        onSelectConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onStartNewConversation={vi.fn()}
        isSending={false}
        isLoadingConversation={false}
        isLoadingConversations={false}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Ask Nomi anything"), {
      target: { value: "Summarize my day" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => {
      expect(onSend).toHaveBeenCalledWith("Summarize my day");
    });
  });

  it("does not submit whitespace-only input", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);

    render(
      <ChatScreen
        messages={[]}
        conversations={[]}
        activeConversationId={null}
        activeConversationTitle={null}
        onSend={onSend}
        onSelectConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onStartNewConversation={vi.fn()}
        isSending={false}
        isLoadingConversation={false}
        isLoadingConversations={false}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Ask Nomi anything"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => {
      expect(onSend).not.toHaveBeenCalled();
    });
  });

  it("renders a compact header with the active chat name", () => {
    render(
      <ChatScreen
        messages={[]}
        conversations={[]}
        activeConversationId={"conversation-1"}
        activeConversationTitle={"Trip planning"}
        onSend={vi.fn()}
        onSelectConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onStartNewConversation={vi.fn()}
        isSending={false}
        isLoadingConversation={false}
        isLoadingConversations={false}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Trip planning" })
    ).toBeVisible();
  });

  it("shows chat bubbles with nomi on the left and the user on the right", () => {
    render(
      <ChatScreen
        messages={[
          { id: "assistant-1", role: "assistant", content: "Here is the plan." },
          { id: "user-1", role: "user", content: "Refine that for me." },
        ]}
        conversations={[]}
        activeConversationId={"conversation-1"}
        activeConversationTitle={"Trip planning"}
        onSend={vi.fn()}
        onSelectConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onStartNewConversation={vi.fn()}
        isSending={false}
        isLoadingConversation={false}
        isLoadingConversations={false}
      />
    );

    expect(screen.getByText("Here is the plan.")).toBeVisible();
    expect(screen.getByText("Refine that for me.")).toBeVisible();
    expect(screen.getByText("Nomi")).toBeVisible();
    expect(screen.getByText("You")).toBeVisible();
  });

  it("shows an assistant starter bubble when the thread is empty", () => {
    render(
      <ChatScreen
        messages={[]}
        conversations={[]}
        activeConversationId={null}
        activeConversationTitle={null}
        onSend={vi.fn()}
        onSelectConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onStartNewConversation={vi.fn()}
        isSending={false}
        isLoadingConversation={false}
        isLoadingConversations={false}
      />
    );

    expect(screen.getByText("What do you want to work on?")).toBeVisible();
  });
});
