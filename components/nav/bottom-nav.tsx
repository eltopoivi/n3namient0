"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Apple, Home, Salad, User } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/entrenamientos", label: "Entrenos", icon: Activity },
  { href: "/salud", label: "Salud", icon: Apple },
  { href: "/dieta", label: "Dieta", icon: Salad },
  { href: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-md px-2 py-1 text-[11px]",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
