import { cn } from "@/lib/utils";

type StatusTone = "default" | "success" | "warning" | "critical" | "muted";

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
  className?: string;
};

const toneClass: Record<StatusTone, string> = {
  default: "border-border/70 bg-background text-foreground",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  critical: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  muted: "border-border/60 bg-muted/40 text-muted-foreground",
};

export function StatusPill({ label, tone = "default", className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em]",
        toneClass[tone],
        className
      )}
    >
      {label}
    </span>
  );
}
