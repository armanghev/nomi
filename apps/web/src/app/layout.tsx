import type { Metadata } from "next";
import { Oi } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const oi = Oi({
  variable: "--font-oi",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nomi",
  description: "Nomi workspace scaffold",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${oi.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
