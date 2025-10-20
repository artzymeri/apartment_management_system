"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import {
  Building2,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  UserPlus,
  ChevronUp,
  Cog,
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
import { useRegisterRequests } from "@/hooks/useRegisterRequests";

const adminNavItems = [
  { href: "/admin", icon: BarChart3, label: "Paneli Kryesor" },
  { href: "/admin/properties", icon: Building2, label: "Pronat" },
  { href: "/admin/users", icon: Users, label: "Përdoruesit" },
  { href: "/admin/register-requests", icon: UserPlus, label: "Kërkesa për Regjistrim" },
  { href: "/admin/configurations", icon: Cog, label: "Konfigurimet" }
];

export function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  // Fetch pending register requests count
  const { data: registerRequestsData } = useRegisterRequests({ status: 'pending', limit: 1 });
  const pendingRequestsCount = registerRequestsData?.pagination?.total || 0;

  const handleLogout = async () => {
    await logout();
  };

  // Get current page title based on pathname
  const getPageTitle = () => {
    if (title) return title;
    const currentItem = adminNavItems.find((item) => item.href === pathname);
    return currentItem ? currentItem.label : "Admin Dashboard";
  };

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-slate-50">
      <div className="flex h-16 items-center gap-3 border-b border-slate-700 px-4">
        <div className="flex items-center gap-2">
        <Image src="/favicon.svg" alt="BllokuSync" width={140} height={35} className="h-8 w-auto brightness-200" style={{filter: 'brightness(1000%)'}} priority />
          <h3>BllokuSync</h3>
        </div>
        <Badge variant="destructive" className="ml-auto">
          Admin
        </Badge>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const showBadge = item.href === '/admin/register-requests' && pendingRequestsCount > 0;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {showBadge && (
                    <Badge
                      variant="destructive"
                      className="ml-auto h-5 min-w-5 px-1.5 text-xs font-semibold"
                    >
                      {pendingRequestsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator className="bg-slate-700" />
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-lg bg-slate-700/50 px-3 py-6 hover:bg-slate-700"
            >
              <Avatar>
                <AvatarImage src="/admin-avatar.jpg" />
                <AvatarFallback className="bg-red-600">
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
            <DropdownMenuLabel>Llogaria Ime</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Cilësimet e Profilit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Dil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

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
            <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {getPageTitle()}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
