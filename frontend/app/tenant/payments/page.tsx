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
import { formatShortDate, formatMonthYear } from "@/lib/utils";

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
                    <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                      <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
                        <SelectValue placeholder="Të Gjitha Pronat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Të Gjitha Pronat</SelectItem>
                        {userProperties.map((propertyId) => (
                          <SelectItem key={propertyId} value={propertyId.toString()}>
                            Prona {propertyId}
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
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">Nuk ka pagesa për këtë periudhë</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="font-medium text-slate-900">
                            {formatMonthYear(payment.payment_month)}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Euro className="h-3 w-3 flex-shrink-0" />
                            <span>{formatCurrency(payment.amount)}</span>
                          </div>
                          {payment.payment_date && (
                            <div className="flex items-center gap-2">
                              <span className="hidden sm:inline text-slate-400">•</span>
                              <span>Paguar më {formatShortDate(payment.payment_date)}</span>
                            </div>
                          )}
                        </div>
                        {payment.property && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Building2 className="h-3 w-3 flex-shrink-0" />
                            <span>{payment.property.name}</span>
                          </div>
                        )}
                      </div>
                      <Badge
                        className={`${getStatusColor(
                          payment.status
                        )} text-white flex items-center gap-1 self-start sm:self-auto`}
                      >
                        {getStatusIcon(payment.status)}
                        <span>{getStatusText(payment.status)}</span>
                      </Badge>
                    </div>
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
