"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeftIcon, MessageSquareTextIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type HistorySection =
  | "Today"
  | "Yesterday"
  | "Last 7 Days"
  | "Last Month"
  | "All Time";

type ChatHistoryItem = {
  id: string;
  title: string;
  updatedAt: string;
};

const HISTORY_SECTIONS: readonly HistorySection[] = [
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last Month",
  "All Time",
];

function buildMockHistory(referenceDate: Date): ChatHistoryItem[] {
  const base = referenceDate.getTime();

  return [
    {
      id: "chat-today-1",
      title: "Operator baseline",
      updatedAt: new Date(base - 35 * 60_000).toISOString(),
    },
    {
      id: "chat-today-2",
      title: "Staging deploy checklist",
      updatedAt: new Date(base - 2 * 60 * 60_000).toISOString(),
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
    {
      id: "chat-week-2",
      title: "Memory schema draft",
      updatedAt: new Date(base - 6 * 24 * 60 * 60_000).toISOString(),
    },
    {
      id: "chat-month-1",
      title: "Agent routing experiment",
      updatedAt: new Date(base - 12 * 24 * 60 * 60_000).toISOString(),
    },
    {
      id: "chat-month-2",
      title: "Cost optimization pass",
      updatedAt: new Date(base - 27 * 24 * 60 * 60_000).toISOString(),
    },
    {
      id: "chat-all-time-1",
      title: "First prototype kickoff",
      updatedAt: new Date(base - 90 * 24 * 60 * 60_000).toISOString(),
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

export function ChatHistorySidebar() {
  const referenceDate = useMemo(() => new Date(), []);
  const history = useMemo(() => buildMockHistory(referenceDate), [referenceDate]);
  const groupedHistory = useMemo(
    () => groupHistoryBySection(history, referenceDate),
    [history, referenceDate]
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    history[0]?.id ?? null
  );

  return (
    <aside className="sticky top-0 hidden h-screen border-r border-border/70 bg-sidebar/90 px-3 py-4 lg:flex lg:flex-col">
      <div className="mb-4 rounded-xl border border-border/75 bg-background/70 px-3 py-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Nomi</p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">Chat</h1>
        <Link
          href="/station/dashboard"
          className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Back to Station"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to Station
        </Link>
      </div>

      <button
        type="button"
        className="mb-4 flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm text-background transition-opacity hover:opacity-90"
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
                  const isActive = item.id === activeConversationId;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveConversationId(item.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                        isActive
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
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
      </div>
    </aside>
  );
}
