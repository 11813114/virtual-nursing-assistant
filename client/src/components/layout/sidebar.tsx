import React from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  UserRound,
  MessageSquare,
  Bell,
  BookOpen,
  BarChart2,
  Settings,
  LogOut
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <Home className="sidebar-icon" />,
  },
  {
    label: "Patients",
    href: "/patients",
    icon: <UserRound className="sidebar-icon" />,
  },
  {
    label: "Messaging",
    href: "/messaging",
    icon: <MessageSquare className="sidebar-icon" />,
  },
  {
    label: "Reminders",
    href: "/reminders",
    icon: <Bell className="sidebar-icon" />,
  },
  {
    label: "Resources",
    href: "/resources",
    icon: <BookOpen className="sidebar-icon" />,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <BarChart2 className="sidebar-icon" />,
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="sidebar-icon" />,
  },
  {
    label: "Logout",
    href: "/logout",
    icon: <LogOut className="sidebar-icon" />,
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const { data: currentUser, isLoading } = useQuery<{ name: string; role: string; avatar?: string }>({
    queryKey: ["/api/users/me"],
    retry: false,
  });

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
    const isLogout = item.href === "/logout";

    return (
      <Link href={item.href}>
        <a
          className={cn(
            "sidebar-link",
            isActive && "active",
            isLogout && "hover:text-status-error"
          )}
          onClick={(e) => {
            if (isLogout) {
              e.preventDefault();
              // Handle logout logic here
              // For now, let's just redirect to the root
              window.location.href = "/";
            }
            setIsMobileSidebarOpen(false);
          }}
        >
          {item.icon}
          {item.label}
        </a>
      </Link>
    );
  };

  // Render desktop sidebar
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-neutral-100 shadow-sm">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary text-white">
            <h1 className="text-xl font-heading font-semibold">MediCare Pro</h1>
          </div>

          {/* User Profile */}
          <div className="flex items-center px-4 py-3 border-b border-neutral-100">
            {isLoading ? (
              <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse" />
            ) : (
              <UserAvatar
                name={currentUser?.name || "User"}
                imageUrl={currentUser?.avatar}
                className="h-10 w-10"
              />
            )}
            <div className="ml-3">
              <p className="text-sm font-medium">
                {isLoading ? (
                  <span className="h-4 w-24 bg-neutral-200 animate-pulse rounded block" />
                ) : (
                  currentUser?.name || "User"
                )}
              </p>
              <p className="text-xs text-neutral-400">
                {isLoading ? (
                  <span className="h-3 w-16 bg-neutral-200 animate-pulse rounded block mt-1" />
                ) : (
                  currentUser?.role || "User"
                )}
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-2 py-3 space-y-1">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="px-3 py-4 border-t border-neutral-100">
            {bottomNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-neutral-900 bg-opacity-50" />
          <div
            className="fixed inset-y-0 left-0 w-64 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile sidebar content - same as desktop */}
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-center h-16 px-4 bg-primary text-white">
                <h1 className="text-xl font-heading font-semibold">MediCare Pro</h1>
              </div>

              {/* User Profile */}
              <div className="flex items-center px-4 py-3 border-b border-neutral-100">
                {isLoading ? (
                  <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse" />
                ) : (
                  <UserAvatar
                    name={currentUser?.name || "User"}
                    imageUrl={currentUser?.avatar}
                    className="h-10 w-10"
                  />
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {isLoading ? (
                      <span className="h-4 w-24 bg-neutral-200 animate-pulse rounded block" />
                    ) : (
                      currentUser?.name || "User"
                    )}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {isLoading ? (
                      <span className="h-3 w-16 bg-neutral-200 animate-pulse rounded block mt-1" />
                    ) : (
                      currentUser?.role || "User"
                    )}
                  </p>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="flex-1 px-2 py-3 space-y-1">
                {mainNavItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </nav>

              {/* Bottom Actions */}
              <div className="px-3 py-4 border-t border-neutral-100">
                {bottomNavItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
