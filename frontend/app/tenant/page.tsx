"use client";

import { TenantLayout } from "@/components/layouts/TenantLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Euro,
  FileText,
  MessageSquare,
  AlertCircle,
  Lightbulb,
  Wrench,
  TrendingUp,
  Calendar,
  Clock,
  Loader2
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantPayments, useTenantReports, useTenantComplaints, useTenantSuggestions } from "@/hooks/useTenant";
import { useTenantPropertyReports } from "@/hooks/useMonthlyReports";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function TenantDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Fetch all tenant data
  const { data: payments, isLoading: paymentsLoading } = useTenantPayments(user?.id || 0, {
    year: currentYear,
  });
  const { data: reports, isLoading: reportsLoading } = useTenantReports();
  const { data: complaintsData, isLoading: complaintsLoading } = useTenantComplaints();
  const { data: suggestionsData, isLoading: suggestionsLoading } = useTenantSuggestions();
  const { data: monthlyReportsData } = useTenantPropertyReports({ year: currentYear });

  const complaints = complaintsData || [];
  const suggestions = suggestionsData || [];
  const monthlyReports = monthlyReportsData?.reports || [];

  // Calculate payment statistics
  const paymentStats = useMemo(() => {
    if (!payments) return null;

    const currentMonthPayment = payments.find(p => {
      const paymentDate = new Date(p.payment_month);
      return paymentDate.getMonth() + 1 === currentMonth && paymentDate.getFullYear() === currentYear;
    });

    const paidCount = payments.filter(p => p.status === 'paid').length;
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const overdueCount = payments.filter(p => p.status === 'overdue').length;

    return {
      currentMonthPayment,
      paidCount,
      pendingCount,
      overdueCount,
      totalPaid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount), 0),
    };
  }, [payments, currentMonth, currentYear]);

  // Calculate report statistics
  const reportStats = useMemo(() => {
    if (!reports) return { pending: 0, inProgress: 0, resolved: 0 };
    return {
      pending: reports.filter((r: any) => r.status === 'pending').length,
      inProgress: reports.filter((r: any) => r.status === 'in_progress').length,
      resolved: reports.filter((r: any) => r.status === 'resolved').length,
    };
  }, [reports]);

  // Format currency
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get current month name
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Check if rent is due soon (within 7 days)
  const isRentDueSoon = useMemo(() => {
    if (!paymentStats?.currentMonthPayment || paymentStats.currentMonthPayment.status === 'paid') {
      return false;
    }
    const today = new Date();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    return today.getDate() >= daysInMonth - 7;
  }, [paymentStats, currentMonth, currentYear]);

  const isLoading = paymentsLoading || reportsLoading || complaintsLoading || suggestionsLoading;

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['tenant']}>
        <TenantLayout title="Dashboard">
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </TenantLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['tenant']}>
      <TenantLayout title="Dashboard">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-slate-600 mt-1">
                Here's an overview of your apartment status
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">{currentMonthName}</span>
            </div>
          </div>

          {/* Alert for upcoming payment or overdue */}
          {paymentStats?.currentMonthPayment && paymentStats.currentMonthPayment.status !== 'paid' && (
            <Alert className={
              paymentStats.currentMonthPayment.status === 'overdue'
                ? "border-red-200 bg-red-50"
                : isRentDueSoon
                ? "border-amber-200 bg-amber-50"
                : "border-emerald-200 bg-emerald-50"
            }>
              <AlertCircle className={`h-4 w-4 ${
                paymentStats.currentMonthPayment.status === 'overdue'
                  ? "text-red-600"
                  : isRentDueSoon
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`} />
              <AlertTitle className={
                paymentStats.currentMonthPayment.status === 'overdue'
                  ? "text-red-900"
                  : isRentDueSoon
                  ? "text-amber-900"
                  : "text-emerald-900"
              }>
                {paymentStats.currentMonthPayment.status === 'overdue'
                  ? "Rent Payment Overdue"
                  : isRentDueSoon
                  ? "Rent Due Soon"
                  : "Rent Payment Pending"}
              </AlertTitle>
              <AlertDescription className={
                paymentStats.currentMonthPayment.status === 'overdue'
                  ? "text-red-700"
                  : isRentDueSoon
                  ? "text-amber-700"
                  : "text-emerald-700"
              }>
                Your rent payment of {formatCurrency(paymentStats.currentMonthPayment.amount)} for {currentMonthName} is {
                  paymentStats.currentMonthPayment.status === 'overdue' ? 'overdue' : 'pending'
                }. Please contact your property manager.
              </AlertDescription>
            </Alert>
          )}

          {paymentStats?.currentMonthPayment?.status === 'paid' && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <AlertCircle className="h-4 w-4 text-emerald-600" />
              <AlertTitle className="text-emerald-900">Rent Paid</AlertTitle>
              <AlertDescription className="text-emerald-700">
                Your rent for {currentMonthName} has been paid. Thank you!
                {paymentStats.currentMonthPayment.payment_date &&
                  ` (Paid on ${formatDate(paymentStats.currentMonthPayment.payment_date)})`
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Problem Reports Card */}
            <Card
              className="border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/tenant/report-problem')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Problem Reports</CardTitle>
                <Wrench className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {reportStats.pending + reportStats.inProgress}
                </div>
                <p className="text-xs text-slate-600">
                  {reportStats.pending > 0 && `${reportStats.pending} pending`}
                  {reportStats.pending > 0 && reportStats.inProgress > 0 && ', '}
                  {reportStats.inProgress > 0 && `${reportStats.inProgress} in progress`}
                  {reportStats.pending === 0 && reportStats.inProgress === 0 && 'No active reports'}
                </p>
              </CardContent>
            </Card>

            {/* Complaints Card */}
            <Card
              className="border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/tenant/complaints')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Complaints</CardTitle>
                <MessageSquare className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">{complaints.length}</div>
                <p className="text-xs text-slate-600">
                  {complaints.filter(c => c.status === 'pending').length} pending
                </p>
              </CardContent>
            </Card>

            {/* Suggestions Card */}
            <Card
              className="border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push('/tenant/suggestions')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
                <Lightbulb className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">{suggestions.length}</div>
                <p className="text-xs text-slate-600">
                  {suggestions.filter(s => s.status === 'approved').length} approved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>Your recent rent payments</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/tenant/payments')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {payments && payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">
                            {new Date(payment.payment_month).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-slate-600">
                            {formatCurrency(payment.amount)}
                            {payment.payment_date && ` • Paid ${formatDate(payment.payment_date)}`}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            payment.status === 'paid'
                              ? "bg-emerald-100 text-emerald-700"
                              : payment.status === 'overdue'
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                    {paymentStats && (
                      <div className="pt-3 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Total Paid This Year</span>
                          <span className="font-semibold text-emerald-700">
                            {formatCurrency(paymentStats.totalPaid)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No payment records available</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Problem Reports */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Problem Reports</CardTitle>
                    <CardDescription>Track your maintenance requests</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/tenant/report-problem')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {reports && reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.slice(0, 3).map((report: any) => (
                      <div key={report.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">
                            {report.problemOption?.name || 'Problem Report'}
                          </p>
                          <p className="text-sm text-slate-600">
                            Submitted {formatDate(report.created_at)}
                            {report.floor && ` • Floor ${report.floor}`}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            report.status === 'resolved'
                              ? "bg-emerald-100 text-emerald-700"
                              : report.status === 'in_progress'
                              ? "bg-blue-100 text-blue-700"
                              : report.status === 'rejected'
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }
                        >
                          {report.status === 'in_progress' ? 'In Progress' :
                           report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => router.push('/tenant/report-problem')}
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      Report New Problem
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500 mb-3">No problem reports yet</p>
                    <Button
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => router.push('/tenant/report-problem')}
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      Report New Problem
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Complaints */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Complaints</CardTitle>
                    <CardDescription>Your submitted complaints</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/tenant/complaints')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {complaints.length > 0 ? (
                  <div className="space-y-4">
                    {complaints.slice(0, 3).map((complaint) => (
                      <div key={complaint.id} className="border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-slate-900 flex-1">{complaint.title}</p>
                          <Badge
                            variant="secondary"
                            className={
                              complaint.status === 'resolved'
                                ? "bg-emerald-100 text-emerald-700"
                                : complaint.status === 'in_progress'
                                ? "bg-blue-100 text-blue-700"
                                : complaint.status === 'rejected'
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }
                          >
                            {complaint.status === 'in_progress' ? 'In Progress' :
                             complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{formatDate(complaint.created_at)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No complaints submitted</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Suggestions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Suggestions</CardTitle>
                    <CardDescription>Your improvement ideas</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/tenant/suggestions')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {suggestions.length > 0 ? (
                  <div className="space-y-4">
                    {suggestions.slice(0, 3).map((suggestion) => (
                      <div key={suggestion.id} className="border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-slate-900 flex-1">{suggestion.title}</p>
                          <Badge
                            variant="secondary"
                            className={
                              suggestion.status === 'approved'
                                ? "bg-emerald-100 text-emerald-700"
                                : suggestion.status === 'under_review'
                                ? "bg-blue-100 text-blue-700"
                                : suggestion.status === 'rejected'
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }
                          >
                            {suggestion.status === 'under_review' ? 'Under Review' :
                             suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{formatDate(suggestion.created_at)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No suggestions submitted</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Reports Section */}
          {monthlyReports.length > 0 && (
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/30 to-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle>Property Financial Reports</CardTitle>
                      <CardDescription>
                        View how your rent is allocated • {monthlyReports.length} report{monthlyReports.length !== 1 ? 's' : ''} available
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => router.push('/tenant/monthly-reports')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>Latest report: {formatDate(monthlyReports[0].created_at)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TenantLayout>
    </ProtectedRoute>
  );
}
