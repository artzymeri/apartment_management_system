"use client";

import { useState } from "react";
import { usePropertyReports, useDeleteMonthlyReport } from "@/hooks/useMonthlyReports";
import { MonthlyReport } from "@/lib/monthly-report-api";
import { EditReportModal } from "@/components/EditReportModal";
import { generateMonthlyReportPDF } from "@/lib/pdf-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, Trash2, Building2, Loader2, TrendingUp, Download, Edit } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface MonthlyReportsListProps {
  propertyId: number;
  year: number;
}

export function MonthlyReportsList({ propertyId, year }: MonthlyReportsListProps) {
  const { data: reportsData, isLoading } = usePropertyReports(propertyId, { year });
  const deleteMutation = useDeleteMonthlyReport();
  const [deleteReportId, setDeleteReportId] = useState<number | null>(null);
  const [editingReport, setEditingReport] = useState<MonthlyReport | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [downloadingReportId, setDownloadingReportId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 md:py-12">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const reports = reportsData?.reports || [];

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
          <FileText className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
          <p className="text-base md:text-lg font-medium text-muted-foreground">Nuk u gjetën raporte</p>
          <p className="text-xs md:text-sm text-muted-foreground">Nuk ka raporte të gjeneruara për këtë pronë në {year}</p>
        </CardContent>
      </Card>
    );
  }

  // Sort reports by month descending (newest first)
  const sortedReports = [...reports].sort((a, b) =>
    new Date(b.report_month).getTime() - new Date(a.report_month).getTime()
  );

  const handleDelete = async () => {
    if (deleteReportId) {
      try {
        await deleteMutation.mutateAsync(deleteReportId);
        setDeleteReportId(null);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleEdit = (report: MonthlyReport) => {
    setEditingReport(report);
    setIsEditModalOpen(true);
  };

  const handleDownload = async (report: MonthlyReport) => {
    try {
      setDownloadingReportId(report.id);
      toast.info("Duke gjeneruar PDF...");

      // Generate PDF with just the report data (no tenant payment details)
      await generateMonthlyReportPDF(report);

      toast.success("PDF u shkarkua me sukses!");
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast.error(error.message || "Dështoi gjenerimi i PDF");
    } finally {
      setDownloadingReportId(null);
    }
  };

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMMM yyyy");
  };

  const collectionRate = (report: MonthlyReport) => {
    return report.total_tenants > 0
      ? ((report.paid_tenants / report.total_tenants) * 100).toFixed(1)
      : "0";
  };

  return (
    <>
      <div className="space-y-3 md:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {sortedReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base md:text-lg">{getMonthName(report.report_month)}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>{report.paid_tenants} nga {report.total_tenants} banorë kanë paguar ({collectionRate(report)}%)</span>
                    </CardDescription>
                  </div>
                  {report.property && (
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit text-xs">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">{report.property.name}</span>
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Buxheti Total</p>
                    <p className="font-semibold text-sm md:text-base">€{parseFloat(report.total_budget).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Në pritje</p>
                    <p className="font-semibold text-sm md:text-base text-orange-600">€{parseFloat(report.pending_amount).toFixed(2)}</p>
                  </div>
                </div>

                {report.spending_breakdown && report.spending_breakdown.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Alokimi i Buxhetit</p>
                    <div className="space-y-1">
                      {report.spending_breakdown.slice(0, 2).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs gap-2">
                          <span className="truncate flex-1">{item.config_title}</span>
                          <span className="font-medium whitespace-nowrap">€{parseFloat(item.allocated_amount).toFixed(2)}</span>
                        </div>
                      ))}
                      {report.spending_breakdown.length > 2 && (
                        <p className="text-xs text-muted-foreground italic">
                          +{report.spending_breakdown.length - 2} më shumë...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => handleDownload(report)}
                    disabled={downloadingReportId === report.id}
                  >
                    {downloadingReportId === report.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        <span className="hidden sm:inline">Duke gjeneruar...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Shkarko</span>
                        <span className="sm:hidden">PDF</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => handleEdit(report)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setDeleteReportId(report.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Report Modal */}
      <EditReportModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        report={editingReport}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteReportId !== null} onOpenChange={(open) => !open && setDeleteReportId(null)}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base md:text-lg">Fshi Raportin</AlertDialogTitle>
            <AlertDialogDescription className="text-xs md:text-sm">
              A jeni të sigurt që dëshironi të fshini këtë raport mujor? Ky veprim nuk mund të zhbëhet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="h-9 text-xs md:text-sm">Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 text-xs md:text-sm">
              Fshi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
