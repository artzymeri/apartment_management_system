"use client";

import { TenantLayout } from "@/components/layouts/TenantLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Calendar, Euro, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import { useTenantPropertyReports } from "@/hooks/useMonthlyReports";
import { generateMonthlyReportPDF } from "@/lib/pdf-generator";
import { useState, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function TenantMonthlyReportsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [downloadingReportId, setDownloadingReportId] = useState<number | null>(null);

  const { data, isLoading, error } = useTenantPropertyReports({ year: selectedYear });

  const reports = data?.reports || [];

  // Generate year options (current year and past 5 years)
  const yearOptions = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  }, [currentYear]);

  const handleDownloadReport = async (report: any) => {
    try {
      setDownloadingReportId(report.id);
      toast.info("Generating PDF...");

      // Generate PDF using the same function as Property Manager
      await generateMonthlyReportPDF(report);

      toast.success("PDF downloaded successfully!");
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast.error(error.message || "Failed to generate PDF");
    } finally {
      setDownloadingReportId(null);
    }
  };

  const formatMonth = (reportMonth: string) => {
    const date = new Date(reportMonth);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(parseFloat(amount));
  };

  return (
    <ProtectedRoute allowedRoles={['tenant']}>
      <TenantLayout title="Monthly Reports">
        <div className="space-y-6">
          {/* Info Alert and Year Filter on Same Line */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <Alert className="border-emerald-200 bg-emerald-50 flex-1">
              <FileText className="h-4 w-4 text-emerald-600" />
              <AlertTitle className="text-emerald-900">About Monthly Reports</AlertTitle>
              <AlertDescription className="text-emerald-700">
                Monthly reports show how collected rent payments are allocated across various property expenses and maintenance categories.
              </AlertDescription>
            </Alert>

            {/* Year Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Calendar className="h-5 w-5 text-slate-500" />
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to load reports'}
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!isLoading && !error && reports.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Reports Available
                </h3>
                <p className="text-slate-600 text-center max-w-md">
                  There are no monthly reports available for {selectedYear}. Reports are generated by the property manager.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Reports Grid */}
          {!isLoading && !error && reports.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow bg-gradient-to-br from-emerald-50 to-white">
                  <CardHeader className="border-b border-slate-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl text-emerald-700">
                          {formatMonth(report.report_month)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {report.property?.name || 'Property Report'}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        <FileText className="h-3 w-3 mr-1" />
                        Report
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Budget Summary */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-slate-700">Total Budget</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-700">
                          {formatCurrency(report.total_budget)}
                        </span>
                      </div>

                      {parseFloat(report.pending_amount) > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-slate-700">Pending</span>
                          </div>
                          <span className="text-sm font-semibold text-amber-600">
                            {formatCurrency(report.pending_amount)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Spending Breakdown */}
                    {report.spending_breakdown && report.spending_breakdown.length > 0 && (
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-700">Budget Allocation</span>
                        </div>
                        <div className="space-y-2">
                          {report.spending_breakdown.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-xs">
                              <span className="text-slate-600 truncate flex-1">{item.config_title}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500">{item.percentage}%</span>
                                <span className="font-semibold text-slate-900">
                                  {formatCurrency(item.allocated_amount.toString())}
                                </span>
                              </div>
                            </div>
                          ))}
                          {report.spending_breakdown.length > 3 && (
                            <p className="text-xs text-slate-500 italic">
                              +{report.spending_breakdown.length - 3} more categories
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {report.notes && (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-600">
                          <span className="font-medium">Notes: </span>
                          {report.notes}
                        </p>
                      </div>
                    )}

                    {/* Download Button */}
                    <Button
                      onClick={() => handleDownloadReport(report)}
                      disabled={downloadingReportId === report.id}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {downloadingReportId === report.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </TenantLayout>
    </ProtectedRoute>
  );
}
