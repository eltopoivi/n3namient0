"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Apple, CalendarDays, Home, Salad, User } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/entrenamientos", label: "Entrenamientos", icon: Activity },
  { href: "/salud", label: "Salud", icon: Apple },
  { href: "/dieta", label: "Dieta", icon: Salad },
  { href: "/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/perfil", label: "Perfil", icon: User },
] as const;

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav className="flex h-full flex-col gap-6 p-6">
      <div>
        <div className="text-lg font-semibold tracking-tight">N300</div>
        <div className="text-xs text-muted-foreground">libreta de atleta</div>
      </div>
      <ul className="flex flex-col gap-1">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
