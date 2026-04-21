"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconArrowUp } from "@tabler/icons-react";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useRef } from "react";

type Ai04ComposerProps = {
  disabled?: boolean;
  onSubmit: () => void;
  onValueChange: (value: string) => void;
  value: string;
};

export default function Ai04Composer({
  disabled = false,
  onSubmit,
  onValueChange,
  value,
}: Ai04ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSubmit = value.trim().length > 0 && !disabled;

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "0px";
    const nextHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 56), 220);
    textareaRef.current.style.height = `${nextHeight}px`;
  }, [value]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && canSubmit) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <form
      className="rounded-2xl border border-border/75 bg-background/86 p-2 shadow-sm transition-colors focus-within:border-ring/45 sm:p-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) {
          onSubmit();
        }
      }}
    >
      <Textarea
        ref={textareaRef}
        aria-label="Message Nomi"
        className="min-h-14 resize-none border-none bg-transparent p-2 text-sm leading-6 shadow-none focus-visible:ring-0"
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Nomi anything"
        value={value}
      />

      <div className="flex items-center justify-between border-t border-border/70 px-2 pt-2">
        <p className="text-xs text-muted-foreground">Enter to send, Shift+Enter for newline.</p>
        <Button
          type="submit"
          variant="default"
          size="icon-sm"
          className="rounded-lg"
          disabled={!canSubmit}
          aria-label="Send message"
        >
          {disabled ? (
            <LoaderCircleIcon className="size-4 animate-spin" />
          ) : (
            <IconArrowUp size={16} />
          )}
        </Button>
      </div>
    </form>
  );
}
