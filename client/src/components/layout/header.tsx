import React from "react";
import { UserAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Menu, Bell, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  message: string;
  time: string;
  isRead: boolean;
}

export function Header() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: 1,
      message: "Robert Johnson's oxygen levels have improved",
      time: "5 minutes ago",
      isRead: false,
    },
    {
      id: 2,
      message: "Medication reminder for Maria Garcia",
      time: "10 minutes ago",
      isRead: false,
    },
    {
      id: 3,
      message: "New lab results available",
      time: "1 hour ago",
      isRead: true,
    },
  ]);
  
  const { toast } = useToast();

  const { data: currentUser, isLoading } = useQuery<{ name: string; avatar?: string }>({
    queryKey: ["/api/users/me"],
    retry: false,
  });

  const toggleMobileSidebar = () => {
    document.dispatchEvent(new CustomEvent("toggle-sidebar"));
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    toast({
      title: "Notifications",
      description: "All notifications marked as read",
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Search",
        description: `Searching for "${searchQuery}"`,
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden text-neutral-500 hover:text-neutral-600 focus:outline-none"
          onClick={toggleMobileSidebar}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-lg mx-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <Input
                type="search"
                placeholder="Search patients, reminders..."
                className="block w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-md text-sm placeholder-neutral-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-neutral-500 hover:text-neutral-600"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive"></span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary"
                    onClick={markAllNotificationsAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-neutral-500 py-2">No notifications</p>
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={`py-2 ${!notification.isRead ? "bg-neutral-50" : ""}`}
                      >
                        <p className="text-sm">{notification.message}</p>
                        <span className="text-xs text-neutral-400 mt-1 block">
                          {notification.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-neutral-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-sm"
                >
                  View all notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <div className="hidden md:flex items-center">
            {isLoading ? (
              <div className="h-8 w-8 rounded-full bg-neutral-200 animate-pulse" />
            ) : (
              <UserAvatar
                name={currentUser?.name || "User"}
                imageUrl={currentUser?.avatar}
                className="h-8 w-8"
              />
            )}
            <span className="ml-2 text-sm font-medium hidden lg:block">
              {isLoading ? (
                <span className="h-4 w-24 bg-neutral-200 animate-pulse rounded inline-block align-middle" />
              ) : (
                currentUser?.name || "User"
              )}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
