"use client";

import { useState, useEffect } from "react";
import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import { AlertCircle, Building2, CheckCircle2, Clock, Loader2, Lightbulb, User, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { toast } from "sonner";

interface Suggestion {
  id: number;
  property_id: number;
  tenant_user_id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  property: {
    id: number;
    name: string;
    address: string;
  };
  tenant: {
    id: number;
    name: string;
    surname: string;
    email: string;
    number: string;
    floor_assigned: number | null;
  };
}

interface Property {
  id: number;
  name: string;
  address: string;
}

export default function PropertyManagerSuggestionsPage() {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedProperty !== "all") {
          params.append("property_id", selectedProperty);
        }
        if (selectedStatus !== "all") {
          params.append("status", selectedStatus);
        }

        const response = await fetch(`http://localhost:5000/api/suggestions/manager?${params.toString()}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions);
        } else {
          toast.error("Failed to load suggestions");
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        toast.error("Failed to load suggestions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [selectedProperty, selectedStatus]);

  // Fetch properties for filter
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/properties?limit=1000", {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setProperties(data.properties);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, []);

  const handleStatusUpdate = async () => {
    if (!selectedSuggestion || !newStatus) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`http://localhost:5000/api/suggestions/${selectedSuggestion.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Suggestion status updated successfully");
        setSelectedSuggestion(null);
        setNewStatus("");

        // Refresh suggestions
        const params = new URLSearchParams();
        if (selectedProperty !== "all") {
          params.append("property_id", selectedProperty);
        }
        if (selectedStatus !== "all") {
          params.append("status", selectedStatus);
        }

        const refreshResponse = await fetch(`http://localhost:5000/api/suggestions/manager?${params.toString()}`, {
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setSuggestions(data.suggestions);
        }
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update suggestion status");
      }
    } catch (error) {
      console.error("Error updating suggestion status:", error);
      toast.error("Failed to update suggestion status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><AlertCircle className="mr-1 h-3 w-3" />In Progress</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle2 className="mr-1 h-3 w-3" />Implemented</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Stats
  const stats = {
    total: suggestions.length,
    pending: suggestions.filter((s) => s.status === 'pending').length,
    in_progress: suggestions.filter((s) => s.status === 'in_progress').length,
    resolved: suggestions.filter((s) => s.status === 'resolved').length,
    rejected: suggestions.filter((s) => s.status === 'rejected').length,
  };

  return (
    <ProtectedRoute allowedRoles={["property_manager"]}>
      <PropertyManagerLayout title="Suggestions">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Suggestions</CardTitle>
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.in_progress}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Implemented</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejected}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Suggestions Overview</CardTitle>
                  <CardDescription>
                    Review tenant suggestions for your properties
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Implemented</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : suggestions.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No suggestions found matching the selected filters.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suggestions.map((suggestion) => (
                        <TableRow key={suggestion.id}>
                          <TableCell className="font-medium">
                            <div className="max-w-[200px]">
                              <div className="font-medium truncate">{suggestion.title}</div>
                              {suggestion.description && (
                                <div className="text-xs text-muted-foreground truncate mt-1">
                                  {suggestion.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <div className="max-w-[150px] truncate">
                                {suggestion.property.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {suggestion.tenant.name} {suggestion.tenant.surname}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {suggestion.tenant.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {suggestion.tenant.floor_assigned !== null
                              ? suggestion.tenant.floor_assigned
                              : "N/A"}
                          </TableCell>
                          <TableCell>{getStatusBadge(suggestion.status)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(suggestion.created_at), "PP")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(suggestion.created_at), "p")}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSuggestion(suggestion);
                                setNewStatus(suggestion.status);
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

        {/* Status Update Dialog */}
        <Dialog open={!!selectedSuggestion} onOpenChange={(open) => !open && setSelectedSuggestion(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Suggestion Status</DialogTitle>
              <DialogDescription>
                Change the status of this suggestion
              </DialogDescription>
            </DialogHeader>

            {selectedSuggestion && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Suggestion Details</div>
                  <div className="text-sm text-muted-foreground">
                    <div><strong>Title:</strong> {selectedSuggestion.title}</div>
                    {selectedSuggestion.description && (
                      <div className="mt-1"><strong>Description:</strong> {selectedSuggestion.description}</div>
                    )}
                    <div className="mt-1"><strong>Property:</strong> {selectedSuggestion.property.name}</div>
                    <div className="mt-1">
                      <strong>Tenant:</strong> {selectedSuggestion.tenant.name} {selectedSuggestion.tenant.surname}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">New Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Implemented</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedSuggestion(null)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={isUpdating || !newStatus}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PropertyManagerLayout>
    </ProtectedRoute>
  );
}

