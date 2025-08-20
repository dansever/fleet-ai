import {
  Building2,
  Fuel,
  Home,
  Inbox,
  LifeBuoy,
  MessageCircle,
  Plane,
  Settings2,
  ShoppingCart,
} from 'lucide-react';

interface SidebarTab {
  title: string;
  url: string;
  icon: React.ElementType;
  isReady?: boolean;
}

export const sidebarTabs: Record<string, SidebarTab[]> = {
  dashboard: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
      isReady: true,
    },
  ],
  procurement: [
    {
      title: 'Technical',
      url: '/technical-procurement',
      icon: Plane,
      isReady: true,
    },
    {
      title: 'Fuel',
      url: '/fuel-procurement',
      icon: Fuel,
      isReady: true,
    },
    {
      title: 'Airport Hub',
      url: '/airport-hub',
      icon: Building2,
      isReady: false,
    },
  ],
  supplier: [
    {
      title: 'Supplier Hub',
      url: '/supplier-hub',
      icon: ShoppingCart,
      isReady: true,
    },
  ],
  tools: [
    {
      title: 'AI Chat',
      url: '/chat',
      icon: MessageCircle,
      isReady: true,
    },
    {
      title: 'Inbox',
      url: '/inbox',
      icon: Inbox,
      isReady: true,
    },
  ],
  dev: [
    {
      title: 'Dev Page',
      url: '/dev-page',
      icon: Settings2,
      isReady: true,
    },
  ],
  administration: [
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings2,
      isReady: true,
    },
    {
      title: 'Support',
      url: '/support',
      icon: LifeBuoy,
      isReady: true,
    },
  ],
};
