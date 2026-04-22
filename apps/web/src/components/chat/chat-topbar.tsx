"use client";

type ChatTopbarProps = {
  title: String;
}
export function ChatTopbar({ title }: ChatTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="flex items-center px-4 py-3 lg:px-6">
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
      </div>
    </header>
  );
}
