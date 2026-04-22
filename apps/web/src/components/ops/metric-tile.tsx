import { cn } from "@/lib/utils";

type MetricTileProps = {
  label: string;
  value: string;
  caption?: string;
  emphasized?: boolean;
  onClick?: () => void;
};

export function MetricTile({
  label,
  value,
  caption,
  emphasized = false,
  onClick,
}: MetricTileProps) {
  const Comp = onClick ? "button" : "article";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border/75 bg-background/80 p-4 text-left transition-colors",
        emphasized
          ? "border-primary/60 bg-primary/10"
          : onClick
            ? "hover:bg-muted/40"
            : undefined
      )}
    >
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {caption ? <p className="mt-1 text-xs text-muted-foreground">{caption}</p> : null}
    </Comp>
  );
}
