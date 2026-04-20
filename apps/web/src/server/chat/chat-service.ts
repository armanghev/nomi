type ChatInput = {
  ownerId: string;
  conversationId: string | null;
  content: string;
  authMethod?: "session" | "token";
};

type ChatDependencies = {
  generateReply: (args: {
    prompt: string;
    memory: Array<{ label: string; value: string }>;
  }) => Promise<string>;
  createConversation: (args: {
    ownerId: string;
    title: string;
  }) => Promise<{ id: string; title: string }>;
  saveMessage: (args: {
    conversationId: string;
    role: "user" | "assistant";
    content: string;
  }) => Promise<void>;
  loadActiveMemory: (
    ownerId: string
  ) => Promise<Array<{ label: string; value: string }>>;
  writeAudit: (entry: {
    ownerId: string;
    authMethod: "session" | "token";
    action: string;
    resourceType: string;
    resourceId: string;
  }) => Promise<void>;
};

export function createChatService(deps: ChatDependencies) {
  return {
    async sendMessage(input: ChatInput) {
      const conversation =
        input.conversationId !== null
          ? { id: input.conversationId, title: input.content.slice(0, 80) }
          : await deps.createConversation({
              ownerId: input.ownerId,
              title: input.content.slice(0, 80)
            });

      const memory = await deps.loadActiveMemory(input.ownerId);
      await deps.saveMessage({
        conversationId: conversation.id,
        role: "user",
        content: input.content
      });

      const reply = await deps.generateReply({ prompt: input.content, memory });

      await deps.saveMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: reply
      });
      await deps.writeAudit({
        ownerId: input.ownerId,
        authMethod: input.authMethod ?? "session",
        action: "chat.message.created",
        resourceType: "conversation",
        resourceId: conversation.id
      });

      return {
        conversationId: conversation.id,
        reply
      };
    }
  };
}
