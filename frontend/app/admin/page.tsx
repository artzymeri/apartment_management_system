"use client";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Clock, TrendingUp, MapPin, UserPlus } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useProperties } from "@/hooks/useProperties";
import { useRegisterRequests } from "@/hooks/useRegisterRequests";
import { useCities } from "@/hooks/useCities";
import Link from "next/link";
import { useMemo } from "react";

type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  created_at: string;
};

type Property = {
  id: number;
  managers?: unknown[];
};

export default function AdminDashboard() {
  // Fetch all data
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const { data: propertiesData, isLoading: propertiesLoading } = useProperties();
  const { data: pendingRequests, isLoading: requestsLoading } = useRegisterRequests({ status: 'pending' });
  const { data: citiesData, isLoading: citiesLoading } = useCities();

  // Helper function to format role names in Albanian
  const formatRole = (role: string) => {
    if (role === 'property_manager') return 'Menaxher Pronash';
    if (role === 'admin') return 'Administrator';
    if (role === 'tenant') return 'Qiramarrës';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = usersData?.data?.length || 0;
    const totalProperties = propertiesData?.data?.length || 0;
    const pendingRequestsCount = pendingRequests?.data?.length || 0;
    const totalCities = citiesData?.data?.length || 0;

    // Role breakdown
    const adminCount = usersData?.data?.filter((u: User) => u.role === 'admin').length || 0;
    const propertyManagerCount = usersData?.data?.filter((u: User) => u.role === 'property_manager').length || 0;
    const tenantCount = usersData?.data?.filter((u: User) => u.role === 'tenant').length || 0;

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = usersData?.data?.filter((u: User) =>
      new Date(u.created_at) > sevenDaysAgo
    ).length || 0;

    // Properties with managers
    const propertiesWithManagers = propertiesData?.data?.filter((p: Property) =>
      p.managers && p.managers.length > 0
    ).length || 0;

    return {
      totalUsers,
      totalProperties,
      pendingRequestsCount,
      totalCities,
      adminCount,
      propertyManagerCount,
      tenantCount,
      recentUsers,
      propertiesWithManagers,
    };
  }, [usersData, propertiesData, pendingRequests, citiesData]);

  // Get recent users (last 5)
  const recentUsers = useMemo(() => {
    if (!usersData?.data) return [];
    return [...usersData.data]
      .sort((a: User, b: User) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [usersData]);

  const isLoading = usersLoading || propertiesLoading || requestsLoading || citiesLoading;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-red-200 bg-red-50/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totali i Pronave</CardTitle>
                <Building2 className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">
                  {isLoading ? "..." : stats.totalProperties}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {isLoading ? "Duke u ngarkuar..." : `${stats.propertiesWithManagers} me menaxherë të caktuar`}
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totali i Përdoruesve</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {isLoading ? "..." : stats.totalUsers}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {isLoading ? "Duke u ngarkuar..." : `+${stats.recentUsers} në 7 ditët e fundit`}
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kërkesa në Pritje</CardTitle>
                <Clock className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">
                  {isLoading ? "..." : stats.pendingRequestsCount}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {stats.pendingRequestsCount > 0 ? "Në pritje të miratimit" : "Gjithçka në rregull!"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qytete Aktive</CardTitle>
                <MapPin className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {isLoading ? "..." : stats.totalCities}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {isLoading ? "Duke u ngarkuar..." : "Vendndodhje të konfiguruara"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Shpërndarja e Përdoruesve sipas Rolit</CardTitle>
              <CardDescription>Ndarja e përdoruesve në nivele të ndryshme akses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Administratorë</p>
                    <p className="text-2xl font-bold text-slate-900">{isLoading ? "..." : stats.adminCount}</p>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">Admin</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Menaxherë Pronash</p>
                    <p className="text-2xl font-bold text-slate-900">{isLoading ? "..." : stats.propertyManagerCount}</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Menaxher</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Qiramarrës</p>
                    <p className="text-2xl font-bold text-slate-900">{isLoading ? "..." : stats.tenantCount}</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Qiramarrës</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  Përdorues të Fundit
                </CardTitle>
                <CardDescription>Regjistrimet e fundit të përdoruesve</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-slate-500">Duke u ngarkuar...</p>
                ) : recentUsers.length === 0 ? (
                  <p className="text-sm text-slate-500">Nuk ka përdorues ende</p>
                ) : (
                  <div className="space-y-3">
                    {recentUsers.map((user: User) => (
                      <div key={user.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{user.name} {user.surname}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              user.role === 'admin'
                                ? 'border-red-200 text-red-700'
                                : user.role === 'property_manager'
                                ? 'border-blue-200 text-blue-700'
                                : 'border-green-200 text-green-700'
                            }
                          >
                            {formatRole(user.role)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full mt-4 border-slate-200 hover:bg-slate-50">
                    Shiko të Gjithë Përdoruesit
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  Veprime të Shpejta
                </CardTitle>
                <CardDescription>Detyra të zakonshme administrative</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/admin/register-requests">
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Clock className="h-4 w-4 text-amber-700" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Kërkesa për Regjistrim</p>
                          <p className="text-xs text-slate-500">
                            {stats.pendingRequestsCount} në pritje të miratimit
                          </p>
                        </div>
                      </div>
                      {stats.pendingRequestsCount > 0 && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          {stats.pendingRequestsCount}
                        </Badge>
                      )}
                    </div>
                  </Link>

                  <Link href="/admin/properties">
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Building2 className="h-4 w-4 text-red-700" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Menaxho Pronat</p>
                          <p className="text-xs text-slate-500">Shiko dhe edito të gjitha pronat</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/admin/users">
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-4 w-4 text-blue-700" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Menaxho Përdoruesit</p>
                          <p className="text-xs text-slate-500">Shiko dhe menaxho të gjithë përdoruesit</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/admin/configurations">
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MapPin className="h-4 w-4 text-green-700" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Konfigurimet e Sistemit</p>
                          <p className="text-xs text-slate-500">Menaxho qytetet dhe cilësimet</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
