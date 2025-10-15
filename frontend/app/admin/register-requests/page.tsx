"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  useRegisterRequests,
  useApproveRegisterRequest,
  useRejectRegisterRequest,
} from "@/hooks/useRegisterRequests";
import { RegisterRequest, RegisterRequestFilters } from "@/lib/registerRequest-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Check, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function RegisterRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState<RegisterRequestFilters>({
    search: "",
    page: 1,
    limit: 10,
  });

  // Approval dialog state
  const [approvalDialog, setApprovalDialog] = useState<{
    isOpen: boolean;
    request: RegisterRequest | null;
  }>({ isOpen: false, request: null });
  const [approvalRole, setApprovalRole] = useState("tenant");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);

  // Reject confirmation state
  const [requestToReject, setRequestToReject] = useState<RegisterRequest | null>(null);

  const { data, isLoading, error } = useRegisterRequests(appliedFilters);
  const approveMutation = useApproveRegisterRequest();
  const rejectMutation = useRejectRegisterRequest();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters((prev) => ({
        ...prev,
        search: searchTerm,
        page: 1,
      }));
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply status filter immediately on change
  useEffect(() => {
    setAppliedFilters((prev) => ({
      ...prev,
      status: statusFilter === "all" ? undefined : (statusFilter as 'pending' | 'approved' | 'rejected'),
      page: 1,
    }));
    setCurrentPage(1);
  }, [statusFilter]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setAppliedFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const openApprovalDialog = (request: RegisterRequest) => {
    setApprovalDialog({ isOpen: true, request });
    setApprovalRole("tenant");
    setExpiryDate(undefined);
  };

  const closeApprovalDialog = () => {
    setApprovalDialog({ isOpen: false, request: null });
    setApprovalRole("tenant");
    setExpiryDate(undefined);
  };

  const handleApprove = async () => {
    if (!approvalDialog.request) return;

    try {
      const approvalData: any = { role: approvalRole };

      // Add expiry_date if role is property_manager
      if (approvalRole === 'property_manager' && expiryDate) {
        approvalData.expiry_date = format(expiryDate, 'yyyy-MM-dd');
      }

      await approveMutation.mutateAsync({
        id: approvalDialog.request.id,
        data: approvalData,
      });
      toast.success(`Registration request approved for ${approvalDialog.request.name} ${approvalDialog.request.surname}`);
      closeApprovalDialog();
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve registration request");
    }
  };

  const handleReject = (request: RegisterRequest) => {
    setRequestToReject(request);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Filter Register Requests
              </CardTitle>
              <CardDescription>Search and filter registration requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, surname, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Register Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Requests</CardTitle>
              <CardDescription>
                {data?.pagination.total || 0} total request(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    Error loading register requests. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-slate-500">Loading...</div>
                </div>
              ) : !data?.data || data.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <UserPlus className="h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Registration Requests</h3>
                  <p className="text-slate-500">
                    There are no registration requests matching your filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Request Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.data.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">
                              {request.name} {request.surname}
                            </TableCell>
                            <TableCell>{request.email}</TableCell>
                            <TableCell>{request.number || "N/A"}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              {format(new Date(request.created_at), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {request.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => openApprovalDialog(request)}
                                      disabled={approveMutation.isPending}
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReject(request)}
                                      disabled={rejectMutation.isPending}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {data.pagination.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        Page {data.pagination.page} of {data.pagination.totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === data.pagination.totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Approval Dialog */}
        <Dialog open={approvalDialog.isOpen} onOpenChange={closeApprovalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Registration Request</DialogTitle>
              <DialogDescription>
                Approve and assign a role to {approvalDialog.request?.name}{" "}
                {approvalDialog.request?.surname}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select value={approvalRole} onValueChange={setApprovalRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="property_manager">Property Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {approvalRole === 'property_manager' && (
                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Expiry Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={expiryDate ? "default" : "outline"}
                        className="w-full justify-start text-left"
                        onClick={(e) => e.preventDefault()}
                      >
                        {expiryDate ? format(expiryDate, "MMM dd, yyyy") : "Select expiry date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4">
                      <Calendar
                        mode="single"
                        selected={expiryDate}
                        onSelect={setExpiryDate}
                        disabled={(date) => date < new Date()}
                        footer={
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpiryDate(undefined)}
                            >
                              Clear
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setExpiryDate(undefined)}
                            >
                              Today
                            </Button>
                          </div>
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeApprovalDialog}>
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                {approveMutation.isPending ? "Approving..." : "Approve"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Confirmation AlertDialog */}
        <AlertDialog open={!!requestToReject} onOpenChange={() => setRequestToReject(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject the registration request from &quot;{requestToReject?.email}&quot;?{" "}
                This will permanently delete the request and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (requestToReject) {
                    try {
                      await rejectMutation.mutateAsync(requestToReject.id);
                      toast.success(`Registration request rejected for ${requestToReject.name} ${requestToReject.surname}`);
                      setRequestToReject(null);
                    } catch (error) {
                      console.error("Error rejecting request:", error);
                      toast.error("Failed to reject registration request");
                      setRequestToReject(null);
                    }
                  }
                }}
                disabled={rejectMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {rejectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Request"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </ProtectedRoute>
  );
}
