import Image from "next/image";
import type { ConnectionProvider } from "@/features/mock-domain/types";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  provider: ConnectionProvider;
  className?: string;
};

type LogoConfig = {
  label: string;
  src: string;
  mark: string;
  surfaceClass: string;
};

const logoConfig: Record<ConnectionProvider, LogoConfig> = {
  github: {
    label: "GitHub",
    src: "/github.png",
    mark: "GH",
    surfaceClass: "bg-white",
  },
  vercel: {
    label: "Vercel",
    src: "/vercel.svg",
    mark: "VE",
    surfaceClass: "bg-black",
  },
  gmail: {
    label: "Gmail",
    src: "/gmail.png",
    mark: "GM",
    surfaceClass: "bg-white",
  },
  google_calendar: {
    label: "Google Calendar",
    src: "/google-calendar.png",
    mark: "GC",
    surfaceClass: "bg-white",
  },
  google_drive: {
    label: "Google Drive",
    src: "/google-drive.png",
    mark: "GD",
    surfaceClass: "bg-white",
  },
  notion: {
    label: "Notion",
    src: "/notion.png",
    mark: "NO",
    surfaceClass: "bg-white",
  },
  linear: {
    label: "Linear",
    src: "/linear.png",
    mark: "LI",
    surfaceClass: "bg-black",
  },
};

export function AppLogo({ provider, className }: AppLogoProps) {
  const config = logoConfig[provider];

  return (
    <span
      role="img"
      aria-label={config.label}
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 text-[10px] font-semibold tracking-[0.1em]",
        config.surfaceClass,
        className
      )}
    >
      <Image
        src={config.src}
        alt={config.label}
        fill
        sizes="32px"
        className="object-contain p-1"
      />
      <span className="sr-only">{config.mark}</span>
    </span>
  );
}
