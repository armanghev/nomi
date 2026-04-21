type InspectorDrawerProps = {
  title?: string;
  children?: React.ReactNode;
};

export function InspectorDrawer({
  title = "Inspector",
  children,
}: InspectorDrawerProps) {
  return (
    <aside className="hidden h-screen border-l border-border/70 bg-background/70 p-4 xl:block">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-3 space-y-3 text-sm">
        {children ?? (
          <p className="rounded-lg border border-dashed border-border/70 p-3 text-muted-foreground">
            Select an item to inspect actions and metadata.
          </p>
        )}
      </div>
    </aside>
  );
}
