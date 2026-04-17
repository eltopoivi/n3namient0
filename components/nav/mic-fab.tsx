"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function MicFab() {
  const pathname = usePathname();
  if (pathname === "/voz" || pathname.startsWith("/voz/")) return null;

  return (
    <Link
      href="/voz"
      aria-label="Grabar audio"
      className={cn(
        "fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-foreground text-background shadow-lg transition-transform hover:scale-105",
        "bottom-[calc(env(safe-area-inset-bottom)+5rem)] md:bottom-6 md:right-6",
      )}
    >
      <Mic className="h-6 w-6" />
    </Link>
  );
}
