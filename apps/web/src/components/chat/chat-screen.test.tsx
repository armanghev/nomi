import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatScreen } from "./chat-screen";

describe("ChatScreen", () => {
  const conversations = [
    { id: "conversation-1", title: "Trip planning" },
    { id: "conversation-2", title: "Weekly review" },
  ];

  it("submits a message from the composer", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);

    render(
      <ChatScreen
        messages={[]}
        conversations={[]}
        activeConversationId={null}
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
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

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
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(onSend).not.toHaveBeenCalled();
    });
  });

  it("lets the owner reopen a saved conversation", async () => {
    const onSelectConversation = vi.fn().mockResolvedValue(undefined);

    render(
      <ChatScreen
        messages={[]}
        conversations={conversations}
        activeConversationId={null}
        onSend={vi.fn()}
        onSelectConversation={onSelectConversation}
        onDeleteConversation={vi.fn()}
        onStartNewConversation={vi.fn()}
        isSending={false}
        isLoadingConversation={false}
        isLoadingConversations={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Trip planning" }));

    await waitFor(() => {
      expect(onSelectConversation).toHaveBeenCalledWith("conversation-1");
    });
  });

  it("confirms before deleting a saved conversation", async () => {
    const onDeleteConversation = vi.fn().mockResolvedValue(undefined);
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <ChatScreen
        messages={[]}
        conversations={conversations}
        activeConversationId={"conversation-1"}
        onSend={vi.fn()}
        onSelectConversation={vi.fn()}
        onDeleteConversation={onDeleteConversation}
        onStartNewConversation={vi.fn()}
        isSending={false}
        isLoadingConversation={false}
        isLoadingConversations={false}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Delete Trip planning" })
    );

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith(
        'Delete "Trip planning"? This cannot be undone.'
      );
      expect(onDeleteConversation).toHaveBeenCalledWith("conversation-1");
    });

    confirmSpy.mockRestore();
  });
});
