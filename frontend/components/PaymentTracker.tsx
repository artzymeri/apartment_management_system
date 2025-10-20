"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  getTenantPayments,
  updatePaymentStatus,
  generateFuturePayments,
  TenantPayment,
} from "@/lib/tenant-payment-api";
import { Calendar, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";

interface PaymentTrackerProps {
  tenantId: number;
  propertyId?: number;
  monthlyRate?: number;
  editable?: boolean;
}

export default function PaymentTracker({
  tenantId,
  propertyId,
  monthlyRate,
  editable = true,
}: PaymentTrackerProps) {
  const [payments, setPayments] = useState<TenantPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<TenantPayment | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<"pending" | "paid" | "overdue">("paid");
  const [notes, setNotes] = useState("");
  const [futureMonthsDialogOpen, setFutureMonthsDialogOpen] = useState(false);
  const [monthsAhead, setMonthsAhead] = useState(12);
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchPayments();
  }, [tenantId, propertyId, yearFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getTenantPayments(tenantId, {
        property_id: propertyId,
        year: yearFilter,
      });
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedPayment) return;

    try {
      await updatePaymentStatus(selectedPayment.id, newStatus, notes);
      toast.success("Payment status updated successfully");
      setStatusDialogOpen(false);
      setSelectedPayment(null);
      setNotes("");
      fetchPayments();
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment status");
    }
  };

  const handleGenerateFuturePayments = async () => {
    if (!propertyId) {
      toast.error("Property ID is required");
      return;
    }

    try {
      await generateFuturePayments(tenantId, propertyId, monthsAhead);
      toast.success(`Generated ${monthsAhead} months of future payment records`);
      setFutureMonthsDialogOpen(false);
      fetchPayments();
    } catch (error: any) {
      console.error("Error generating future payments:", error);
      toast.error(error.message || "Failed to generate future payments");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Overdue
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatMonth = (dateString: string) => {
    // Parse the date string as YYYY-MM-DD and extract year and month
    // This avoids timezone conversion issues
    const [year, month] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, 1); // month is 0-indexed in JS Date
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  const formatAmount = (amount: string) => {
    return `€${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusStats = () => {
    const stats = {
      paid: 0,
      pending: 0,
      overdue: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
    };

    payments.forEach((payment) => {
      const amount = parseFloat(payment.amount);
      if (payment.status === "paid") {
        stats.paid++;
        stats.totalPaid += amount;
      } else if (payment.status === "pending") {
        stats.pending++;
        stats.totalPending += amount;
      } else if (payment.status === "overdue") {
        stats.overdue++;
        stats.totalOverdue += amount;
      }
    });

    return stats;
  };

  const stats = getStatusStats();
  const availableYears = Array.from(
    new Set(payments.map((p) => new Date(p.payment_month).getFullYear()))
  ).sort((a, b) => b - a);

  if (!availableYears.includes(yearFilter)) {
    availableYears.push(yearFilter);
    availableYears.sort((a, b) => b - a);
  }

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-green-600">
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.paid}</div>
            <p className="text-xs text-muted-foreground">
              {formatAmount(stats.totalPaid.toString())}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-yellow-600">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {formatAmount(stats.totalPending.toString())}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-red-600">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              {formatAmount(stats.totalOverdue.toString())}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              Payment History
            </CardTitle>
            <div className="flex gap-2">
              <Select
                value={yearFilter.toString()}
                onValueChange={(value) => setYearFilter(parseInt(value))}
              >
                <SelectTrigger className="w-24 md:w-32 h-9 text-xs md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-xs md:text-sm">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editable && monthlyRate && monthlyRate > 0 && (
                <Button
                  onClick={() => setFutureMonthsDialogOpen(true)}
                  size="sm"
                  variant="outline"
                  className="h-9 text-xs md:text-sm"
                >
                  <Plus className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                  <span className="hidden md:inline">Add Future Payments</span>
                  <span className="md:hidden">Add</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-xs md:text-sm">
              Loading payment history...
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs md:text-sm">
              No payment records found for {yearFilter}
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-3">
                {payments.map((payment) => (
                  <Card key={payment.id} className="border-l-4 border-l-indigo-500">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">
                            {formatMonth(payment.payment_month)}
                          </div>
                          <div className="text-lg font-bold text-indigo-600">
                            {formatAmount(payment.amount)}
                          </div>
                        </div>
                        <div>{getStatusBadge(payment.status)}</div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                        <div>
                          <span className="font-medium">Payment Date:</span>{" "}
                          {payment.payment_date
                            ? new Date(payment.payment_date).toLocaleDateString()
                            : "Not paid"}
                        </div>
                        {editable && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setNewStatus(payment.status);
                              setNotes(payment.notes || "");
                              setStatusDialogOpen(true);
                            }}
                          >
                            Update
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Date</TableHead>
                      {editable && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatMonth(payment.payment_month)}</TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(payment.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          {payment.payment_date
                            ? new Date(payment.payment_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        {editable && (
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setNewStatus(payment.status);
                                setNotes(payment.notes || "");
                                setStatusDialogOpen(true);
                              }}
                            >
                              Update
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Update Payment Status</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Change the payment status for{" "}
              {selectedPayment && formatMonth(selectedPayment.payment_month)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-xs md:text-sm">Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value: any) => setNewStatus(value)}
              >
                <SelectTrigger id="status" className="h-9 md:h-10 text-xs md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid" className="text-xs md:text-sm">Paid</SelectItem>
                  <SelectItem value="pending" className="text-xs md:text-sm">Pending</SelectItem>
                  <SelectItem value="overdue" className="text-xs md:text-sm">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs md:text-sm">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this payment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="text-xs md:text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)} className="h-9 text-xs md:text-sm">
              Cancel
            </Button>
            <Button onClick={handleStatusChange} className="h-9 text-xs md:text-sm">Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Future Payments Dialog */}
      <Dialog
        open={futureMonthsDialogOpen}
        onOpenChange={setFutureMonthsDialogOpen}
      >
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Add Future Payment Records</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Generate payment records in advance for this tenant. This is useful
              when a tenant pays for multiple months upfront.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="months" className="text-xs md:text-sm">Number of Months</Label>
              <Input
                id="months"
                type="number"
                min="1"
                max="24"
                value={monthsAhead}
                onChange={(e) => setMonthsAhead(parseInt(e.target.value))}
                className="h-9 md:h-10 text-xs md:text-sm"
              />
              <p className="text-xs md:text-sm text-muted-foreground">
                This will create payment records for the next {monthsAhead} months
                starting from the current month.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setFutureMonthsDialogOpen(false)}
              className="h-9 text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateFuturePayments} className="h-9 text-xs md:text-sm">Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
