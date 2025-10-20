"use client";

import { useState, useEffect } from "react";
import { TenantLayout } from "@/components/layouts/TenantLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getTenantPayments, TenantPayment } from "@/lib/tenant-payment-api";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Euro, CheckCircle, Clock, AlertCircle, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TenantPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<TenantPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedProperty, setSelectedProperty] = useState<string>("all");

  // Get unique properties from user's property_ids
  const userProperties = user?.property_ids || [];

  useEffect(() => {
    if (user?.id) {
      fetchPayments();
    }
  }, [selectedYear, selectedProperty, user?.id]);

  const fetchPayments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const filters: any = { year: selectedYear };

      if (selectedProperty !== "all") {
        filters.property_id = parseInt(selectedProperty);
      }

      const data = await getTenantPayments(user.id, filters);
      setPayments(data);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      toast.error(error.message || "Gabim në ngarkimin e historikut të pagesave");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "E Paguar";
      case "pending":
        return "Në Pritje";
      case "overdue":
        return "E Vonuar";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("sq-AL", {
      year: "numeric",
      month: "long",
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("sq-AL", {
      style: "currency",
      currency: "EUR",
    }).format(parseFloat(amount));
  };

  // Calculate statistics
  const stats = {
    total: payments.length,
    paid: payments.filter((p) => p.status === "paid").length,
    pending: payments.filter((p) => p.status === "pending").length,
    overdue: payments.filter((p) => p.status === "overdue").length,
    totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
    paidAmount: payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0),
  };

  // Generate years for the dropdown (current year and 2 years back)
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  return (
    <ProtectedRoute allowedRoles={["tenant"]}>
      <TenantLayout title="Pagesat e Mia">
        <div className="space-y-4 sm:space-y-6">
          {/* Header Stats */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Pagesa Totale</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Për vitin {selectedYear}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Të Paguara</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.paid}</div>
                <p className="text-xs text-muted-foreground truncate">
                  {formatCurrency(stats.paidAmount.toString())}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Në Pritje</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Në pritje të konfirmimit
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Të Vonuara</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.overdue}</div>
                <p className="text-xs text-muted-foreground">
                  Kërkon vëmendje
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Payment List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:gap-4">
                <div>
                  <CardTitle className="text-base sm:text-lg">Historiku i Pagesave</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Shikoni historikun dhe gjendjen e pagesave tuaja mujore
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-full sm:w-[120px] h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {userProperties.length > 1 && (
                    <Select
                      value={selectedProperty}
                      onValueChange={setSelectedProperty}
                    >
                      <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
                        <SelectValue placeholder="Të Gjitha Pronat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Të Gjitha Pronat</SelectItem>
                        {userProperties.map((propId) => (
                          <SelectItem key={propId} value={propId.toString()}>
                            Prona {propId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 sm:h-16 w-full" />
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                  <Euro className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold">Nuk u gjetën pagesa</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Nuk ka të dhëna për pagesat me filtrat e zgjedhura
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <Card key={payment.id} className="border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3">
                          {/* Month and Status Row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm sm:text-base text-slate-900">
                                {formatDate(payment.payment_month)}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-xs sm:text-sm text-slate-700 truncate">
                                    {payment.property?.name || `Prona ${payment.property_id}`}
                                  </div>
                                  {payment.property?.address && (
                                    <div className="text-xs text-muted-foreground truncate">
                                      {payment.property.address}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(
                                payment.status
                              )} border-none text-white flex-shrink-0 text-xs`}
                            >
                              <span className="mr-1">{getStatusIcon(payment.status)}</span>
                              {getStatusText(payment.status)}
                            </Badge>
                          </div>

                          {/* Amount and Date Row */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div>
                              <div className="text-xs text-muted-foreground">Shuma</div>
                              <div className="text-base sm:text-lg font-bold text-emerald-700">
                                {formatCurrency(payment.amount)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">Data e Pagesës</div>
                              <div className="text-xs sm:text-sm font-medium text-slate-700">
                                {payment.payment_date
                                  ? new Date(payment.payment_date).toLocaleDateString('sq-AL')
                                  : "-"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TenantLayout>
    </ProtectedRoute>
  );
}
