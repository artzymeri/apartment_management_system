"use client";

import { useState, useEffect } from "react";
import { useUpdateMonthlyReport } from "@/hooks/useMonthlyReports";
import { MonthlyReport, SpendingBreakdown } from "@/lib/monthly-report-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface EditReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: MonthlyReport | null;
}

export function EditReportModal({ open, onOpenChange, report }: EditReportModalProps) {
  const [notes, setNotes] = useState("");
  const [spendingAllocations, setSpendingAllocations] = useState<SpendingBreakdown[]>([]);
  const [editingAmounts, setEditingAmounts] = useState<Record<number, string>>({});
  const [editingPercentages, setEditingPercentages] = useState<Record<number, string>>({});

  const updateMutation = useUpdateMonthlyReport();

  // Initialize state when report changes
  useEffect(() => {
    if (report && open) {
      setNotes(report.notes || "");
      setSpendingAllocations(report.spending_breakdown || []);

      // Initialize editing states
      const amounts: Record<number, string> = {};
      const percentages: Record<number, string> = {};
      (report.spending_breakdown || []).forEach(alloc => {
        amounts[alloc.config_id] = alloc.allocated_amount.toFixed(2);
        percentages[alloc.config_id] = alloc.percentage.toFixed(1);
      });
      setEditingAmounts(amounts);
      setEditingPercentages(percentages);
    }
  }, [report, open]);

  if (!report) return null;

  const totalBudget = parseFloat(report.total_budget);

  const handleAmountInputChange = (configId: number, value: string) => {
    setEditingAmounts(prev => ({ ...prev, [configId]: value }));
  };

  const handleAmountBlur = (configId: number) => {
    const value = editingAmounts[configId] || "0";
    const numAmount = parseFloat(value) || 0;
    const newPercentage = totalBudget > 0 ? (numAmount / totalBudget) * 100 : 0;

    // Calculate what the total percentage would be with this change
    const otherAllocationsTotal = spendingAllocations
      .filter(alloc => alloc.config_id !== configId)
      .reduce((sum, alloc) => sum + alloc.percentage, 0);

    const totalPercentage = otherAllocationsTotal + newPercentage;

    // Check if it would exceed 100%
    if (totalPercentage > 100) {
      toast.error(`Cannot allocate €${numAmount.toFixed(2)}. Total allocation would be ${totalPercentage.toFixed(1)}%, which exceeds 100%.`);

      // Revert to previous value
      const currentAllocation = spendingAllocations.find(a => a.config_id === configId);
      if (currentAllocation) {
        setEditingAmounts(prev => ({
          ...prev,
          [configId]: currentAllocation.allocated_amount.toFixed(2)
        }));
      }
      return;
    }

    // Update the actual allocation
    setSpendingAllocations(prev =>
      prev.map(alloc =>
        alloc.config_id === configId
          ? {
              ...alloc,
              allocated_amount: numAmount,
              percentage: newPercentage
            }
          : alloc
      )
    );

    // Update the editing state with formatted value
    setEditingAmounts(prev => ({ ...prev, [configId]: numAmount.toFixed(2) }));
    setEditingPercentages(prev => ({ ...prev, [configId]: newPercentage.toFixed(1) }));
  };

  const handlePercentageInputChange = (configId: number, value: string) => {
    setEditingPercentages(prev => ({ ...prev, [configId]: value }));
  };

  const handlePercentageBlur = (configId: number) => {
    const value = editingPercentages[configId] || "0";
    const numPercentage = parseFloat(value) || 0;

    // Calculate what the total percentage would be with this change
    const otherAllocationsTotal = spendingAllocations
      .filter(alloc => alloc.config_id !== configId)
      .reduce((sum, alloc) => sum + alloc.percentage, 0);

    const totalPercentage = otherAllocationsTotal + numPercentage;

    // Check if it would exceed 100%
    if (totalPercentage > 100) {
      toast.error(`Cannot allocate ${numPercentage.toFixed(1)}%. Total allocation would be ${totalPercentage.toFixed(1)}%, which exceeds 100%.`);

      // Revert to previous value
      const currentAllocation = spendingAllocations.find(a => a.config_id === configId);
      if (currentAllocation) {
        setEditingPercentages(prev => ({
          ...prev,
          [configId]: currentAllocation.percentage.toFixed(1)
        }));
      }
      return;
    }

    const amount = (totalBudget * numPercentage) / 100;

    // Update the actual allocation
    setSpendingAllocations(prev =>
      prev.map(alloc =>
        alloc.config_id === configId
          ? {
              ...alloc,
              allocated_amount: amount,
              percentage: numPercentage
            }
          : alloc
      )
    );

    // Update the editing states with formatted values
    setEditingPercentages(prev => ({ ...prev, [configId]: numPercentage.toFixed(1) }));
    setEditingAmounts(prev => ({ ...prev, [configId]: amount.toFixed(2) }));
  };

  const handleSave = async () => {
    const totalAllocated = spendingAllocations.reduce((sum, alloc) => sum + alloc.allocated_amount, 0);

    // Check if allocations equal budget (allow small rounding differences)
    if (Math.abs(totalAllocated - totalBudget) > 0.01) {
      toast.error(`Total allocated (€${totalAllocated.toFixed(2)}) must equal the budget (€${totalBudget.toFixed(2)})`);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        reportId: report.id,
        data: {
          notes,
          spendingAllocations: spendingAllocations.map(alloc => ({
            config_id: alloc.config_id,
            config_title: alloc.config_title,
            allocated_amount: alloc.allocated_amount,
            percentage: alloc.percentage,
            description: alloc.description
          }))
        }
      });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const totalAllocated = spendingAllocations.reduce((sum, alloc) => sum + alloc.allocated_amount, 0);
  const remainingBudget = totalBudget - totalAllocated;

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Monthly Report</DialogTitle>
          <DialogDescription className="text-base">
            {report.property?.name} - {getMonthName(report.report_month)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Budget Allocation */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocation</CardTitle>
              <CardDescription>Adjust spending across categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Allocation Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-lg font-bold">€{totalBudget.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Allocated</p>
                  <p className="text-lg font-bold">€{totalAllocated.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={`text-lg font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    €{Math.abs(remainingBudget).toFixed(2)}
                  </p>
                </div>
              </div>

              {Math.abs(remainingBudget) > 0.01 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {remainingBudget > 0
                      ? `You still need to allocate €${remainingBudget.toFixed(2)}`
                      : `Total allocation exceeds budget by €${Math.abs(remainingBudget).toFixed(2)}`
                    }
                  </AlertDescription>
                </Alert>
              )}

              {/* Allocation Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount (€)</TableHead>
                    <TableHead className="text-right">Percentage (%)</TableHead>
                    <TableHead className="text-right">Visual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spendingAllocations.map((allocation, index) => {
                    const colors = [
                      'bg-blue-500',
                      'bg-green-500',
                      'bg-yellow-500',
                      'bg-purple-500',
                      'bg-pink-500',
                      'bg-indigo-500',
                    ];
                    const colorClass = colors[index % colors.length];

                    return (
                      <TableRow key={allocation.config_id}>
                        <TableCell className="font-medium">{allocation.config_title}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editingAmounts[allocation.config_id] || allocation.allocated_amount.toFixed(2)}
                            onChange={(e) => handleAmountInputChange(allocation.config_id, e.target.value)}
                            onBlur={() => handleAmountBlur(allocation.config_id)}
                            className="w-28 ml-auto text-right"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={editingPercentages[allocation.config_id] || allocation.percentage.toFixed(1)}
                            onChange={(e) => handlePercentageInputChange(allocation.config_id, e.target.value)}
                            onBlur={() => handlePercentageBlur(allocation.config_id)}
                            className="w-20 ml-auto text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${colorClass} h-2 rounded-full transition-all`}
                              style={{ width: `${Math.min(allocation.percentage, 100)}%` }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Report Notes</CardTitle>
              <CardDescription>Add or update notes for this report</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter notes about this month's report..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending || Math.abs(remainingBudget) > 0.01}
            >
              <Save className="mr-2 h-4 w-4" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
