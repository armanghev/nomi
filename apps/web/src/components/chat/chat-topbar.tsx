"use client";

type ChatTopbarProps = {
  title: string;
};

export function ChatTopbar({ title }: ChatTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex items-center px-4 py-2.5 lg:px-6">
        <h1 className="text-base leading-7 font-semibold tracking-tight">{title}</h1>
      </div>
    </header>
  );
}
