'use client';

import type { Transition, Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { Bell, Home, Settings, User } from 'lucide-react';
import { createContext, ReactNode, useContext, useState } from 'react';

interface MenuItem {
  icon: ReactNode;
  label: string;
  value: string;
}

// Context for managing tab state
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabsContext must be used within a TabsProvider');
  }
  return context;
};

const gradient =
  'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)';

const menuItems: MenuItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: 'Home',
    value: '#',
  },
  {
    icon: <Bell className="h-5 w-5" />,
    label: 'Notifications',
    value: '#',
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
    value: '#',
  },
  {
    icon: <User className="h-5 w-5" />,
    label: 'Profile',
    value: '#',
  },
];

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
};

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
};

const bezier: [number, number, number, number] = [0.4, 0, 0.2, 1];

const glowVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: bezier },
      scale: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 },
    },
  },
};

const navGlowVariants: Variants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: { duration: 0.5, ease: bezier },
  },
};

const springTransition: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
};

interface MenuTabsProps {
  menuItems: MenuItem[];
  defaultTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

// TabsContent component that shows/hides based on active tab
interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return null;
  }

  return <div className={`flex-1 outline-none ${className}`}>{children}</div>;
}

// Main Tabs wrapper component
interface TabsProps {
  defaultTab: string;
  children: ReactNode;
  className?: string;
}

export function AnimatedTabs({ defaultTab, children, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`flex flex-col ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function MenuTabs({ menuItems, defaultTab, onTabChange, className }: MenuTabsProps) {
  const { activeTab, setActiveTab } = useTabsContext();

  const handleTabClick = (value: string) => {
    setActiveTab(value);
    onTabChange(value);
  };

  return (
    <motion.nav
      className="py-1.5 rounded-2xl bg-white shadow-none relative overflow-hidden w-fit px-8 min-w-max"
      initial="initial"
      whileHover="hover"
    >
      {/* Glow */}
      <motion.div
        className={`absolute -inset-2 bg-gradient-radial from-transparent ${'via-blue-400/20 via-30% via-purple-400/20 via-60% via-red-400/20 via-90%'} to-transparent rounded-3xl z-0 pointer-events-none`}
        variants={navGlowVariants}
      />
      {/* Menu Items */}
      <ul className="flex items-center gap-12 relative z-10">
        {menuItems.map((item, index) => {
          const isActive = activeTab === item.value;
          return (
            // Menu Item Container
            <motion.li key={item.label} className="relative">
              {/* Menu Item */}
              <motion.div
                className="block rounded-xl overflow-visible group relative"
                style={{ perspective: '600px' }}
                whileHover="hover"
                initial="initial"
              >
                {/* Glow */}
                <motion.div
                  className="absolute -inset-6 z-0 pointer-events-none blur-sm rounded-3xl
               [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]
               [mask-repeat:no-repeat]"
                  variants={navGlowVariants}
                  style={{ background: gradient }}
                />

                {/* Menu Item Content */}
                <motion.button
                  onClick={() => handleTabClick(item.value)}
                  className={`flex items-center gap-2 px-4 py-2 relative z-10 bg-transparent transition-colors rounded-xl whitespace-nowrap ${
                    isActive ? 'text-blue-500' : 'text-muted-foreground group-hover:text-blue-500'
                  }`}
                  variants={itemVariants}
                  transition={springTransition as Transition}
                  style={{ transformStyle: 'preserve-3d', transformOrigin: 'center bottom' }}
                >
                  <span className="transition-colors duration-300">
                    {/* Menu Item Icon */}
                    {item.icon}
                  </span>
                  {/* Menu Item Label */}
                  <span>{item.label}</span>
                </motion.button>
                {/* Menu Item Back */}
                <motion.button
                  onClick={() => handleTabClick(item.value)}
                  className={`flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 bg-transparent transition-colors rounded-xl text-blue-500 whitespace-nowrap ${
                    isActive ? 'bg-blue-50' : ''
                  }`}
                  variants={backVariants}
                  transition={springTransition as Transition}
                  style={{
                    transformStyle: 'preserve-3d',
                    transformOrigin: 'center top',
                    rotateX: 90,
                  }}
                >
                  {/* Menu Item Icon */}
                  <span className="transition-colors duration-300">{item.icon}</span>
                  {/* Menu Item Label */}
                  <span>{item.label}</span>
                </motion.button>
              </motion.div>
            </motion.li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
