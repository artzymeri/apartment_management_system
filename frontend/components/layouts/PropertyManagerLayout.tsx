"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  Users,
  Wrench,
  ClipboardList,
  MessageSquare,
  Star,
  Bell,
  LogOut,
  Menu,
  User,
  Settings,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const propertyManagerNavItems = [
  { href: "/property_manager", icon: ClipboardList, label: "Dashboard" },
  { href: "/property_manager/properties", icon: Building2, label: "Properties" },
  { href: "/property_manager/maintenance", icon: Wrench, label: "Maintenance" },
  { href: "/property_manager/tenants", icon: Users, label: "Tenants" },
  { href: "/property_manager/messages", icon: MessageSquare, label: "Messages" },
];

// Helper function to get page title
const getPageTitle = (pathname: string) => {
  const navItem = propertyManagerNavItems.find((item) => item.href === pathname);
  if (navItem) return navItem.label;

  // For nested routes
  if (pathname.startsWith("/property_manager/properties")) return "Properties";
  if (pathname.startsWith("/property_manager/maintenance")) return "Maintenance";
  if (pathname.startsWith("/property_manager/tenants")) return "Tenants";
  if (pathname.startsWith("/property_manager/messages")) return "Messages";

  return "Manager Dashboard";
};

export function PropertyManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-indigo-900 to-indigo-800 text-slate-50">
      <div className="flex h-16 items-center gap-2 border-b border-indigo-700 px-6">
        <Star className="h-6 w-6 text-amber-400" />
        <span className="text-xl font-bold">Manager Portal</span>
        <Badge variant="secondary" className="ml-auto bg-amber-500 text-slate-900">
          Manager
        </Badge>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {propertyManagerNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? "bg-amber-500 text-slate-900 hover:bg-amber-600"
                      : "text-slate-300 hover:bg-indigo-700 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator className="bg-indigo-700" />
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-lg bg-indigo-700/50 px-3 py-6 hover:bg-indigo-700"
            >
              <Avatar>
                <AvatarImage src="/manager-avatar.jpg" />
                <AvatarFallback className="bg-amber-500 text-slate-900">
                  {user?.name?.[0]}
                  {user?.surname?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-sm font-medium">
                  {user?.name} {user?.surname}
                </p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-56">
            <DropdownMenuLabel>Manager Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-slate-200 lg:block">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6 shadow-sm">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {pageTitle}
            </h1>
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
