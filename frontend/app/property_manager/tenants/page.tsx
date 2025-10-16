"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useTenants, useDeleteUser } from "@/hooks/useUsers";
import { useProperties } from "@/hooks/useProperties";
import { User } from "@/lib/user-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Building } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function PropertyManagerTenantsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [tenantToDelete, setTenantToDelete] = useState<{ id: number; name: string } | null>(null);
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error } = useTenants(appliedFilters);
  const { data: propertiesData } = useProperties({ myProperties: true });
  const deleteMutation = useDeleteUser();

  // Create a properties map for quick lookup
  const propertiesMap = useMemo(() => {
    if (!propertiesData?.data) return new Map();
    return new Map(propertiesData.data.map(p => [p.id, p]));
  }, [propertiesData]);

  // Get list of managed properties for the filter dropdown
  const managedProperties = useMemo(() => {
    if (!propertiesData?.data) return [];
    return propertiesData.data;
  }, [propertiesData]);

  // Filter tenants by selected property (client-side filter)
  const filteredTenants = useMemo(() => {
    if (!data?.data) return [];
    if (selectedProperty === "all") return data.data;

    return data.data.filter((tenant: User) => {
      return tenant.property_ids && tenant.property_ids.includes(parseInt(selectedProperty));
    });
  }, [data?.data, selectedProperty]);

  // Helper function to get property name by ID
  const getPropertyName = (propertyIds: number[] | undefined) => {
    if (!propertyIds || propertyIds.length === 0) return "Not assigned";
    const property = propertiesMap.get(propertyIds[0]);
    return property ? property.name : "Unknown";
  };

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

  // Reset to page 1 when property filter changes
  useEffect(() => {
    setCurrentPage(1);
    setAppliedFilters((prev) => ({ ...prev, page: 1 }));
  }, [selectedProperty]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setAppliedFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleDeleteTenant = (tenantId: number) => {
    deleteMutation.mutate(tenantId, {
      onSuccess: () => {
        toast.success("Tenant deleted successfully");
        setTenantToDelete(null);
        // Refetch tenants after deletion
        setAppliedFilters((prev) => ({ ...prev, page: 1 }));
        setCurrentPage(1);
      },
      onError: () => {
        toast.error("Failed to delete tenant");
      },
    });
  };

  const tenants = filteredTenants;
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <ProtectedRoute allowedRoles={["property_manager"]}>
      <PropertyManagerLayout>
        <div className="space-y-6">
          {/* Filters */}
          <Card className="border-indigo-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Filter Tenants
                  </CardTitle>
                  <CardDescription>
                    Search by name, email, or filter by property
                  </CardDescription>
                </div>
                <Button
                  onClick={() => router.push("/property_manager/tenants/create")}
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Tenant
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-64">
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Properties</option>
                    {managedProperties.map((property) => (
                      <option key={property.id} value={property.id.toString()}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenants Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tenants List
              </CardTitle>
              <CardDescription>
                {tenants.length} {selectedProperty !== "all" ? "filtered" : "total"} tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    Error loading tenants. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : tenants.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {selectedProperty !== "all"
                    ? "No tenants found for the selected property."
                    : "No tenants found."}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenants.map((tenant: User) => (
                        <TableRow key={tenant.id}>
                          <TableCell className="font-medium">
                            {tenant.name} {tenant.surname}
                          </TableCell>
                          <TableCell>{tenant.email}</TableCell>
                          <TableCell>{tenant.number || "N/A"}</TableCell>
                          <TableCell>
                            {tenant.floor_assigned !== null && tenant.floor_assigned !== undefined ? (
                              <Badge variant="outline" className="gap-1">
                                <Building className="h-3 w-3" />
                                Floor {tenant.floor_assigned}
                              </Badge>
                            ) : (
                              <span className="text-slate-400">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getPropertyName(tenant.property_ids)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/property_manager/tenants/edit/${tenant.id}`)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setTenantToDelete({
                                    id: tenant.id,
                                    name: `${tenant.name} ${tenant.surname}`,
                                  })
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-slate-600">
                        Page {currentPage} of {totalPages}
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
                          disabled={currentPage === totalPages}
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!tenantToDelete} onOpenChange={() => setTenantToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the tenant <strong>{tenantToDelete?.name}</strong>.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => tenantToDelete && handleDeleteTenant(tenantToDelete.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PropertyManagerLayout>
    </ProtectedRoute>
  );
}
