"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainIcon, KeyRoundIcon, MessageSquareTextIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ProtectedShellProps = {
  children: React.ReactNode;
};

const navigationItems = [
  {
    href: "/chat",
    label: "Chat",
    description: "Persistent threads",
    icon: MessageSquareTextIcon,
  },
  {
    href: "/settings/memory",
    label: "Memory",
    description: "Pinned context",
    icon: BrainIcon,
  },
  {
    href: "/settings/tokens",
    label: "Tokens",
    description: "Managed access",
    icon: KeyRoundIcon,
  },
] as const;

function getSectionLabel(pathname: string) {
  return (
    navigationItems.find((item) => pathname.startsWith(item.href))?.label ??
    "Workspace"
  );
}

export function ProtectedShell({ children }: ProtectedShellProps) {
  const pathname = usePathname();
  const sectionLabel = getSectionLabel(pathname);
  const isChatPage = pathname.startsWith("/chat");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,color-mix(in_oklab,var(--primary)_7%,transparent),transparent_42%),radial-gradient(circle_at_100%_0%,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_34%),linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--background)_95%,white))]">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/82 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/chat"
            className="flex min-w-0 items-center gap-3 rounded-xl px-1 py-1 outline-none transition hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
              <SparklesIcon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">Nomi</p>
              <p className="truncate text-[11px] text-muted-foreground">
                Private workspace
              </p>
            </div>
          </Link>

          <nav className="ml-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-border/70 bg-background/78 p-1">
            {navigationItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full px-4 pb-8 pt-4 sm:px-6",
          isChatPage ? "max-w-7xl" : "max-w-5xl"
        )}
      >
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border/65 bg-background/72 px-3 py-2 text-xs text-muted-foreground">
          <span className="uppercase tracking-[0.18em]">Workspace</span>
          <span>{sectionLabel}</span>
        </div>
        {children}
      </main>
    </div>
  );
}
