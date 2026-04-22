import { ChatWorkspacePageRoot } from "@/features/chat/chat-workspace-page-root";

type ChatConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ChatConversationPage({
  params,
}: ChatConversationPageProps) {
  const { conversationId } = await params;

  return <ChatWorkspacePageRoot conversationId={conversationId} />;
}
