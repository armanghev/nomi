import { Button } from "@/components/ui/button";

type ActionItem = {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive";
  disabled?: boolean;
};

type ActionRowProps = {
  items: ActionItem[];
};

export function ActionRow({ items }: ActionRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <Button
          key={item.label}
          type="button"
          size="sm"
          variant={item.variant ?? "outline"}
          onClick={item.onClick}
          disabled={item.disabled}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
