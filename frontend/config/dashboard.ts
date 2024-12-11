import { DashboardConfig } from "@/types";

export const dashboardConfig: DashboardConfig = {
  mainNav: {
    common: [
      {
        title: "New Chat",
        href: "/home",
        icon: "home",
      },
      {
        title: "Chats",
        href: "/home/chat",
        icon: "home",
      }
    ],
    roleSpecific: {
        "admin": [
          {
            title: "Manage Documents",
            href: "/home/Manage Documents",
            icon: "calendarDays",
          }]
      }
  },

  sidebarNav: {
    common: [
      {
        title: "New Chat",
        href: "/home",
        icon: "home",
      },
      {
        title: "Chats",
        href: "/home/chat",
        icon: "home",
      }
    ],
    roleSpecific: {
      "admin": [
        {
          title: "Manage Documents",
          href: "/home/manage_documents",
          icon: "calendarDays",
        }]
    }
  },
};