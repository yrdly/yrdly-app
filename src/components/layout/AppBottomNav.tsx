
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ShoppingCart, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/neighbors", icon: Users, label: "Community" },
  { href: "/marketplace", icon: ShoppingCart, label: "Market" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/businesses", icon: Briefcase, label: "Businesses" },
];

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex items-center justify-around py-3">
        {navLinks.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link href={href} key={href} className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col gap-1 w-full ${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
