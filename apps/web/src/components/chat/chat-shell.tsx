import { ChatTopbar } from "@/components/chat/chat-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatHistorySidebar } from "./chat-history-sidebar";

type ChatShellProps = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  title: string;
};

export function ChatShell({ children, sidebar, title }: ChatShellProps) {
  return (
    <SidebarProvider>
      <div className="relative flex h-svh w-full overflow-hidden bg-background">
        {sidebar ?? <ChatHistorySidebar />}
        <SidebarInset className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <ChatTopbar title={title} />
            <main className="mx-auto flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden p-2">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
