import Link from "next/link";
import { ArrowLeftIcon, BookmarkIcon, MessagesSquareIcon } from "lucide-react";

type ChatShellProps = {
  children: React.ReactNode;
};

export function ChatShell({ children }: ChatShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,color-mix(in_oklab,var(--primary)_9%,transparent),transparent_45%),linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--background)_94%,black))]">
      <div className="grid min-h-screen lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="border-r border-border/70 bg-background/75 px-3 py-4">
          <div className="rounded-xl border border-border/75 bg-background px-3 py-3">
            <Link
              href="/station/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              aria-label="Back to Station"
            >
              <ArrowLeftIcon className="size-4" />
              Back to Station
            </Link>
            <h1 className="mt-2 text-lg font-semibold tracking-tight">Chat</h1>
          </div>

          <section className="mt-4 rounded-xl border border-border/75 bg-background/70 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <MessagesSquareIcon className="size-3.5" />
              Conversations
            </div>
            <p className="text-sm text-muted-foreground">
              Conversation list and source groups will be rendered here.
            </p>
          </section>

          <section className="mt-3 rounded-xl border border-border/75 bg-background/70 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <BookmarkIcon className="size-3.5" />
              Pinned Sources
            </div>
            <p className="text-sm text-muted-foreground">
              Source pins and quick context jump links will appear here.
            </p>
          </section>
        </aside>

        <main className="min-w-0 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
