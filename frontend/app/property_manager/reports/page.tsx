"use client";

import { useState } from "react";
import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { usePropertyManagerReports, useUpdateReportStatus } from "@/hooks/useReports";
import { useProperties } from "@/hooks/useProperties";
import { Report } from "@/lib/report-api";
import { Property } from "@/lib/property-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Building2, CheckCircle2, Clock, FileText, User, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

export default function PropertyManagerReportsPage() {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  // Build query params
  const queryParams: Record<string, string | number> = {};
  if (selectedProperty !== "all") {
    queryParams.property_id = parseInt(selectedProperty);
  }
  if (selectedStatus !== "all") {
    queryParams.status = selectedStatus;
  }

  const { data: reportsData, isLoading, error } = usePropertyManagerReports(queryParams);
  const { data: propertiesData } = useProperties({ limit: 1000 });
  const updateReportMutation = useUpdateReportStatus();

  const reports = reportsData?.reports || [];
  const properties = propertiesData?.properties || [];

  const handleStatusUpdate = async () => {
    if (!selectedReport || !newStatus) return;

    try {
      await updateReportMutation.mutateAsync({
        id: selectedReport.id,
        data: { status: newStatus as 'pending' | 'in_progress' | 'resolved' | 'rejected' }
      });
      setSelectedReport(null);
      setNewStatus("");
    } catch (err) {
      // Error is handled by the mutation
      console.error('Failed to update report status:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><AlertCircle className="mr-1 h-3 w-3" />In Progress</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" />Resolved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Stats
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    inProgress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <ProtectedRoute allowedRoles={['property_manager']}>
      <PropertyManagerLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
            <p className="mt-2 text-slate-600">
              Manage and respond to tenant problem reports
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-700">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{stats.inProgress}</div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{stats.resolved}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Filter reports by property and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map((property: Property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Reports List</CardTitle>
              <CardDescription>
                View and manage tenant problem reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {(error as any)?.response?.data?.message || 'Failed to load reports'}
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-slate-600">Loading reports...</div>
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <FileText className="mb-4 h-12 w-12 text-slate-300" />
                  <p className="text-lg font-medium">No reports found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Problem</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">#{report.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-slate-400" />
                              <span className="font-medium">{report.property?.name}</span>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {report.property?.address}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              <span>{report.tenant?.name} {report.tenant?.surname}</span>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {report.tenant?.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{report.problemOption?.name}</div>
                            {report.description && (
                              <div className="mt-1 text-xs text-slate-500 max-w-xs truncate">
                                {report.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {report.floor !== null ? `Floor ${report.floor}` : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {format(new Date(report.created_at), 'MMM d, yyyy')}
                            <div className="text-xs text-slate-400">
                              {format(new Date(report.created_at), 'h:mm a')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setNewStatus(report.status);
                              }}
                            >
                              Update Status
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Update Status Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={(open) => {
          if (!open) {
            setSelectedReport(null);
            setNewStatus("");
          }
        }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Update Report Status</DialogTitle>
              <DialogDescription>
                Change the status of report #{selectedReport?.id}
              </DialogDescription>
            </DialogHeader>

            {selectedReport && (
              <div className="space-y-4">
                {/* Report Details */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Property</div>
                    <div className="font-medium">{selectedReport.property?.name}</div>
                    <div className="text-sm text-slate-600">{selectedReport.property?.address}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 uppercase">Tenant</div>
                    <div className="font-medium">
                      {selectedReport.tenant?.name} {selectedReport.tenant?.surname}
                    </div>
                    <div className="text-sm text-slate-600">{selectedReport.tenant?.email}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 uppercase">Problem</div>
                    <div className="font-medium">{selectedReport.problemOption?.name}</div>
                  </div>

                  {selectedReport.description && (
                    <div>
                      <div className="text-xs text-slate-500 uppercase">Description</div>
                      <div className="text-sm text-slate-700">{selectedReport.description}</div>
                    </div>
                  )}

                  {selectedReport.floor !== null && (
                    <div>
                      <div className="text-xs text-slate-500 uppercase">Floor</div>
                      <div className="text-sm text-slate-700">Floor {selectedReport.floor}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs text-slate-500 uppercase">Current Status</div>
                    <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                  </div>
                </div>

                {/* Status Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedReport(null);
                  setNewStatus("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={!newStatus || newStatus === selectedReport?.status || updateReportMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {updateReportMutation.isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PropertyManagerLayout>
    </ProtectedRoute>
  );
}
