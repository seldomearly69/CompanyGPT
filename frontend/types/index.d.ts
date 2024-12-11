export const dashboardConfig: NavStructure = {
    common: [...mainNav.common, ...sidebarNav.common],
    roleSpecific: {
      ...mainNav.roleSpecific,
      ...sidebarNav.roleSpecific,
    },
    // Add other shared properties here
  };
  
  export type DashboardConfig = {
    mainNav: {
      common: MainNavItem[];
      roleSpecific: { [key: string]: MainNavItem[] };
    };
    sidebarNav: {
      common: SidebarNavItem[];
      roleSpecific: { [key: string]: SidebarNavItem[] };
    };
  };
  export type MainNavItem = {
    title: string;
    href: string;
    disabled?: boolean;
    external?: boolean;
    icon?: keyof typeof Icons;
  };
  
  export type SidebarNavItem = {
    title: string;
    href?: string;
    disabled?: boolean;
    external?: boolean;
    icon?: keyof typeof Icons;
  };
  
  export type NavbarItem = {
    title: string;
    href: string;
    disabled?: boolean;
    external?: boolean;
    icon?: keyof typeof Icons;
    image?: string;
  };
  
  export type User = {
    name: string;
    email: string;
    role: string;
  };
  
  
  