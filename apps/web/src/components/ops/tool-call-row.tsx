import { AppLogo } from "@/components/ops/app-logo";
import { StatusPill } from "@/components/ops/status-pill";
import type { ToolCall } from "@/features/mock-domain/types";

type ToolCallRowProps = {
  toolCall: ToolCall;
};

function statusTone(status: ToolCall["status"]) {
  if (status === "success") {
    return "success" as const;
  }

  if (status === "failed") {
    return "critical" as const;
  }

  return "warning" as const;
}

function formatDuration(durationMs: number | null) {
  if (durationMs === null) {
    return "Running";
  }

  return `${durationMs}ms`;
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleTimeString();
}

export function ToolCallRow({ toolCall }: ToolCallRowProps) {
  return (
    <article className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-background/70 px-3 py-2">
      <div className="flex min-w-0 items-start gap-2">
        <AppLogo provider={toolCall.provider} className="size-7 text-[9px]" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{toolCall.appName}</p>
          <p className="truncate text-[11px] text-muted-foreground">{toolCall.accountEmail}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">Tool: {toolCall.toolName}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <StatusPill tone={statusTone(toolCall.status)} label={toolCall.status} />
        <p className="text-[11px] text-muted-foreground">{formatDuration(toolCall.durationMs)}</p>
        <p className="text-[11px] text-muted-foreground">{formatTimestamp(toolCall.startedAt)}</p>
      </div>
    </article>
  );
}
