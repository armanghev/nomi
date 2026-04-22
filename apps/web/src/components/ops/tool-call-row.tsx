"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { AppLogo } from "@/components/ops/app-logo";
import type { ToolCall } from "@/features/mock-domain/types";
import { cn } from "@/lib/utils";

type ToolCallRowProps = {
  toolCall: ToolCall;
};

function formatDuration(durationMs: number | null) {
  if (durationMs === null) {
    return "Running";
  }

  return `${durationMs}ms`;
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleTimeString();
}

function statusDotClasses(status: ToolCall["status"]) {
  if (status === "success") {
    return "bg-green-600";
  }

  if (status === "failed") {
    return "bg-red-600";
  }

  return "bg-orange-500";
}

function StatusDot({ status }: { status: ToolCall["status"] }) {
  if (status === "running") {
    return (
      <span
        className="relative inline-flex size-2.5 shrink-0"
        data-slot="tool-call-status-dot"
        data-status={status}
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500" />
        <span className="relative inline-flex size-2.5 rounded-full border border-orange-300 bg-orange-500" />
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex size-2.5 shrink-0 rounded-full", statusDotClasses(status))}
      data-slot="tool-call-status-dot"
      data-status={status}
    />
  );
}

export function ToolCallRow({ toolCall }: ToolCallRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="inline-flex max-w-full flex-col py-2"
      data-slot="tool-call-row"
      data-status={toolCall.status}
    >
      <div className="inline-flex min-w-0 items-center gap-1">
        <AppLogo provider={toolCall.provider} className="size-5 rounded-sm p-0.5" />
        <p className="min-w-0 text-xs mr-1">
          <span className="font-medium">{toolCall.appName}</span>:{" "}
          <span className="font-mono">{toolCall.toolName}</span>
        </p>

        <StatusDot status={toolCall.status} />

        <button
          type="button"
          className="inline-flex size-5 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          aria-label={expanded ? "Collapse tool call details" : "Expand tool call details"}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          <ChevronDownIcon
            className={cn("size-3.5 transition-transform", expanded ? "rotate-180" : "rotate-0")}
          />
        </button>
      </div>

      {expanded ? (
        <div className="mt-2 w-0 min-w-full pl-7 text-[11px] text-muted-foreground">
          <p className="wrap-break-word">
            Account: <span className="break-all">{toolCall.accountEmail}</span>
          </p>
          <p className="wrap-break-word">Started: {formatTimestamp(toolCall.startedAt)}</p>
          <p className="wrap-break-word">Duration: {formatDuration(toolCall.durationMs)}</p>
          <p className="wrap-break-word capitalize">Status: {toolCall.status}</p>
        </div>
      ) : null}
    </div>
  );
}
