"use client";

import Link from "next/link";
import * as React from "react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSelectedLayoutSegment } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarNavItem } from "@/types";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

interface MainNavProps {
  mainNav: {
    common: SidebarNavItem[];
    roleSpecific: {
      [key: string]: SidebarNavItem[];
    };
  };
  currentUser: {
    role?: string;
  } | null;
}

export function MainNav({ mainNav, currentUser }: MainNavProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const segment = useSelectedLayoutSegment();
  const [navItems, setNavItems] = useState<SidebarNavItem[]>([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize();

    const items = [...mainNav.common];
    const role = currentUser?.role;

    if (role !== undefined && mainNav.roleSpecific[role]) {
      items.push(...mainNav.roleSpecific[role]);
    }

    setNavItems(items);

    return () => window.removeEventListener("resize", handleResize);
  }, [mainNav, currentUser]);

  return (
    <div className="flex justify-between items-center">
      {isMobile && (
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 rounded-md bg-secondary text-secondary-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-square-menu"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 8h10" />
            <path d="M7 12h10" />
            <path d="M7 16h10" />
          </svg>
        </button>
      )}
      <nav className="hidden md:flex gap-6 items-center">
        {navItems.map((item, index) => {
          const Icon = Icons[item.icon || "arrowRight"];
          return (
            <DropdownMenu key={index}>
              <DropdownMenuTrigger asChild>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link
                      href={item.disabled ? "#" : item.href}
                      className={cn(
                        "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                        item.href.startsWith(`/${segment}`)
                          ? "text-foreground"
                          : "text-foreground/60",
                        item.disabled && "cursor-not-allowed opacity-80"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuTrigger>
            </DropdownMenu>
          );
        })}
      </nav>
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full right-0 w-full bg-white shadow-lg rounded-b-md md:hidden"
          >
            <nav className="flex flex-col p-4">
              {navItems.map((item, index) => {
                const Icon = Icons[item.icon || "arrowRight"];
                return (
                  <Link
                    key={index}
                    href={item.href || "#"}
                    className="py-2 text-lg font-medium hover:text-primary transition-colors flex items-center"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Icon className="mr-2 h-4 w-4" /> {/* Icon added here */}
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}