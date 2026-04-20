import { describe, expect, it, vi } from "vitest";
import { createChatService } from "./chat-service";

describe("createChatService", () => {
  it("persists the user message, assistant reply, and audit event", async () => {
    const saveMessage = vi.fn();
    const writeAudit = vi.fn();
    const loadActiveMemory = vi
      .fn()
      .mockResolvedValue([{ label: "Tone", value: "Be concise" }]);
    const generateReply = vi.fn().mockResolvedValue("Hello from Nomi");

    const service = createChatService({
      generateReply,
      createConversation: async () => ({ id: "conv_1", title: "First message" }),
      getConversation: vi.fn(),
      saveMessage,
      loadActiveMemory,
      writeAudit
    });

    const result = await service.sendMessage({
      ownerId: "owner_1",
      conversationId: null,
      content: "Help me refactor this function"
    });

    expect(result.conversationId).toBe("conv_1");
    expect(saveMessage).toHaveBeenCalledTimes(2);
    expect(loadActiveMemory).toHaveBeenCalledWith("owner_1");
    expect(generateReply).toHaveBeenCalledWith({
      prompt: "Help me refactor this function",
      memory: [{ label: "Tone", value: "Be concise" }]
    });
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "chat.message.created",
        authMethod: "session"
      })
    );
  });

  it("reuses an existing conversation only when it belongs to the owner", async () => {
    const createConversation = vi.fn();
    const getConversation = vi.fn().mockResolvedValue({ id: "conv_9" });
    const saveMessage = vi.fn();

    const service = createChatService({
      generateReply: async () => "Existing thread reply",
      createConversation,
      getConversation,
      saveMessage,
      loadActiveMemory: async () => [],
      writeAudit: vi.fn()
    });

    const result = await service.sendMessage({
      ownerId: "owner_1",
      conversationId: "conv_9",
      content: "Continue this thread",
      authMethod: "token"
    });

    expect(result.conversationId).toBe("conv_9");
    expect(getConversation).toHaveBeenCalledWith({
      ownerId: "owner_1",
      id: "conv_9"
    });
    expect(createConversation).not.toHaveBeenCalled();
    expect(saveMessage).toHaveBeenNthCalledWith(1, {
      conversationId: "conv_9",
      role: "user",
      content: "Continue this thread"
    });
  });

  it("rejects a supplied conversation id when the owner does not own it", async () => {
    const service = createChatService({
      generateReply: async () => "should not run",
      createConversation: vi.fn(),
      getConversation: vi.fn().mockResolvedValue(null),
      saveMessage: vi.fn(),
      loadActiveMemory: vi.fn(),
      writeAudit: vi.fn()
    });

    await expect(
      service.sendMessage({
        ownerId: "owner_1",
        conversationId: "conv_404",
        content: "Continue this thread"
      })
    ).rejects.toThrow("Conversation not found");
  });
});
