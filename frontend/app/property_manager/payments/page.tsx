"use client";

import { useState, useEffect } from "react";
import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getPropertyManagerPayments,
  getPaymentStatistics,
  updatePaymentStatus,
  bulkUpdatePayments,
  ensurePaymentRecords,
  updatePaymentDate,
  TenantPayment,
  PaymentStatistics,
} from "@/lib/tenant-payment-api";
import { useProperties } from "@/hooks/useProperties";
import { userAPI } from "@/lib/user-api";
import { Calendar as CalendarIcon, Euro, TrendingUp, AlertCircle, CheckCircle, Clock, Plus, Users, Edit } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<TenantPayment[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDialogProperty, setSelectedDialogProperty] = useState<string>("");
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantIds, setSelectedTenantIds] = useState<number[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [existingPayments, setExistingPayments] = useState<TenantPayment[]>([]);

  // Edit payment date dialog state
  const [isEditDateDialogOpen, setIsEditDateDialogOpen] = useState(false);
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState<TenantPayment | null>(null);
  const [editPaymentDate, setEditPaymentDate] = useState<Date | undefined>(undefined);
  const [editDateLoading, setEditDateLoading] = useState(false);

  const { data: propertiesData } = useProperties({ myProperties: true });
  const properties = propertiesData?.data || [];

  useEffect(() => {
    fetchData();
  }, [selectedProperty, selectedStatus, selectedYear]);

  // Fetch existing payments when month or property changes in dialog
  useEffect(() => {
    if (selectedMonth && selectedDialogProperty) {
      fetchExistingPaymentsForMonth();
    }
  }, [selectedMonth, selectedDialogProperty, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const filters: any = { year: selectedYear };
      if (selectedProperty !== "all") {
        filters.property_id = parseInt(selectedProperty);
      }
      if (selectedStatus !== "all") {
        filters.status = selectedStatus;
      }

      const [paymentsData, statsData] = await Promise.all([
        getPropertyManagerPayments(filters),
        getPaymentStatistics(
          selectedProperty !== "all" ? { property_id: parseInt(selectedProperty), year: selectedYear } : { year: selectedYear }
        ),
      ]);

      setPayments(paymentsData);
      setStatistics(statsData);
    } catch (error) {
      console.error("Error fetching payment data:", error);
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantsForProperty = async (propertyId: string) => {
    if (!propertyId) return;

    try {
      setTenantsLoading(true);
      // Use the property manager tenants endpoint with property filter
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/tenants?property_id=${propertyId}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }

      const data = await response.json();
      setTenants(data.data || []);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      toast.error("Failed to load tenants");
    } finally {
      setTenantsLoading(false);
    }
  };

  const fetchExistingPaymentsForMonth = async () => {
    if (!selectedMonth || !selectedDialogProperty) return;

    try {
      setDialogLoading(true);

      const propertyId = parseInt(selectedDialogProperty);
      const monthIndex = parseInt(selectedMonth); // This is 0-indexed (0-11)
      const month = monthIndex + 1; // Convert to 1-indexed (1-12) for the API
      const year = selectedYear;

      console.log('Fetching existing payments for:', { propertyId, month, year, monthName: getMonthName(monthIndex) });

      // Fetch existing payments for the selected month and property
      const paymentsData = await getPropertyManagerPayments({
        property_id: propertyId,
        month: month, // Send 1-indexed month to API
        year: year,
      });

      console.log('Existing payments found:', paymentsData);

      setExistingPayments(paymentsData);

      // Clear any previously selected tenant IDs that have already paid
      setSelectedTenantIds(prevSelected =>
        prevSelected.filter(id => !paymentsData.some(p => p.tenant_id === id && p.status === 'paid'))
      );
    } catch (error) {
      console.error("Error fetching existing payments:", error);
      toast.error("Failed to load existing payments");
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDialogPropertyChange = (propertyId: string) => {
    setSelectedDialogProperty(propertyId);
    setSelectedTenantIds([]);
    setTenants([]);

    if (propertyId) {
      fetchTenantsForProperty(propertyId);
    }
  };

  const handleTenantToggle = (tenantId: number) => {
    setSelectedTenantIds(prev =>
      prev.includes(tenantId)
        ? prev.filter(id => id !== tenantId)
        : [...prev, tenantId]
    );
  };

  const handleSelectAllTenants = () => {
    if (selectedTenantIds.length === tenants.length) {
      setSelectedTenantIds([]);
    } else {
      setSelectedTenantIds(tenants.map(t => t.id));
    }
  };

  const handleBulkMarkAsPaid = async () => {
    if (!selectedMonth || !selectedDialogProperty || selectedTenantIds.length === 0) {
      toast.error("Please select month, property, and at least one tenant");
      return;
    }

    try {
      setDialogLoading(true);

      const selectedMonthNum = parseInt(selectedMonth);
      const propertyId = parseInt(selectedDialogProperty);

      // Step 1: Ensure payment records exist for all selected tenants
      console.log('Ensuring payment records exist...');
      console.log('Tenant IDs:', selectedTenantIds);
      console.log('Property ID:', propertyId);
      console.log('Month:', selectedMonthNum, 'Year:', selectedYear);

      const ensureResult = await ensurePaymentRecords(
        selectedTenantIds,
        propertyId,
        selectedYear,
        selectedMonthNum
      );

      console.log('Ensure records result:', ensureResult);

      // Check if there were any errors
      if (ensureResult.errors && ensureResult.errors.length > 0) {
        console.error('Errors creating payment records:', ensureResult.errors);

        // Show specific errors
        ensureResult.errors.forEach(err => {
          toast.error(`Tenant ${err.tenant_id}: ${err.error}`);
        });
      }

      if (ensureResult.new_records > 0) {
        toast.success(`Created ${ensureResult.new_records} new payment record(s)`);
      }

      // Step 2: Get the payment IDs that were created/found
      const paymentIds = ensureResult.payments.map(p => p.id);

      console.log('Payment IDs to mark as paid:', paymentIds);

      if (paymentIds.length === 0) {
        toast.error(`Could not create payment records. Check console for details.`);
        return;
      }

      // Step 3: Mark all payments as paid
      await bulkUpdatePayments(paymentIds, "paid");

      toast.success(`Successfully marked ${paymentIds.length} payment(s) as paid!`);

      // Reset dialog state
      setIsDialogOpen(false);
      setSelectedMonth("");
      setSelectedDialogProperty("");
      setSelectedTenantIds([]);
      setTenants([]);

      // Refresh data
      fetchData();
    } catch (error: any) {
      console.error("Error marking payments:", error);
      toast.error(error.message || "Failed to mark payments as paid");
    } finally {
      setDialogLoading(false);
    }
  };

  const handleQuickStatusUpdate = async (paymentId: number, newStatus: "pending" | "paid" | "overdue") => {
    try {
      await updatePaymentStatus(paymentId, newStatus);
      toast.success("Payment status updated");
      fetchData();
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Failed to update payment");
    }
  };

  const handleEditPaymentDate = async () => {
    if (!selectedPaymentForEdit || !editPaymentDate) return;

    try {
      setEditDateLoading(true);

      // Update the payment date
      await updatePaymentDate(selectedPaymentForEdit.id, format(editPaymentDate, 'yyyy-MM-dd'));

      toast.success("Payment date updated");

      // Refresh payments data
      fetchData();
    } catch (error) {
      console.error("Error updating payment date:", error);
      toast.error("Failed to update payment date");
    } finally {
      setEditDateLoading(false);
      setIsEditDateDialogOpen(false);
      setSelectedPaymentForEdit(null);
      setEditPaymentDate(undefined);
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

  const formatAmount = (amount: string | number) => {
    return `€${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const getMonthName = (monthIndex: number) => {
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    return months[monthIndex];
  };

  // Group payments by month
  const groupPaymentsByMonth = () => {
    const grouped: { [key: number]: TenantPayment[] } = {};

    // Initialize all 12 months with empty arrays
    for (let i = 0; i < 12; i++) {
      grouped[i] = [];
    }

    // Group payments by month
    payments.forEach((payment) => {
      // Parse the date string as YYYY-MM-DD and extract month
      // This avoids timezone conversion issues
      const [year, month] = payment.payment_month.split('-').map(Number);
      const monthIndex = month - 1; // Convert to 0-indexed (0-11)
      grouped[monthIndex].push(payment);
    });

    return grouped;
  };

  const getMonthStatistics = (monthPayments: TenantPayment[]) => {
    const total = monthPayments.length;
    const paid = monthPayments.filter(p => p.status === 'paid').length;
    const pending = monthPayments.filter(p => p.status === 'pending').length;
    const overdue = monthPayments.filter(p => p.status === 'overdue').length;

    const totalAmount = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    const paidAmount = monthPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    const pendingAmount = monthPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    const overdueAmount = monthPayments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

    return {
      total,
      paid,
      pending,
      overdue,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount
    };
  };

  const groupedPayments = groupPaymentsByMonth();

  // Generate dynamic year list - current year and 2 years back
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 3; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  return (
    <ProtectedRoute allowedRoles={["property_manager"]}>
      <PropertyManagerLayout title="Payment Management">
        <div className="space-y-6">
          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Euro className="w-4 h-4" />
                    Total Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatAmount(statistics.totalAmount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Paid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{statistics.paid}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatAmount(statistics.paidAmount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-600">
                    <Clock className="w-4 h-4" />
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatAmount(statistics.pendingAmount)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Overdue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{statistics.overdue}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatAmount(statistics.overdueAmount)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Payment History
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Mark Payments
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Mark Tenant Payments as Paid
                        </DialogTitle>
                        <DialogDescription>
                          Select a month, property, and tenants who have completed their payment
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        {/* Month Selection */}
                        <div className="space-y-2">
                          <Label>Payment Month</Label>
                          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  {getMonthName(i)} {selectedYear}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Property Selection */}
                        <div className="space-y-2">
                          <Label>Property</Label>
                          <Select
                            value={selectedDialogProperty}
                            onValueChange={handleDialogPropertyChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                            <SelectContent>
                              {properties.map((property: any) => (
                                <SelectItem key={property.id} value={property.id.toString()}>
                                  {property.name} - {property.address}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Tenant Selection */}
                        {selectedDialogProperty && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Select Tenants Who Paid</Label>
                              {tenants.length > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleSelectAllTenants}
                                >
                                  {selectedTenantIds.length === tenants.length ? "Deselect All" : "Select All"}
                                </Button>
                              )}
                            </div>

                            {tenantsLoading ? (
                              <div className="text-center py-8 text-muted-foreground">
                                Loading tenants...
                              </div>
                            ) : tenants.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                No tenants found for this property
                              </div>
                            ) : (
                              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                                {tenants.map((tenant) => {
                                  const hasMonthlyRate = tenant.monthly_rate && tenant.monthly_rate > 0;

                                  // Check if this tenant has already paid for the selected month
                                  const alreadyPaid = existingPayments.some(
                                    payment => payment.tenant_id === tenant.id && payment.status === 'paid'
                                  );

                                  const isDisabled = !hasMonthlyRate || alreadyPaid;

                                  return (
                                    <div
                                      key={tenant.id}
                                      className={`flex items-center space-x-3 p-3 ${
                                        isDisabled 
                                          ? 'opacity-50 cursor-not-allowed bg-muted/30' 
                                          : 'hover:bg-muted/50 cursor-pointer'
                                      }`}
                                      onClick={() => !isDisabled && handleTenantToggle(tenant.id)}
                                    >
                                      <Checkbox
                                        checked={selectedTenantIds.includes(tenant.id)}
                                        onCheckedChange={() => !isDisabled && handleTenantToggle(tenant.id)}
                                        disabled={isDisabled}
                                      />
                                      <div className="flex-1">
                                        <div className="font-medium">
                                          {tenant.name} {tenant.surname}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {tenant.email}
                                        </div>
                                        {!hasMonthlyRate ? (
                                          <div className="text-xs text-red-500 font-medium">
                                            ⚠ No monthly rate set
                                          </div>
                                        ) : alreadyPaid ? (
                                          <div className="text-xs text-green-600 font-medium">
                                            ✓ Already paid for {selectedMonth && getMonthName(parseInt(selectedMonth))}
                                          </div>
                                        ) : (
                                          <div className="text-xs text-muted-foreground">
                                            Monthly Rate: {formatAmount(tenant.monthly_rate)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Summary */}
                        {selectedTenantIds.length > 0 && (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium">
                              Selected: {selectedTenantIds.length} tenant(s)
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {selectedMonth && `For ${getMonthName(parseInt(selectedMonth))} ${selectedYear}`}
                            </p>
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          disabled={dialogLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleBulkMarkAsPaid}
                          disabled={dialogLoading || !selectedMonth || !selectedDialogProperty || selectedTenantIds.length === 0}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {dialogLoading ? "Processing..." : `Mark ${selectedTenantIds.length} as Paid`}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableYears().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map((property: any) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading payments...
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Accordion for each month */}
                  <Accordion type="multiple" className="w-full">
                    {Object.entries(groupedPayments)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([monthIndex, monthPayments]) => {
                        const monthStats = getMonthStatistics(monthPayments);
                        const hasPayments = monthPayments.length > 0;

                        return (
                          <AccordionItem key={monthIndex} value={monthIndex}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex flex-1 justify-between items-center pr-4">
                                <div className="flex items-center gap-4">
                                  <div className="font-semibold text-base">
                                    {getMonthName(parseInt(monthIndex))} {selectedYear}
                                  </div>
                                  {hasPayments ? (
                                    <div className="flex gap-2 text-xs">
                                      <Badge variant="outline" className="bg-green-50">
                                        <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                                        {monthStats.paid} Paid
                                      </Badge>
                                      <Badge variant="outline" className="bg-yellow-50">
                                        <Clock className="w-3 h-3 mr-1 text-yellow-600" />
                                        {monthStats.pending} Pending
                                      </Badge>
                                      {monthStats.overdue > 0 && (
                                        <Badge variant="outline" className="bg-red-50">
                                          <AlertCircle className="w-3 h-3 mr-1 text-red-600" />
                                          {monthStats.overdue} Overdue
                                        </Badge>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">
                                      No payments recorded
                                    </div>
                                  )}
                                </div>
                                {hasPayments && (
                                  <div className="flex flex-col items-end">
                                    <div className="font-semibold text-sm text-green-600">
                                      Paid: {formatAmount(monthStats.paidAmount)}
                                    </div>
                                    {(monthStats.pendingAmount > 0 || monthStats.overdueAmount > 0) && (
                                      <div className="text-xs text-muted-foreground">
                                        Outstanding: {formatAmount(monthStats.pendingAmount + monthStats.overdueAmount)}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              {hasPayments ? (
                                <div className="px-4 pb-4">
                                  <div className="rounded-lg border">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Tenant</TableHead>
                                          <TableHead>Property</TableHead>
                                          <TableHead>Amount</TableHead>
                                          <TableHead>Status</TableHead>
                                          <TableHead>Payment Date</TableHead>
                                          <TableHead>Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {monthPayments.map((payment) => (
                                          <TableRow key={payment.id}>
                                            <TableCell>
                                              {payment.tenant && (
                                                <div>
                                                  <div className="font-medium">
                                                    {payment.tenant.name} {payment.tenant.surname}
                                                  </div>
                                                  <div className="text-xs text-muted-foreground">
                                                    {payment.tenant.email}
                                                  </div>
                                                </div>
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              {payment.property && (
                                                <div>
                                                  <div className="font-medium">{payment.property.name}</div>
                                                  <div className="text-xs text-muted-foreground">
                                                    {payment.property.address}
                                                  </div>
                                                </div>
                                              )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                              {formatAmount(payment.amount)}
                                            </TableCell>
                                            <TableCell>
                                              <Badge
                                                className={
                                                  payment.status === "paid"
                                                    ? "bg-green-500 hover:bg-green-600"
                                                    : payment.status === "pending"
                                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                                    : "bg-red-500 hover:bg-red-600"
                                                }
                                              >
                                                {payment.status === "paid" && <CheckCircle className="w-3 h-3 mr-1" />}
                                                {payment.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                                                {payment.status === "overdue" && <AlertCircle className="w-3 h-3 mr-1" />}
                                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>
                                              {payment.payment_date
                                                ? new Date(payment.payment_date).toLocaleDateString()
                                                : "-"}
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex gap-1">
                                                {payment.status !== "paid" && (
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-xs"
                                                    onClick={() => handleQuickStatusUpdate(payment.id, "paid")}
                                                  >
                                                    Mark Paid
                                                  </Button>
                                                )}
                                                {payment.status === "paid" && (
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-xs"
                                                    onClick={() => handleQuickStatusUpdate(payment.id, "pending")}
                                                  >
                                                    Mark Pending
                                                  </Button>
                                                )}
                                                <Dialog>
                                                  <DialogTrigger asChild>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      className="text-xs"
                                                      onClick={() => {
                                                        setSelectedPaymentForEdit(payment);
                                                        setEditPaymentDate(payment.payment_date ? new Date(payment.payment_date) : undefined);
                                                        setIsEditDateDialogOpen(true);
                                                      }}
                                                    >
                                                      <Edit className="w-4 h-4 mr-1" />
                                                      Edit Date
                                                    </Button>
                                                  </DialogTrigger>
                                                  <DialogContent>
                                                    <DialogHeader>
                                                      <DialogTitle>Edit Payment Date</DialogTitle>
                                                      <DialogDescription>
                                                        Update the payment date for {payment.tenant.name} {payment.tenant.surname}
                                                      </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                      <div>
                                                        <Label>Payment Date</Label>
                                                        <Popover>
                                                          <PopoverTrigger asChild>
                                                            <Button
                                                              variant="outline"
                                                              className={cn("w-full justify-start text-left", !editPaymentDate && "text-muted")}
                                                            >
                                                              {editPaymentDate ? format(editPaymentDate, "PPP") : "Select date"}
                                                              <CalendarIcon className="w-4 h-4 ml-auto" />
                                                            </Button>
                                                          </PopoverTrigger>
                                                          <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                              mode="single"
                                                              selected={editPaymentDate}
                                                              onSelect={setEditPaymentDate}
                                                              initialFocus
                                                              className="rounded-b-lg"
                                                            />
                                                          </PopoverContent>
                                                        </Popover>
                                                      </div>
                                                    </div>
                                                    <DialogFooter>
                                                      <Button
                                                        variant="outline"
                                                        onClick={() => setIsEditDateDialogOpen(false)}
                                                        disabled={editDateLoading}
                                                      >
                                                        Cancel
                                                      </Button>
                                                      <Button
                                                        onClick={handleEditPaymentDate}
                                                        disabled={editDateLoading}
                                                        className="bg-green-600 hover:bg-green-700"
                                                      >
                                                        {editDateLoading ? "Updating..." : "Update Date"}
                                                      </Button>
                                                    </DialogFooter>
                                                  </DialogContent>
                                                </Dialog>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              ) : (
                                <div className="px-4 pb-4 text-center text-muted-foreground">
                                  No payment records for this month
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                  </Accordion>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PropertyManagerLayout>
    </ProtectedRoute>
  );
}
