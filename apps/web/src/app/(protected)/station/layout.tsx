import { StationShell } from "@/components/station/station-shell";

export default function StationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StationShell>{children}</StationShell>;
}
