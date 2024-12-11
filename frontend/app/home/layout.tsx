import { MainNav } from "@/components/main-nav";
import { DashboardNav } from "@/components/nav";
import { dashboardConfig } from "@/config/dashboard";
import Link from "next/link";
import Image from "next/image";
import { UserAccountNav } from "@/components/user-account-nav";
import { getCurrentUser } from "@/lib/session";
import { notFound } from "next/navigation";
import * as motion from "framer-motion/client";
import React from "react";
import BreadcrumbLayout from "@/components/breadcrumb-layout";


interface DashboardLayoutProps {
  children: React.ReactNode;
  chats: { common: {title: string}[]};
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex h-16 justify-between items-center px-6"
        >
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/images/company-logo.png"
              alt="Company Logo"
              width={80}
              height={80}
              className="mr-2 pl-4 pr-2"
            />
            <span className="font-bold text-xl">Company-GPT</span>
          </Link>
          <div className="flex justify-end space-x-4">
            <div className="md:hidden mt-1">
              <MainNav mainNav={dashboardConfig.mainNav} currentUser={user} />
            </div>
            <UserAccountNav user={user} />
          </div>
        </motion.div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[200px] flex-col lg:block flex-shrink-0">
          <div className="h-[calc(100vh-4rem)] overflow-y-auto bg-customBlue text-primary-foreground">
            <DashboardNav
              type="common"
              sideBarNav={dashboardConfig.sidebarNav}
              currentUser={user}
              userEmail={user.email}
            />
          </div>
        </aside>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}