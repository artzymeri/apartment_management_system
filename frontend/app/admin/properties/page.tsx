"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useProperties, useDeleteProperty } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Building2, Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { toast } from "sonner";

export default function PropertiesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPropertyManagers, setSelectedPropertyManagers] = useState<any[]>([]);
  const [isManagerDialogOpen, setIsManagerDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: number; name: string } | null>(null);
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    city: "",
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useProperties(appliedFilters);
  const deleteMutation = useDeleteProperty();

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

  // Apply city filter immediately on change
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters((prev) => ({
        ...prev,
        city: cityFilter,
        page: 1,
      }));
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [cityFilter]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setAppliedFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewManagers = (managers: any[]) => {
    setSelectedPropertyManagers(managers);
    setIsManagerDialogOpen(true);
  };

  const properties = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Filters */}
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Filter Properties
                  </CardTitle>
                  <CardDescription>
                    Search by name, address, or filter by city
                  </CardDescription>
                </div>
                <Button
                  onClick={() => router.push("/admin/properties/create")}
                  className="bg-red-600 hover:bg-red-700 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Property
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-64">
                  <Input
                    placeholder="Filter by city..."
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Properties Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
                </div>
              ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Building2 className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No properties found</p>
                  <p className="text-sm">Try adjusting your filters or create a new property</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Managers</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property: any) => {
                      const managers = property.managers || [];
                      const managerCount = managers.length;

                      return (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">
                            {property.name}
                          </TableCell>
                          <TableCell>{property.address}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {property.cityDetails?.name || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {managerCount === 0 ? (
                              <span className="text-slate-400 text-sm">
                                Not Assigned
                              </span>
                            ) : managerCount === 1 ? (
                              <div className="text-sm">
                                <p className="font-medium">
                                  {managers[0].name} {managers[0].surname}
                                </p>
                                <p className="text-slate-500 text-xs">
                                  {managers[0].email}
                                </p>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewManagers(managers)}
                                className="gap-2"
                              >
                                <Users className="h-4 w-4" />
                                {managerCount} Managers
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {new Date(property.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(`/admin/properties/edit/${property.id}`)
                                }
                                className="gap-2"
                              >
                                <Pencil className="h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPropertyToDelete({ id: property.id, name: property.name })}
                                disabled={deleteMutation.isPending}
                                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {!isLoading && properties.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Managers Dialog */}
          <Dialog open={isManagerDialogOpen} onOpenChange={setIsManagerDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assigned Managers</DialogTitle>
                <DialogDescription>
                  Property managers assigned to this property
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {selectedPropertyManagers.map((manager) => (
                  <div
                    key={manager.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-slate-50"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900">
                        {manager.name} {manager.surname}
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {manager.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation AlertDialog */}
          <AlertDialog open={!!propertyToDelete} onOpenChange={(open) => {
            if (!open) setPropertyToDelete(null);
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this property? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => setPropertyToDelete(null)}
                  className="hover:bg-slate-100"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (propertyToDelete) {
                      try {
                        const result = await deleteMutation.mutateAsync(propertyToDelete.id);
                        if (result.success) {
                          setPropertyToDelete(null);
                          // Optionally, refetch properties or update state to remove deleted property
                        } else {
                          // setDeleteError(result.message || "Failed to delete property");
                          toast.error(result.message || "Failed to delete property");
                        }
                      } catch (err) {
                        // setDeleteError("Failed to delete property");
                        toast.error("Failed to delete property");
                        console.error("Delete error:", err);
                      }
                    }
                  }}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Delete Property
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
