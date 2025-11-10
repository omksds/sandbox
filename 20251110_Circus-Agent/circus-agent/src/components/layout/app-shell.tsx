"use client";

import { productIdentity } from "@/config/product";
import { cn } from "@/lib/utils/cn";
import {
  Briefcase,
  Kanban,
  LayoutDashboard,
  LogOut,
  Search,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { signOut } from "next-auth/react";

type AppShellProps = {
  children: ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    organization?: string | null;
  };
};

const navigation = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/candidates", label: "求職者管理", icon: UsersRound },
  { href: "/jobs", label: "求人検索", icon: Briefcase },
  { href: "/pipelines", label: "選考ボード", icon: Kanban },
];

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              {productIdentity.tagline}
            </p>
            <p className="text-xl font-bold text-slate-900">
              {productIdentity.shortName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500 md:flex md:w-72">
              <Search className="mr-2 h-4 w-4 text-slate-400" />
              <input
                placeholder="案件・候補者を横断検索"
                className="w-full border-none bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500">{user?.organization}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        <nav className="hidden w-52 flex-shrink-0 flex-col gap-2 md:flex">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-900 text-white shadow-lg"
                    : "text-slate-600 hover:bg-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
