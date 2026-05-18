"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Repeat,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/finance", label: "Overview", icon: LayoutDashboard },
  { href: "/finance/transactions", label: "Transactions", icon: Receipt },
  { href: "/finance/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/finance/subscriptions", label: "Subscriptions", icon: Repeat },
  { href: "/finance/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/finance/settings", label: "Settings", icon: Settings },
];

export function FinanceNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/finance"
            ? pathname === "/finance"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition",
              active
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                : "text-zinc-600 hover:bg-white/50 dark:text-zinc-300 dark:hover:bg-white/10",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
