"use client";

import { TenantLayout } from "@/components/layouts/TenantLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
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
import { useTenantDashboard } from "@/hooks/useTenant";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function TenantDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Fetch all tenant data with single API call
  const { data: dashboardData, isLoading } = useTenantDashboard({ year: currentYear });

  // Extract data from unified response
  const payments = dashboardData?.payments || [];
  const reports = dashboardData?.reports || [];
  const complaints = dashboardData?.complaints || [];
  const suggestions = dashboardData?.suggestions || [];
  const monthlyReports = dashboardData?.monthlyReports || [];
  const stats = dashboardData?.stats;

  // Calculate payment statistics
  const paymentStats = useMemo(() => {
    if (!payments || payments.length === 0) return null;

    const currentMonthPayment = payments.find(p => {
      const paymentDate = new Date(p.payment_month);
      return paymentDate.getMonth() + 1 === currentMonth && paymentDate.getFullYear() === currentYear;
    });

    return {
      currentMonthPayment,
      paidCount: stats?.payments.paid || 0,
      pendingCount: stats?.payments.pending || 0,
      overdueCount: stats?.payments.overdue || 0,
      totalPaid: stats?.payments.totalPaid || 0,
    };
  }, [payments, stats, currentMonth, currentYear]);

  // Calculate report statistics
  const reportStats = useMemo(() => {
    return {
      pending: stats?.reports.pending || 0,
      inProgress: stats?.reports.inProgress || 0,
      resolved: stats?.reports.resolved || 0,
    };
  }, [stats]);

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

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['tenant']}>
        <TenantLayout title="Dashboard">
          <div className="w-full h-full flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </TenantLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['tenant']}>
      <TenantLayout title="Dashboard">
        <div className="space-y-4 sm:space-y-6">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                Here's an overview of your apartment status
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">{currentMonthName}</span>
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
              <AlertCircle className={`h-4 w-4 flex-shrink-0 ${
                paymentStats.currentMonthPayment.status === 'overdue'
                  ? "text-red-600"
                  : isRentDueSoon
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`} />
              <AlertTitle className={`text-sm sm:text-base ${
                paymentStats.currentMonthPayment.status === 'overdue'
                  ? "text-red-900"
                  : isRentDueSoon
                  ? "text-amber-900"
                  : "text-emerald-900"
              }`}>
                {paymentStats.currentMonthPayment.status === 'overdue'
                  ? "Monthly Fee Payment Overdue"
                  : isRentDueSoon
                  ? "Monthly Fee Due Soon"
                  : "Monthly Fee Payment Pending"}
              </AlertTitle>
              <AlertDescription className={`text-xs sm:text-sm ${
                paymentStats.currentMonthPayment.status === 'overdue'
                  ? "text-red-700"
                  : isRentDueSoon
                  ? "text-amber-700"
                  : "text-emerald-700"
              }`}>
                Your monthly fee payment of {formatCurrency(paymentStats.currentMonthPayment.amount)} for {currentMonthName} is {
                  paymentStats.currentMonthPayment.status === 'overdue' ? 'overdue' : 'pending'
                }. Please contact your property manager.
              </AlertDescription>
            </Alert>
          )}

          {paymentStats?.currentMonthPayment?.status === 'paid' && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <AlertTitle className="text-sm sm:text-base text-emerald-900">Monthly Fee Paid</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm text-emerald-700">
                Your monthly fee for {currentMonthName} has been paid. Thank you!
                {paymentStats.currentMonthPayment.payment_date &&
                  ` (Paid on ${formatDate(paymentStats.currentMonthPayment.payment_date)})`
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Stats Grid */}
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Problem Reports Card */}
            <Card
              className="border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]"
              onClick={() => router.push('/tenant/report-problem')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Problem Reports</CardTitle>
                <Wrench className="h-4 w-4 text-blue-600 flex-shrink-0" />
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
              className="border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]"
              onClick={() => router.push('/tenant/complaints')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Complaints</CardTitle>
                <MessageSquare className="h-4 w-4 text-purple-600 flex-shrink-0" />
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
              className="border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98] sm:col-span-2 lg:col-span-1"
              onClick={() => router.push('/tenant/suggestions')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
                <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0" />
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
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Payment History</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Your recent monthly fee payments</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/tenant/payments')}
                    className="self-start sm:self-auto text-xs sm:text-sm"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {payments && payments.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {payments.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm sm:text-base">
                            {new Date(payment.payment_month).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600">
                            {formatCurrency(payment.amount)}
                            {payment.payment_date && ` • Paid ${formatDate(payment.payment_date)}`}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`self-start sm:self-auto text-xs ${
                            payment.status === 'paid'
                              ? "bg-emerald-100 text-emerald-700"
                              : payment.status === 'overdue'
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                    {paymentStats && (
                      <div className="pt-3 border-t">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-slate-600">Total Paid This Year</span>
                          <span className="font-semibold text-emerald-700">
                            {formatCurrency(paymentStats.totalPaid)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-500 text-center py-4">No payment records available</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Problem Reports */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Problem Reports</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Track your maintenance requests</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/tenant/report-problem')}
                    className="self-start sm:self-auto text-xs sm:text-sm"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {reports && reports.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {reports.slice(0, 3).map((report: any) => (
                      <div key={report.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm sm:text-base">
                            {report.problemOption?.title || 'Problem Report'}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600">
                            Submitted {formatDate(report.created_at)}
                            {report.floor && ` • Floor ${report.floor}`}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`self-start sm:self-auto text-xs ${
                            report.status === 'resolved'
                              ? "bg-emerald-100 text-emerald-700"
                              : report.status === 'in_progress'
                              ? "bg-blue-100 text-blue-700"
                              : report.status === 'rejected'
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {report.status === 'in_progress' ? 'In Progress' :
                           report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => router.push('/tenant/report-problem')}
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      Report New Problem
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs sm:text-sm text-slate-500 mb-3">No problem reports yet</p>
                    <Button
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs sm:text-sm h-9 sm:h-10"
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Recent Complaints</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Your submitted complaints</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/tenant/complaints')}
                    className="self-start sm:self-auto text-xs sm:text-sm"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {complaints.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {complaints.slice(0, 3).map((complaint) => (
                      <div key={complaint.id} className="border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
                          <p className="font-medium text-slate-900 flex-1 text-sm sm:text-base">{complaint.title}</p>
                          <Badge
                            variant="secondary"
                            className={`self-start sm:self-auto text-xs ${
                              complaint.status === 'resolved'
                                ? "bg-emerald-100 text-emerald-700"
                                : complaint.status === 'in_progress'
                                ? "bg-blue-100 text-blue-700"
                                : complaint.status === 'rejected'
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {complaint.status === 'in_progress' ? 'In Progress' :
                             complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600">{formatDate(complaint.created_at)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-500 text-center py-4">No complaints submitted</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Suggestions */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Recent Suggestions</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Your improvement ideas</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/tenant/suggestions')}
                    className="self-start sm:self-auto text-xs sm:text-sm"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {suggestions.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {suggestions.slice(0, 3).map((suggestion) => (
                      <div key={suggestion.id} className="border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
                          <p className="font-medium text-slate-900 flex-1 text-sm sm:text-base">{suggestion.title}</p>
                          <Badge
                            variant="secondary"
                            className={`self-start sm:self-auto text-xs ${
                              suggestion.status === 'approved'
                                ? "bg-emerald-100 text-emerald-700"
                                : suggestion.status === 'under_review'
                                ? "bg-blue-100 text-blue-700"
                                : suggestion.status === 'rejected'
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {suggestion.status === 'under_review' ? 'Under Review' :
                             suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600">{formatDate(suggestion.created_at)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-500 text-center py-4">No suggestions submitted</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Reports Section */}
          {monthlyReports.length > 0 && (
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/30 to-white">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">Property Financial Reports</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        View how your rent is allocated • {monthlyReports.length} report{monthlyReports.length !== 1 ? 's' : ''} available
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 self-start sm:self-auto text-xs sm:text-sm h-9 sm:h-10 whitespace-nowrap"
                    onClick={() => router.push('/tenant/monthly-reports')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <Clock className="h-4 w-4 flex-shrink-0" />
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
