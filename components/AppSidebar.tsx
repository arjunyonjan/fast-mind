"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutGrid, Sparkles, Home } from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Tasks", href: "/tasks", icon: LayoutGrid },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Sparkles className="h-6 w-6 text-cyan-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            FastMind
          </span>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}