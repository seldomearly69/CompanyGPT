"use client";

import { SidebarNavItem } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Icons } from "@/components/icons";
import { useEffect, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type DashboardNavProps =
  | {
      type: "common";
      sideBarNav: {
        common: SidebarNavItem[];
        roleSpecific: {
          [key: string]: SidebarNavItem[];
        };
      };
      currentUser: {
        role?: string;
      } | null;
      userEmail: string;
    }
  | {
      type: "chat";
      sideBarNav: {
        common: { title: string }[];
      };
      currentUser?: null; // Current user is irrelevant for this type
      userEmail: string;
    };

    export function DashboardNav({ sideBarNav, currentUser, type, userEmail }: DashboardNavProps) {
        const path = usePathname();
        const router = useRouter();
        const [navItems, setNavItems] = useState<SidebarNavItem[]>([]);
        const { chats, refreshChats } = useChat();
        const [showChats, setShowChats] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
      
        useEffect(() => {
          if (showChats && userEmail) {
            refreshChats(userEmail);
          }
        }, [showChats, userEmail]);
      
        useEffect(() => {
          if (path.includes('/chat/')) {
            setShowChats(true);
          }
        }, [path]);
      
        useEffect(() => {
          setIsLoading(true);
          if (showChats) {
            const chatItems = chats.map((chat) => ({
              title: chat.title || `Chat ${new Date(chat.timestamp).toLocaleDateString()}`,
              href: `/home/chat/${chat.chat_id}`,
              icon: "messageSquare"
            }));
            setNavItems(chatItems);
          } else {
            const items = [...sideBarNav.common];
            if (
              currentUser &&
              currentUser.role !== undefined &&
              sideBarNav.roleSpecific[currentUser.role]
            ) {
              items.push(...sideBarNav.roleSpecific[currentUser.role]);
            }
            setNavItems(items);
          }
          setTimeout(() => setIsLoading(false), 100);
        }, [sideBarNav, currentUser, chats, showChats]);
      
        return (
          <nav className="py-3 flex flex-col h-full">
            <AnimatePresence mode="wait">
              {showChats && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="mx-2"
                >
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start mb-2 px-2"
                    onClick={() => {
                      router.replace("/home");
                      setShowChats(false)
                    }}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Menu
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={showChats ? 'chats' : 'menu'}
                className="relative flex-1 overflow-hidden"
                initial={{ opacity: 0, x: showChats ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: showChats ? -50 : 50 }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut"
                }}
              >
                <div className={cn(
                  "grid items-start gap-1 px-2",
                  isLoading ? "invisible" : "visible"
                )}>
                  {showChats && navItems.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-4 text-sm text-muted-foreground"
                    >
                      <p>No chats yet</p>
                      <p className="text-xs mt-1">Start a new chat from the home page</p>
                    </motion.div>
                  ) : (
                    navItems.map((item, index) => (
                      <motion.div 
                        key={item.href}
                        className="min-w-0"
                        initial={{ opacity: 0, x: showChats ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.05,
                          ease: "easeOut"
                        }}
                      >
                        <Link 
                          href={item.href}
                          onClick={() => {
                            if (item.href.includes('/chat')) {
                              setShowChats(true);
                            }
                          }}
                        >
                          <span className={cn(
                            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            path === item.href ? "bg-accent text-accent-foreground" : "transparent",
                            "w-full"
                          )}>
                            <span className="truncate">{item.title}</span>
                          </span>
                        </Link>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </nav>
        );
      }