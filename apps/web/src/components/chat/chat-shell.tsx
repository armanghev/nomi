import { ChatTopbar } from "@/components/chat/chat-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatHistorySidebar } from "./chat-history-sidebar";

type ChatShellProps = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
};

export function ChatShell({ children, sidebar }: ChatShellProps) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-background">
        {sidebar ?? <ChatHistorySidebar />}
        <SidebarInset className="flex min-w-0 flex-1 flex-col bg-background">
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <ChatTopbar />
            <main className="flex min-h-0 flex-1 p-4 lg:p-6">{children}</main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
