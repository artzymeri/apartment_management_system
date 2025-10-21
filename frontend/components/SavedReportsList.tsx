"use client";

import { useState } from "react";
import { useAllMyReports, useDeleteMonthlyReport } from "@/hooks/useMonthlyReports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Eye, Trash2, FileText, Calendar, Loader2} from "lucide-react";
import { formatMonthYear } from "@/lib/utils";

interface SavedReportsListProps {
  propertyId?: number;
}

export function SavedReportsList({ propertyId }: SavedReportsListProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const { data: reportsData, isLoading } = useAllMyReports({ year: selectedYear });
  const deleteMutation = useDeleteMonthlyReport();

  const reports = reportsData?.reports || [];
  const filteredReports = propertyId
    ? reports.filter(r => r.property_id === propertyId)
    : reports;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleDelete = async () => {
    if (!reportToDelete) return;

    try {
      await deleteMutation.mutateAsync(reportToDelete);
      setReportToDelete(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const calculateBudgetUtilization = (report: any) => {
    if (!report.spending_breakdown || report.spending_breakdown.length === 0) {
      return 0;
    }
    const totalAllocated = report.spending_breakdown.reduce(
      (sum: number, item: any) => sum + parseFloat(item.allocated_amount || 0),
      0
    );
    const budget = parseFloat(report.total_budget);
    return budget > 0 ? (totalAllocated / budget) * 100 : 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>View and manage previously generated monthly reports</CardDescription>
            </div>
            <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
              <SelectTrigger className="w-32">
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
          </div>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No reports found</p>
              <p className="text-sm text-muted-foreground">Generate your first monthly report to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Tenants</TableHead>
                  <TableHead>Collection Rate</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  const collectionRate = report.total_tenants > 0
                    ? (report.paid_tenants / report.total_tenants) * 100
                    : 0;
                  const utilization = calculateBudgetUtilization(report);

                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.property?.name || `Property #${report.property_id}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatMonthYear(new Date(report.report_month))}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        ${parseFloat(report.total_budget).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{report.paid_tenants}</span>
                        <span className="text-muted-foreground">/{report.total_tenants}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            collectionRate >= 90
                              ? "bg-green-100 text-green-800"
                              : collectionRate >= 70
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {collectionRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {utilization.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString('sq-AL')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReportToDelete(report.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!reportToDelete} onOpenChange={() => setReportToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              {selectedReport?.property?.name} - {selectedReport && formatMonthYear(new Date(selectedReport.report_month))}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">${parseFloat(selectedReport.total_budget).toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${parseFloat(selectedReport.pending_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Spending Breakdown */}
              {selectedReport.spending_breakdown && selectedReport.spending_breakdown.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Budget Allocation</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReport.spending_breakdown.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.config_title}</TableCell>
                          <TableCell className="text-right font-mono">
                            ${parseFloat(item.allocated_amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {parseFloat(item.percentage).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Notes */}
              {selectedReport.notes && (
                <div className="space-y-2">
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                    {selectedReport.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
