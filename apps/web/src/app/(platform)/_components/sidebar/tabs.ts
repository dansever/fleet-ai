import {
  BarChart,
  Fuel,
  LayoutDashboard,
  Package,
  Plane,
  Settings,
  Settings2,
  ShoppingCart,
} from 'lucide-react';

interface SidebarTab {
  title: string;
  description?: string;
  url: string;
  icon: React.ElementType;
  isReady?: boolean;
  newTab?: boolean;
}

export const sidebarTabs: Record<string, SidebarTab[]> = {
  dashboard: [
    {
      title: 'Dashboard',
      description: 'Overview & Analytics',
      url: '/dashboard',
      icon: LayoutDashboard,
      isReady: true,
    },
    {
      title: 'Analytics',
      description: 'Analytics',
      url: '/analytics',
      icon: BarChart,
      isReady: true,
    },
  ],
  procurement: [
    {
      title: 'Technical',
      description: 'Parts & Services RFQs',
      url: '/technical-procurement',
      icon: Package,
      isReady: true,
    },
    {
      title: 'Fuel',
      description: 'Fuel Tenders & Contracts',
      url: '/fuel',
      icon: Fuel,
      isReady: true,
    },
    {
      title: 'Airport Hub',
      description: 'Airport Operations & Contracts',
      url: '/airport-hub',
      icon: Plane,
      isReady: true,
    },
  ],
  supplier: [
    {
      title: 'Supplier Hub',
      description: 'Supplier Management',
      url: '/supplier-hub',
      icon: ShoppingCart,
      isReady: true,
    },
  ],
  admin: [
    {
      title: 'Admin',
      url: '/admin',
      icon: Settings2,
      isReady: true,
    },
  ],
  administration: [
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
      isReady: true,
    },
  ],
};
