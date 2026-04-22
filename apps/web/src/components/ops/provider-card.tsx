import { AppLogo } from "@/components/ops/app-logo";
import { StatusPill } from "@/components/ops/status-pill";
import type { Connection } from "@/features/mock-domain/types";
import { cn } from "@/lib/utils";

type ProviderCardProps = {
  connection: Connection;
  selected?: boolean;
  onClick?: () => void;
  actions?: React.ReactNode;
};

function statusTone(status: Connection["status"]) {
  if (status === "connected") {
    return "success" as const;
  }

  if (status === "degraded" || status === "failed") {
    return "warning" as const;
  }

  if (status === "disconnected") {
    return "critical" as const;
  }

  return "muted" as const;
}

export function ProviderCard({ connection, selected = false, onClick, actions }: ProviderCardProps) {
  const Comp = onClick ? "button" : "article";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border/75 bg-background/80 px-4 py-3 text-left transition-colors",
        selected ? "border-primary/60 bg-primary/10" : onClick ? "hover:bg-muted/40" : undefined
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <AppLogo provider={connection.provider} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{connection.appName}</p>
            <p className="truncate text-xs text-muted-foreground">{connection.accountEmail}</p>
          </div>
        </div>
        <StatusPill tone={statusTone(connection.status)} label={connection.status} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Scopes: {connection.scopes.join(", ")}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Tools: {connection.availableTools.join(", ")}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Health score: {connection.healthScore}%</p>
      {actions ? <div className="mt-3">{actions}</div> : null}
    </Comp>
  );
}
