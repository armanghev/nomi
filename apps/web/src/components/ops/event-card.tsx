import { StatusPill } from "@/components/ops/status-pill";
import type { DomainEvent } from "@/features/mock-domain/types";
import { cn } from "@/lib/utils";

type EventCardProps = {
  event: DomainEvent;
  selected?: boolean;
  onClick?: () => void;
  linkSlot?: React.ReactNode;
};

function toneFromSeverity(severity: DomainEvent["severity"]) {
  if (severity === "critical") {
    return "critical" as const;
  }

  if (severity === "warning") {
    return "warning" as const;
  }

  return "muted" as const;
}

export function EventCard({ event, selected = false, onClick, linkSlot }: EventCardProps) {
  const Comp = onClick ? "button" : "article";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border border-border/75 bg-background/80 px-4 py-3 text-left transition-colors",
        selected ? "border-primary/60 bg-primary/10" : onClick ? "hover:bg-muted/40" : undefined
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{event.message}</p>
        <div className="flex items-center gap-2">
          <StatusPill tone={toneFromSeverity(event.severity)} label={event.severity} />
          <StatusPill label={event.status} />
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{event.type}</p>
      {linkSlot ? <div className="mt-2 text-xs text-muted-foreground">{linkSlot}</div> : null}
    </Comp>
  );
}
