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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      toast.error(error.message || "Failed to load payment history");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
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
      <TenantLayout title="My Payments">
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  For year {selectedYear}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.paidAmount.toString())}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting confirmation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Payment List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    View your rental payment history and status
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-[120px]">
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
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Properties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Properties</SelectItem>
                        {userProperties.map((propId) => (
                          <SelectItem key={propId} value={propId.toString()}>
                            Property {propId}
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
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Euro className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No payments found</h3>
                  <p className="text-sm text-muted-foreground">
                    No payment records for the selected filters
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {formatDate(payment.payment_month)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {payment.property?.name || `Property ${payment.property_id}`}
                                </div>
                                {payment.property?.address && (
                                  <div className="text-xs text-muted-foreground">
                                    {payment.property.address}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(
                                payment.status
                              )} border-none text-white`}
                            >
                              <span className="mr-1">{getStatusIcon(payment.status)}</span>
                              {payment.status.charAt(0).toUpperCase() +
                                payment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.payment_date
                              ? new Date(payment.payment_date).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TenantLayout>
    </ProtectedRoute>
  );
}
