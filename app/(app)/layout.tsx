import { redirect } from "next/navigation";

import { BottomNav } from "@/components/nav/bottom-nav";
import { SideNav } from "@/components/nav/side-nav";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl md:gap-0">
        <aside className="hidden w-60 shrink-0 border-r border-border md:block">
          <SideNav />
        </aside>
        <main className="flex-1 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-10">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
