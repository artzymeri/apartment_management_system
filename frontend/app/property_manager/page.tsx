"use client";

import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  Euro,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/auth-api";
import Link from "next/link";
import { formatMonthYear, formatShortDate } from "@/lib/utils";
import * as React from "react";

interface DashboardData {
  overview: {
    totalProperties: number;
    totalTenants: number;
    totalApartments: number;
    occupiedApartments: number;
    vacantApartments: number;
    occupancyRate: number;
  };
  payments: {
    currentMonth: {
      paid: number;
      unpaid: number;
      total: number;
      revenue: number;
      collectionRate: string;
    };
    overdue: Array<{
      id: number;
      tenant: { name: string; email: string; number: string };
      property: { name: string; address: string };
      amount: number;
      paymentMonth: string;
      daysOverdue: number;
    }>;
  };
  reports: {
    statistics: {
      pending: number;
      in_progress: number;
      resolved: number;
    };
    pending: Array<any>;
  };
  complaints: {
    statistics: {
      pending: number;
      in_progress: number;
      resolved: number;
    };
    recent: Array<any>;
  };
  suggestions: {
    recent: Array<any>;
  };
  monthlyReports: {
    recent: Array<any>;
  };
  recentActivity: {
    newReports: number;
    newComplaints: number;
    newSuggestions: number;
    paymentsReceived: number;
  };
  properties: Array<{
    id: number;
    name: string;
    address: string;
    city: string;
    floors: number | null;
    totalApartments: number;
    occupiedApartments: number;
    tenantCount: number;
  }>;
}

export default function PropertyManagerDashboard() {
  const { user, isAuthenticated } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery<{ success: boolean; data: DashboardData }>({
    queryKey: ['pmDashboard', user?.id],
    queryFn: async () => {
      const token = authAPI.getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/property-manager-dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data;
    },
    enabled: isAuthenticated && !!user,
    refetchInterval: 60000, // Refetch every minute
    retry: 1,
  });

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['property_manager']}>
        <PropertyManagerLayout>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </PropertyManagerLayout>
      </ProtectedRoute>
    );
  }

  if (error || !dashboardData?.success) {
    return (
      <ProtectedRoute allowedRoles={['property_manager']}>
        <PropertyManagerLayout>
          <div className="flex items-center justify-center h-96">
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <p className="text-red-600">Gabim në ngarkimin e të dhënave të panelit. Ju lutemi provoni përsëri.</p>
              </CardContent>
            </Card>
          </div>
        </PropertyManagerLayout>
      </ProtectedRoute>
    );
  }

  const data = dashboardData.data;

  return (
    <ProtectedRoute allowedRoles={['property_manager']}>
      <PropertyManagerLayout>
        <div className="space-y-4 md:space-y-6">

          {/* Key Metrics Grid */}
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Properties Card */}
            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Pronat</CardTitle>
                <Building2 className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-indigo-700">{data.overview.totalProperties}</div>
                <p className="text-xs text-slate-600 mt-1">
                  {data.overview.totalApartments} apartamente gjithsej
                </p>
                <div className="mt-3">
                  <Link href="/property_manager/properties">
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 px-0 h-8">
                      Shiko të gjitha <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Tenants Card */}
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Banorët Aktivë</CardTitle>
                <Users className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-amber-700">{data.overview.totalTenants}</div>
                <div className="flex items-center mt-1">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                    {data.overview.occupancyRate}% zënë
                  </Badge>
                </div>
                <div className="mt-3">
                  <Link href="/property_manager/tenants">
                    <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 px-0 h-8">
                      Menaxho banorët <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Payments Card */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Të Ardhurat Mujore</CardTitle>
                <Euro className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-green-700">€{data.payments.currentMonth.revenue.toLocaleString()}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    {data.payments.currentMonth.collectionRate}% mbledhur
                  </Badge>
                </div>
                <div className="mt-3">
                  <Link href="/property_manager/payments">
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 px-0 h-8">
                      Shiko pagesat <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Card */}
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Ankesa në Pritje</CardTitle>
                <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-red-700">
                  {data.complaints.statistics.pending + data.complaints.statistics.in_progress}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Ankesa në pritje
                </p>
                <div className="mt-3">
                  <Link href="/property_manager/complaints">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 px-0 h-8">
                      Shqyrto ankesat <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Përmbledhja e Aktivitetit (7 Ditët e Fundit)</CardTitle>
              <CardDescription className="text-xs md:text-sm">Aktiviteti i fundit në të gjitha pronat tuaja</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3 p-3 md:p-4 border rounded-lg bg-slate-50">
                  <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-slate-900">{data.recentActivity.newReports}</p>
                    <p className="text-xs text-slate-600">Raporte të Reja</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 md:p-4 border rounded-lg bg-slate-50">
                  <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                    <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-slate-900">{data.recentActivity.newComplaints}</p>
                    <p className="text-xs text-slate-600">Ankesa të Reja</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 md:p-4 border rounded-lg bg-slate-50">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <Lightbulb className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-slate-900">{data.recentActivity.newSuggestions}</p>
                    <p className="text-xs text-slate-600">Sugjerime të Reja</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 md:p-4 border rounded-lg bg-slate-50">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-slate-900">{data.recentActivity.paymentsReceived}</p>
                    <p className="text-xs text-slate-600">Pagesa të Marra</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Different Sections */}
          <Tabs defaultValue="urgent" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto gap-1">
              <TabsTrigger value="urgent" className="text-xs md:text-sm px-2 py-2">Urgjente</TabsTrigger>
              <TabsTrigger value="properties" className="text-xs md:text-sm px-2 py-2">Pronat</TabsTrigger>
              <TabsTrigger value="payments" className="text-xs md:text-sm px-2 py-2">Pagesat</TabsTrigger>
              <TabsTrigger value="reports" className="text-xs md:text-sm px-2 py-2">Raportet</TabsTrigger>
              <TabsTrigger value="complaints" className="text-xs md:text-sm px-2 py-2">Ankesat</TabsTrigger>
            </TabsList>

            {/* Urgent Items Tab */}
            <TabsContent value="urgent" className="space-y-4">
              {/* Overdue Payments */}
              {data.payments.overdue.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2 text-base md:text-lg">
                      <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
                      Pagesa të Vonuara ({data.payments.overdue.length})
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">Kërkohet vëmendje e menjëhershme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.payments.overdue.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                              <p className="font-medium text-slate-900 text-sm md:text-base">{payment.tenant?.name}</p>
                              <Badge variant="destructive" className="text-xs w-fit">
                                {payment.daysOverdue} ditë vonë
                              </Badge>
                            </div>
                            <p className="text-xs md:text-sm text-slate-600">{payment.property?.name} - {payment.property?.address}</p>
                            <p className="text-xs text-slate-500 mt-1">Afati: {formatMonthYear(payment.paymentMonth)}</p>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                            <p className="text-lg md:text-xl font-bold text-red-600">€{payment.amount.toLocaleString()}</p>
                            <Button size="sm" className="text-xs md:text-sm h-8">Kontakto Banorin</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {data.payments.overdue.length > 5 && (
                      <div className="mt-4 text-center">
                        <Link href="/property_manager/payments">
                          <Button variant="outline" size="sm" className="text-xs md:text-sm">Shiko Të Gjitha Pagesat e Vonuara</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Pending Reports */}
              {data.reports.pending.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                      <Clock className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                      Raporte Mirëmbajtjeje në Pritje ({data.reports.pending.length})
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">Probleme që kërkojnë veprim</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.reports.pending.slice(0, 5).map((report) => (
                        <div key={report.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-3 md:p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                              <p className="font-medium text-slate-900 text-sm md:text-base">{report.title}</p>
                              <Badge className="capitalize w-fit text-xs" variant={report.status === 'in_progress' ? 'default' : 'secondary'}>
                                {report.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-xs md:text-sm text-slate-600 mb-2">{report.description}</p>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-slate-500">
                              <span>📍 {report.property?.name}</span>
                              <span>👤 {report.tenant?.name}</span>
                              <span>📅 {formatShortDate(report.createdAt)}</span>
                            </div>
                          </div>
                          <Link href={`/property_manager/reports`}>
                            <Button size="sm" variant="outline" className="text-xs md:text-sm h-8 w-full sm:w-auto">Shiko Detajet</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No Urgent Items */}
              {data.payments.overdue.length === 0 && data.reports.pending.length === 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="text-center py-4">
                      <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-green-600 mx-auto mb-3" />
                      <p className="text-base md:text-lg font-medium text-green-900">Jeni të gjithë në rregull!</p>
                      <p className="text-xs md:text-sm text-green-700">Asnjë çështje urgjente që kërkon vëmendje të menjëhershme.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent value="properties" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Pronat Tuaja</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Përmbledhje e të gjitha pronave të menaxhuara</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {data.properties.map((property) => (
                      <div key={property.id} className="border rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow bg-slate-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Building2 className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1 text-sm md:text-base">{property.name}</h3>
                        <p className="text-xs md:text-sm text-slate-600 mb-3">{property.address}, {property.city}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                          <div>
                            <p className="text-slate-500">Katet</p>
                            <p className="font-medium text-slate-900">
                              {property.floors !== null ? property.floors : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Banorët</p>
                            <p className="font-medium text-slate-900">{property.tenantCount || 0}</p>
                          </div>
                        </div>
                        <Link href={`/property_manager/properties`}>
                          <Button size="sm" variant="outline" className="w-full mt-3 text-xs md:text-sm h-8">
                            Shiko Detajet
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs md:text-sm">Paguar Këtë Muaj</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                      <span className="text-xl md:text-2xl font-bold text-green-700">{data.payments.currentMonth.paid}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs md:text-sm">Papaguar Këtë Muaj</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                      <span className="text-xl md:text-2xl font-bold text-red-700">{data.payments.currentMonth.unpaid}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs md:text-sm">Norma e Mbledhjes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                      <span className="text-xl md:text-2xl font-bold text-indigo-700">{data.payments.currentMonth.collectionRate}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Përmbledhja e Muajit Aktual</CardTitle>
                  <CardDescription className="text-xs md:text-sm">{formatMonthYear(new Date())}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 md:p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-xs md:text-sm text-green-700 font-medium">Të Ardhurat Totale të Mbledhura</p>
                        <p className="text-xs text-green-600">{data.payments.currentMonth.paid} pagesa</p>
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-green-700">€{data.payments.currentMonth.revenue.toLocaleString()}</p>
                    </div>
                    <Link href="/property_manager/payments">
                      <Button className="w-full text-xs md:text-sm h-9 md:h-10">Shiko Të Gjitha Pagesat</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-xs md:text-sm text-yellow-800">Në Pritje</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl md:text-3xl font-bold text-yellow-700">{data.reports.statistics.pending}</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-xs md:text-sm text-blue-800">Në Progres</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl md:text-3xl font-bold text-blue-700">{data.reports.statistics.in_progress}</p>
                  </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-xs md:text-sm text-green-800">Zgjidhur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl md:text-3xl font-bold text-green-700">{data.reports.statistics.resolved}</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Raportet e Fundit</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Raportet më të fundit të mirëmbajtjes dhe problemeve</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.reports.pending.length > 0 ? (
                    <div className="space-y-3">
                      {data.reports.pending.slice(0, 5).map((report) => (
                        <div key={report.id} className="p-3 md:p-4 border rounded-lg hover:bg-slate-50">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 text-sm md:text-base">{report.title}</p>
                              <p className="text-xs md:text-sm text-slate-600 mt-1">{report.description}</p>
                              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs text-slate-500">
                                <span>🏢 {report.property?.name}</span>
                                <span>👤 {report.tenant?.name}</span>
                              </div>
                            </div>
                            <Badge variant={report.status === 'pending' ? 'secondary' : 'default'} className="text-xs w-fit">
                              {report.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <Link href="/property_manager/reports">
                        <Button variant="outline" className="w-full text-xs md:text-sm h-9">Shiko Të Gjitha Raportet</Button>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8 text-xs md:text-sm">Asnjë raport i disponueshëm</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Complaints Tab */}
            <TabsContent value="complaints" className="space-y-4">
              <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-xs md:text-sm text-red-800">Në Pritje</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl md:text-3xl font-bold text-red-700">{data.complaints.statistics.pending}</p>
                  </CardContent>
                </Card>
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-xs md:text-sm text-orange-800">Në Progres</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl md:text-3xl font-bold text-orange-700">{data.complaints.statistics.in_progress}</p>
                  </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-xs md:text-sm text-green-800">Zgjidhur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl md:text-3xl font-bold text-green-700">{data.complaints.statistics.resolved}</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Ankesat e Fundit</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Ankesat më të fundit të banorëve</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.complaints.recent.length > 0 ? (
                    <div className="space-y-3">
                      {data.complaints.recent.map((complaint) => (
                        <div key={complaint.id} className="p-3 md:p-4 border rounded-lg hover:bg-slate-50">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 text-sm md:text-base">{complaint.title}</p>
                              <p className="text-xs md:text-sm text-slate-600 mt-1">{complaint.description}</p>
                              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs text-slate-500">
                                <span>🏢 {complaint.property?.name}</span>
                                <span>👤 {complaint.tenant?.name}</span>
                              </div>
                            </div>
                            <Badge className="capitalize w-fit text-xs" variant={complaint.status === 'pending' ? 'destructive' : 'secondary'}>
                              {complaint.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <Link href="/property_manager/complaints">
                        <Button variant="outline" className="w-full text-xs md:text-sm h-9">Shiko Të Gjitha Ankesat</Button>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8 text-xs md:text-sm">Asnjë ankesë e disponueshme</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PropertyManagerLayout>
    </ProtectedRoute>
  );
}
