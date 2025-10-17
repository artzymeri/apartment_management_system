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
    const date = new Date(dateString);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paid}</div>
            <p className="text-xs text-muted-foreground">
              {formatAmount(stats.totalPaid.toString())}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {formatAmount(stats.totalPending.toString())}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              {formatAmount(stats.totalOverdue.toString())}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Payment History
            </CardTitle>
            <div className="flex gap-2">
              <Select
                value={yearFilter.toString()}
                onValueChange={(value) => setYearFilter(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
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
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Future Payments
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading payment history...
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment records found for {yearFilter}
            </div>
          ) : (
            <div className="overflow-x-auto">
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
          )}
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Change the payment status for{" "}
              {selectedPayment && formatMonth(selectedPayment.payment_month)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value: any) => setNewStatus(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this payment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Future Payments Dialog */}
      <Dialog
        open={futureMonthsDialogOpen}
        onOpenChange={setFutureMonthsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Future Payment Records</DialogTitle>
            <DialogDescription>
              Generate payment records in advance for this tenant. This is useful
              when a tenant pays for multiple months upfront.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="months">Number of Months</Label>
              <Input
                id="months"
                type="number"
                min="1"
                max="24"
                value={monthsAhead}
                onChange={(e) => setMonthsAhead(parseInt(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                This will create payment records for the next {monthsAhead} months
                starting from the current month.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFutureMonthsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateFuturePayments}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

