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
import { UserPlus, Search, Check, X, ChevronLeft, ChevronRight, Loader2, Mail, Phone, Calendar as CalendarIcon } from "lucide-react";
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

export default function RegisterRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
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
      toast.success(`Kërkesa për regjistrim u miratua për ${approvalDialog.request.name} ${approvalDialog.request.surname}`);
      closeApprovalDialog();
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Dështoi miratimi i kërkesës për regjistrim");
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

    const labels: Record<string, string> = {
      pending: "Në pritje",
      approved: "Miratuar",
      rejected: "Refuzuar",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
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
                Filtro Kërkesat për Regjistrim
              </CardTitle>
              <CardDescription>Kërko dhe filtro kërkesat për regjistrim</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Kërko sipas emrit, mbiemrit ose emailit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Register Requests Table - Desktop */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>Kërkesat për Regjistrim</CardTitle>
              <CardDescription>
                {data?.pagination.total || 0} kërkesa gjithsej
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    Gabim në ngarkimin e kërkesave. Ju lutem provoni përsëri.
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-slate-500">Duke u ngarkuar...</div>
                </div>
              ) : !data?.data || data.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <UserPlus className="h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nuk ka Kërkesa për Regjistrim</h3>
                  <p className="text-slate-500">
                    Nuk ka kërkesa për regjistrim që përputhen me filtrat tuaj.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Emri</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefoni</TableHead>
                          <TableHead>Statusi</TableHead>
                          <TableHead>Data e Kërkesës</TableHead>
                          <TableHead className="text-right">Veprime</TableHead>
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
                                      Aprovo
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReject(request)}
                                      disabled={rejectMutation.isPending}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Refuzo
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
                        Faqja {data.pagination.page} nga {data.pagination.totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Mëparshme
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === data.pagination.totalPages}
                        >
                          Tjetër
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Register Requests Cards - Mobile */}
          <div className="md:hidden space-y-4">
            {/* Header Card */}
            <Card>
              <CardHeader>
                <CardTitle>Kërkesat për Regjistrim</CardTitle>
                <CardDescription>
                  {data?.pagination.total || 0} kërkesa gjithsej
                </CardDescription>
              </CardHeader>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Gabim në ngarkimin e kërkesave. Ju lutem provoni përsëri.
                </AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex items-center justify-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Duke u ngarkuar...
                  </div>
                </CardContent>
              </Card>
            ) : !data?.data || data.data.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-center text-slate-500">
                    <UserPlus className="h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nuk ka Kërkesa për Regjistrim</h3>
                    <p className="text-sm">
                      Nuk ka kërkesa për regjistrim që përputhen me filtrat tuaj.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {data.data.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="pt-6 space-y-3">
                      {/* Name and Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-base">
                            {request.name} {request.surname}
                          </h3>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="break-all">{request.email}</span>
                        </div>
                        {request.number && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{request.number}</span>
                          </div>
                        )}
                      </div>

                      {/* Request Date */}
                      <div className="flex items-center gap-2 text-sm text-slate-500 pt-2 border-t">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>Kërkuar: {format(new Date(request.created_at), "MMM dd, yyyy")}</span>
                      </div>

                      {/* Actions */}
                      {request.status === "pending" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1"
                            onClick={() => openApprovalDialog(request)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Aprovo
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleReject(request)}
                            disabled={rejectMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Refuzo
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <p className="text-sm text-slate-600 text-center sm:text-left">
                      Faqja {data.pagination.page} nga {data.pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Mëparshme</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === data.pagination.totalPages}
                      >
                        <span className="hidden sm:inline">Tjetër</span>
                        <ChevronRight className="h-4 w-4 sm:ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Approval Dialog */}
        <Dialog open={approvalDialog.isOpen} onOpenChange={closeApprovalDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Aprovo Kërkesën për Regjistrim</DialogTitle>
              <DialogDescription>
                Aprovo dhe cakto një rol për {approvalDialog.request?.name}{" "}
                {approvalDialog.request?.surname}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role">Roli i Përdoruesit</Label>
                <Select value={approvalRole} onValueChange={setApprovalRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Zgjidh rolin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant">Qiramarrës</SelectItem>
                    <SelectItem value="property_manager">Menaxher Pronash</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {approvalRole === 'property_manager' && (
                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Data e Skadimit</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={expiryDate ? "default" : "outline"}
                        className="w-full justify-start text-left"
                        onClick={(e) => e.preventDefault()}
                      >
                        {expiryDate ? format(expiryDate, "MMM dd, yyyy") : "Zgjidh datën e skadimit"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
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
                              Pastro
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setExpiryDate(new Date())}
                            >
                              Sot
                            </Button>
                          </div>
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={closeApprovalDialog} className="w-full sm:w-auto">
                Anulo
              </Button>
              <Button onClick={handleApprove} disabled={approveMutation.isPending} className="w-full sm:w-auto">
                {approveMutation.isPending ? "Duke aprovuar..." : "Aprovo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Confirmation AlertDialog */}
        <AlertDialog open={!!requestToReject} onOpenChange={() => setRequestToReject(null)}>
          <AlertDialogContent className="sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmo Refuzimin</AlertDialogTitle>
              <AlertDialogDescription>
                Jeni i sigurt që dëshironi të refuzoni kërkesën për regjistrim nga &quot;{requestToReject?.email}&quot;?{" "}
                Ky veprim do të fshijë përgjithmonë kërkesën dhe nuk mund të zhbëhet.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Anulo</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (requestToReject) {
                    try {
                      await rejectMutation.mutateAsync(requestToReject.id);
                      toast.success(`Kërkesa për regjistrim u refuzua për ${requestToReject.name} ${requestToReject.surname}`);
                      setRequestToReject(null);
                    } catch (error) {
                      console.error("Error rejecting request:", error);
                      toast.error("Dështoi refuzimi i kërkesës për regjistrim");
                    }
                  }
                }}
                disabled={rejectMutation.isPending}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                {rejectMutation.isPending ? "Duke refuzuar..." : "Refuzo"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </ProtectedRoute>
  );
}
