"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Scale, Salad, Camera } from "lucide-react";

const TABS = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/weight", label: "Weight", icon: Scale },
  { href: "/foods", label: "Foods", icon: Salad },
  { href: "/photo-log", label: "Photo", icon: Camera },
];

export default function NavBar() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/onboarding") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div
        className="mx-auto flex max-w-2xl justify-around px-2 pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
      >
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
