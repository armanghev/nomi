"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeftIcon, CommandIcon, MessageSquareTextIcon, PinIcon, PlusIcon } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { Conversation, Source } from "@/features/mock-domain/types";
import { cn } from "@/lib/utils";

type HistorySection =
  | "Today"
  | "Yesterday"
  | "Last 7 Days"
  | "Last Month"
  | "All Time";

type ChatHistorySidebarProps = {
  conversations?: Conversation[];
  activeConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
  onStartNewConversation?: () => void;
  sources?: Source[];
  onToggleSourcePin?: (sourceId: string, pinned: boolean) => void;
};

const HISTORY_SECTIONS: readonly HistorySection[] = [
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last Month",
  "All Time",
];

type ChatHistoryItem = {
  id: string;
  title: string;
  updatedAt: string;
};

function buildMockHistory(referenceDate: Date): ChatHistoryItem[] {
  const base = referenceDate.getTime();

  return [
    {
      id: "chat-today-1",
      title: "Operator baseline",
      updatedAt: new Date(base - 35 * 60_000).toISOString(),
    },
    {
      id: "chat-yesterday-1",
      title: "Prompt tuning notes",
      updatedAt: new Date(base - 1 * 24 * 60 * 60_000 - 50 * 60_000).toISOString(),
    },
    {
      id: "chat-week-1",
      title: "Incident timeline recap",
      updatedAt: new Date(base - 3 * 24 * 60 * 60_000).toISOString(),
    },
  ];
}

function resolveHistorySection(itemDate: Date, referenceDate: Date): HistorySection {
  const startOfToday = new Date(referenceDate);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOfLast7Days = new Date(startOfToday);
  startOfLast7Days.setDate(startOfLast7Days.getDate() - 7);

  const startOfLastMonth = new Date(startOfToday);
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

  if (itemDate >= startOfToday) {
    return "Today";
  }

  if (itemDate >= startOfYesterday) {
    return "Yesterday";
  }

  if (itemDate >= startOfLast7Days) {
    return "Last 7 Days";
  }

  if (itemDate >= startOfLastMonth) {
    return "Last Month";
  }

  return "All Time";
}

function groupHistoryBySection(
  history: ChatHistoryItem[],
  referenceDate: Date
): Record<HistorySection, ChatHistoryItem[]> {
  const grouped = {
    Today: [],
    Yesterday: [],
    "Last 7 Days": [],
    "Last Month": [],
    "All Time": [],
  } as Record<HistorySection, ChatHistoryItem[]>;

  history.forEach((item) => {
    const section = resolveHistorySection(new Date(item.updatedAt), referenceDate);
    grouped[section].push(item);
  });

  return grouped;
}

function groupSources(sources: Source[]) {
  return sources.reduce<Record<Source["group"], Source[]>>(
    (acc, source) => {
      acc[source.group].push(source);
      return acc;
    },
    { memories: [], docs: [], telemetry: [] }
  );
}

export function ChatHistorySidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onStartNewConversation,
  sources,
  onToggleSourcePin,
}: ChatHistorySidebarProps) {
  const referenceDate = useMemo(() => new Date(), []);
  const staticHistory = useMemo(() => buildMockHistory(referenceDate), [referenceDate]);
  const dynamicHistory =
    conversations?.map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      updatedAt: conversation.updatedAt,
    })) ?? staticHistory;

  const groupedHistory = useMemo(
    () => groupHistoryBySection(dynamicHistory, referenceDate),
    [dynamicHistory, referenceDate]
  );

  const [fallbackActiveConversationId, setFallbackActiveConversationId] = useState<string | null>(
    dynamicHistory[0]?.id ?? null
  );
  const [commandOpen, setCommandOpen] = useState(false);

  const selectedConversationId = activeConversationId ?? fallbackActiveConversationId;
  const groupedSources = groupSources(sources ?? []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function navigateTo(path: string) {
    if (typeof window !== "undefined") {
      window.location.assign(path);
    }
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-screen border-r border-primary/25 bg-gradient-to-b from-primary/10 via-primary/5 to-sidebar/95 px-3 py-4 lg:flex lg:flex-col">
        <div className="mb-4 flex items-center gap-2">
          <Link
            href="/station/dashboard"
            className="inline-flex h-9 flex-1 items-center justify-start gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Back to Station"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back
          </Link>
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Open command menu"
          >
            <CommandIcon className="size-3.5" />
            Command
          </button>
        </div>

        <button
          type="button"
          onClick={onStartNewConversation}
          className="mb-4 flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <PlusIcon className="size-4" />
          New chat
        </button>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-2 pr-1">
          {HISTORY_SECTIONS.map((section) => (
            <section key={section}>
              <p className="mb-2 px-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {section}
              </p>
              <div className="space-y-1">
                {groupedHistory[section].length === 0 ? (
                  <p className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground/80">
                    No chats yet.
                  </p>
                ) : (
                  groupedHistory[section].map((item) => {
                    const isActive = item.id === selectedConversationId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (onSelectConversation) {
                            onSelectConversation(item.id);
                            return;
                          }

                          setFallbackActiveConversationId(item.id);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-primary/20 hover:text-primary"
                        )}
                      >
                        <MessageSquareTextIcon className="size-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </section>
          ))}

          {sources && sources.length > 0 ? (
            <section>
              <p className="mb-2 px-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Source groups
              </p>
              <div className="space-y-3 rounded-xl border border-border/70 bg-background/70 p-2">
                {(Object.keys(groupedSources) as Array<keyof typeof groupedSources>).map((group) => (
                  <div key={group} className="space-y-1">
                    <p className="px-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {group}
                    </p>
                    {groupedSources[group].map((source) => (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() => onToggleSourcePin?.(source.id, source.pinned)}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted/60"
                        aria-label={`${source.pinned ? "Unpin" : "Pin"} source ${source.label}`}
                      >
                        <span className="truncate">{source.label}</span>
                        <PinIcon
                          className={cn("size-3.5", source.pinned ? "text-primary" : "text-muted-foreground")}
                        />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </aside>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Run a command..." />
        <CommandList>
          <CommandEmpty>No matching commands.</CommandEmpty>
          <CommandGroup heading="Chat">
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                onStartNewConversation?.();
              }}
            >
              <PlusIcon className="size-4" />
              New chat
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                navigateTo("/station/dashboard");
              }}
            >
              Back to Station
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                navigateTo("/station/events");
              }}
            >
              Open events
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                navigateTo("/station/memories");
              }}
            >
              Open memories
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
