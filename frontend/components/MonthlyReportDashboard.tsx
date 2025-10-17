"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMonthlyReportPreview, useGenerateMonthlyReport } from "@/hooks/useMonthlyReports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Euro,
  TrendingUp,
  Save,
  PieChart,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calculator, Loader2
} from "lucide-react";
import { toast } from "sonner";

interface SpendingAllocation {
  config_id: number;
  config_title: string;
  allocated_amount: number;
  percentage: number;
  description?: string | null;
}

interface MonthlyReportDashboardProps {
  propertyId: number;
  month: number;
  year: number;
}

export function MonthlyReportDashboard({ propertyId, month, year }: MonthlyReportDashboardProps) {
  const [notes, setNotes] = useState("");
  const [spendingAllocations, setSpendingAllocations] = useState<SpendingAllocation[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  // Local input states for editing
  const [editingAmounts, setEditingAmounts] = useState<Record<number, string>>({});
  const [editingPercentages, setEditingPercentages] = useState<Record<number, string>>({});

  const { data: previewData, isLoading: isLoadingPreview, refetch: refetchPreview } = useMonthlyReportPreview({
    propertyId,
    month,
    year,
  });

  const generateMutation = useGenerateMonthlyReport();

  const preview = previewData?.preview;

  // Refetch preview data when filters change
  useEffect(() => {
    if (propertyId && month && year) {
      refetchPreview();
    }
  }, [propertyId, month, year, refetchPreview]);

  // Initialize spending allocations when preview data loads (ONLY ONCE)
  useEffect(() => {
    if (preview?.spending_configs && preview.spending_configs.length > 0 && !isInitialized) {
      const totalBudget = parseFloat(preview.total_budget);
      const equalShare = totalBudget / preview.spending_configs.length;

      const initialAllocations = preview.spending_configs.map((config: any) => ({
        config_id: config.id,
        config_title: config.title,
        allocated_amount: equalShare,
        percentage: (100 / preview.spending_configs.length),
        description: config.description,
      }));

      setSpendingAllocations(initialAllocations);
      setIsInitialized(true);

      // Initialize editing states
      const amounts: Record<number, string> = {};
      const percentages: Record<number, string> = {};
      initialAllocations.forEach(alloc => {
        amounts[alloc.config_id] = alloc.allocated_amount.toFixed(2);
        percentages[alloc.config_id] = alloc.percentage.toFixed(1);
      });
      setEditingAmounts(amounts);
      setEditingPercentages(percentages);
    }
  }, [preview, isInitialized]);

  // Reset initialization when filters change
  useEffect(() => {
    setIsInitialized(false);
    setSpendingAllocations([]);
    setIsEditMode(false);
    setEditingAmounts({});
    setEditingPercentages({});
    setNotes("");
  }, [propertyId, month, year]);

  const handleAmountInputChange = (configId: number, value: string) => {
    // Allow typing freely, including empty string
    setEditingAmounts(prev => ({ ...prev, [configId]: value }));
  };

  const handleAmountBlur = (configId: number) => {
    const value = editingAmounts[configId] || "0";
    const numAmount = parseFloat(value) || 0;
    const totalBudget = parseFloat(preview?.total_budget || "0");
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

    // Update corresponding percentage display
    setEditingPercentages(prev => ({ ...prev, [configId]: newPercentage.toFixed(1) }));
  };

  const handlePercentageInputChange = (configId: number, value: string) => {
    // Allow typing freely, including empty string
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

    const totalBudget = parseFloat(preview?.total_budget || "0");
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

  const handleGenerateReport = async () => {
    if (!preview) return;

    try {
      await generateMutation.mutateAsync({
        propertyId,
        month,
        year,
        notes,
        spendingAllocations,
      });

      toast.success("Monthly report generated successfully!");
      setIsEditMode(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate report");
    }
  };

  const totalAllocated = spendingAllocations.reduce((sum, alloc) => sum + alloc.allocated_amount, 0);
  const totalBudget = parseFloat(preview?.total_budget || "0");
  const remainingBudget = totalBudget - totalAllocated;
  const allocationPercentage = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;

  if (isLoadingPreview) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!preview) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No data available for the selected period. Please ensure tenants have payment records for this month.
        </AlertDescription>
      </Alert>
    );
  }

  const collectionRate = preview.total_tenants > 0
    ? (preview.paid_tenants / preview.total_tenants) * 100
    : 0;

  return (
    <div className="space-y-6 w-full">
      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{parseFloat(preview.total_budget).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {preview.paid_tenants} paid tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {preview.paid_tenants} of {preview.total_tenants} tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">€{parseFloat(preview.pending_amount).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {preview.total_tenants - preview.paid_tenants} unpaid tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spending Categories</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{preview.spending_configs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Budget allocation categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Spending Allocations */}
      {preview.spending_configs && preview.spending_configs.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Budget Allocation</CardTitle>
                <CardDescription>
                  Distribute the collected budget across spending categories
                </CardDescription>
              </div>
              <Button
                variant={isEditMode ? "secondary" : "default"}
                onClick={() => setIsEditMode(!isEditMode)}
                size="sm"
              >
                <Calculator className="mr-2 h-4 w-4" />
                {isEditMode ? "Cancel Edit" : "Edit Allocations"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Allocation Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Allocated</p>
                <p className="text-lg font-bold">€{totalAllocated.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-lg font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  €{Math.abs(remainingBudget).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Allocation %</p>
                <p className="text-lg font-bold">{allocationPercentage.toFixed(1)}%</p>
              </div>
            </div>

            {remainingBudget < -0.01 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Total allocation exceeds available budget by €{Math.abs(remainingBudget).toFixed(2)}
                </AlertDescription>
              </Alert>
            )}

            {/* Allocation Table */}
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: '22%' }}>Category</TableHead>
                    <TableHead style={{ width: '28%' }}>Description</TableHead>
                    <TableHead className="text-right" style={{ width: '18%' }}>Amount (€)</TableHead>
                    <TableHead className="text-right" style={{ width: '14%' }}>Percentage (%)</TableHead>
                    <TableHead className="text-right" style={{ width: '18%' }}>Visual</TableHead>
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
                      'bg-red-500',
                      'bg-teal-500',
                    ];
                    const colorClass = colors[index % colors.length];

                    return (
                      <TableRow key={allocation.config_id}>
                        <TableCell className="font-medium text-sm">{allocation.config_title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]" title={allocation.description || undefined}>
                          {allocation.description || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditMode ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingAmounts[allocation.config_id] || allocation.allocated_amount.toFixed(2)}
                              onChange={(e) => handleAmountInputChange(allocation.config_id, e.target.value)}
                              onBlur={() => handleAmountBlur(allocation.config_id)}
                              className="w-24 ml-auto text-right h-8 text-sm"
                            />
                          ) : (
                            <span className="font-mono text-sm">€{allocation.allocated_amount.toFixed(2)}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditMode ? (
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={editingPercentages[allocation.config_id] || allocation.percentage.toFixed(1)}
                              onChange={(e) => handlePercentageInputChange(allocation.config_id, e.target.value)}
                              onBlur={() => handlePercentageBlur(allocation.config_id)}
                              className="w-16 ml-auto text-right h-8 text-sm"
                            />
                          ) : (
                            <span className="font-mono text-sm">{allocation.percentage.toFixed(1)}%</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2 min-w-[80px]">
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
            </div>

            {/* Visual Budget Breakdown */}
            <div className="space-y-2">
              <h4 className="font-medium">Budget Distribution</h4>
              <div className="flex w-full h-12 rounded-lg overflow-hidden border">
                {spendingAllocations.map((allocation, index) => {
                  const colors = [
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-yellow-500',
                    'bg-purple-500',
                    'bg-pink-500',
                    'bg-indigo-500',
                    'bg-red-500',
                    'bg-teal-500',
                  ];
                  return (
                    <div
                      key={allocation.config_id}
                      className={`${colors[index % colors.length]} flex items-center justify-center text-white text-xs font-medium`}
                      style={{ width: `${allocation.percentage}%` }}
                      title={`${allocation.config_title}: €${allocation.allocated_amount.toFixed(2)}`}
                    >
                      {allocation.percentage > 10 && `${allocation.percentage.toFixed(0)}%`}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                {spendingAllocations.map((allocation, index) => {
                  const colors = [
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-yellow-500',
                    'bg-purple-500',
                    'bg-pink-500',
                    'bg-indigo-500',
                    'bg-red-500',
                    'bg-teal-500',
                  ];
                  return (
                    <div key={allocation.config_id} className="flex items-center gap-2 text-sm">
                      <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`} />
                      <span>{allocation.config_title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Details */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Breakdown of tenant payments for this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: '18%' }}>Tenant</TableHead>
                  <TableHead style={{ width: '24%' }}>Email</TableHead>
                  <TableHead style={{ width: '10%' }}>Floor</TableHead>
                  <TableHead style={{ width: '14%' }}>Amount</TableHead>
                  <TableHead style={{ width: '18%' }}>Status</TableHead>
                  <TableHead style={{ width: '16%' }}>Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.payments && preview.payments.length > 0 ? (
                  preview.payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium text-sm">
                        {payment.tenant.name} {payment.tenant.surname}
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[200px]" title={payment.tenant.email}>
                        {payment.tenant.email}
                      </TableCell>
                      <TableCell className="text-sm">{payment.tenant.floor_assigned || "—"}</TableCell>
                      <TableCell className="font-mono text-sm">€{parseFloat(payment.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        {payment.status === 'paid' && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Paid
                          </Badge>
                        )}
                        {payment.status === 'pending' && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                        {payment.status === 'overdue' && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Overdue
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {payment.payment_date || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No payment records found for this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Report Notes</CardTitle>
          <CardDescription>Add any additional notes or comments for this report</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter notes about this month's report, special circumstances, maintenance items, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Generate Report Button */}
      <div className="flex justify-end gap-3">
        <Button
          size="lg"
          onClick={handleGenerateReport}
          disabled={generateMutation.isPending || remainingBudget < -0.01}
        >
          <Save className="mr-2 h-5 w-5" />
          {generateMutation.isPending ? "Generating..." : "Generate & Save Report"}
        </Button>
      </div>
    </div>
  );
}
