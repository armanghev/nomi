import { ChatHistorySidebar } from "./chat-history-sidebar";

type ChatShellProps = {
  children: React.ReactNode;
};

export function ChatShell({ children }: ChatShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_45%),radial-gradient(circle_at_100%_0%,color-mix(in_oklab,var(--accent)_20%,transparent),transparent_30%),linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--background)_95%,black))]">
      <div className="grid min-h-screen lg:grid-cols-[17rem_minmax(0,1fr)]">
        <ChatHistorySidebar />

        <main className="min-w-0 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
