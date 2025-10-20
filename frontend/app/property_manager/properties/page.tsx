"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useProperties, useDeleteProperty } from "@/hooks/useProperties";
import { Property } from "@/lib/property-api";
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
import { Building2, Search, ChevronLeft, ChevronRight, MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function PropertyManagerPropertiesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: number; name: string } | null>(null);
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    city: "",
    page: 1,
    limit: 10,
    myProperties: true, // Flag to fetch only properties linked to this property_manager user
  });

  const { data, isLoading, error } = useProperties(appliedFilters);
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

  // Helper function to calculate the number of floors
  const calculateFloorsCount = (floorsFrom: number | null, floorsTo: number | null): number | null => {
    if (floorsFrom === null || floorsTo === null) {
      return null;
    }
    // Count includes both endpoints, so add 1
    return floorsTo - floorsFrom + 1;
  };

  const handleRowClick = (propertyId: number) => {
    router.push(`/property_manager/properties/${propertyId}`);
  };

  const handleDeleteProperty = (propertyId: number) => {
    deleteMutation.mutate(propertyId, {
      onSuccess: () => {
        toast.success("Property deleted successfully");
        // Refetch properties after deletion
        setAppliedFilters((prev) => ({ ...prev, page: 1 }));
        setCurrentPage(1);
      },
      onError: () => {
        toast.error("Failed to delete property");
      },
    });
  };

  const properties = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <ProtectedRoute allowedRoles={["property_manager"]}>
      <PropertyManagerLayout>
        <div className="space-y-4 md:space-y-6">
          {/* Filters */}
          <Card className="border-indigo-200">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Search className="h-4 w-4 md:h-5 md:w-5" />
                    Filter Properties
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm mt-1">
                    Search by name, address, or filter by city
                  </CardDescription>
                </div>
                <Button
                  onClick={() => router.push("/property_manager/properties/create")}
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2 w-full sm:w-auto text-xs md:text-sm h-9 md:h-10"
                >
                  <Plus className="h-4 w-4" />
                  Create Property
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm md:text-base h-9 md:h-10"
                  />
                </div>
                <div className="w-full sm:w-48 md:w-64">
                  <Input
                    placeholder="Filter by city..."
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="text-sm md:text-base h-9 md:h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs md:text-sm">Failed to load properties</AlertDescription>
            </Alert>
          )}

          {/* Properties Table - Desktop */}
          <Card className="hidden lg:block">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
              ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Building2 className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No properties found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Floors</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property: Property) => {
                      const floorsCount = calculateFloorsCount(property.floors_from, property.floors_to);

                      return (
                        <TableRow key={property.id} className="hover:bg-indigo-50/50 transition-colors">
                          <TableCell
                            className="font-medium cursor-pointer"
                            onClick={() => handleRowClick(property.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-indigo-600" />
                              {property.name}
                            </div>
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(property.id)} className="cursor-pointer">
                            {property.address}
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(property.id)} className="cursor-pointer">
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                              {property.cityDetails?.name || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(property.id)} className="cursor-pointer">
                            {floorsCount !== null ? (
                              <div className="text-sm">
                                <span className="font-medium text-slate-900">{floorsCount}</span>
                                <span className="text-slate-500 text-xs ml-1">
                                  {floorsCount === 1 ? 'floor' : 'floors'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">Not specified</span>
                            )}
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(property.id)} className="cursor-pointer">
                            {property.latitude && property.longitude ? (
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <MapPin className="h-3 w-3" />
                                <span>
                                  {Number(property.latitude).toFixed(4)}, {Number(property.longitude).toFixed(4)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">Not set</span>
                            )}
                          </TableCell>
                          <TableCell onClick={() => handleRowClick(property.id)} className="cursor-pointer text-sm text-slate-600">
                            {new Date(property.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/property_manager/properties/edit/${property.id}`);
                                }}
                                className="gap-2"
                              >
                                <Pencil className="h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPropertyToDelete({ id: property.id, name: property.name });
                                }}
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

          {/* Properties Cards - Mobile & Tablet */}
          <div className="lg:hidden space-y-3">
            {isLoading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  </div>
                </CardContent>
              </Card>
            ) : properties.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Building2 className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-base md:text-lg font-medium">No properties found</p>
                    <p className="text-xs md:text-sm">Try adjusting your filters</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              properties.map((property: Property) => {
                const floorsCount = calculateFloorsCount(property.floors_from, property.floors_to);

                return (
                  <Card
                    key={property.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleRowClick(property.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                              <Building2 className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 text-sm md:text-base truncate">
                                {property.name}
                              </h3>
                              <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                                {property.address}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 text-xs flex-shrink-0">
                            {property.cityDetails?.name || 'Unknown'}
                          </Badge>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                          <div>
                            <p className="text-xs text-slate-500">Floors</p>
                            <p className="text-sm font-medium text-slate-900 mt-0.5">
                              {floorsCount !== null ? (
                                <span>{floorsCount} {floorsCount === 1 ? 'floor' : 'floors'}</span>
                              ) : (
                                <span className="text-slate-400">Not specified</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Created</p>
                            <p className="text-sm font-medium text-slate-900 mt-0.5">
                              {new Date(property.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Location */}
                        {property.latitude && property.longitude && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {Number(property.latitude).toFixed(4)}, {Number(property.longitude).toFixed(4)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/property_manager/properties/edit/${property.id}`);
                            }}
                            className="flex-1 gap-2 text-xs h-8"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPropertyToDelete({ id: property.id, name: property.name });
                            }}
                            disabled={deleteMutation.isPending}
                            className="flex-1 gap-2 text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {!isLoading && properties.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
              <p className="text-xs md:text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="gap-2 flex-1 sm:flex-initial text-xs md:text-sm h-8 md:h-9"
                >
                  <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="gap-2 flex-1 sm:flex-initial text-xs md:text-sm h-8 md:h-9"
                >
                  Next
                  <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Delete Property Confirmation */}
          <AlertDialog open={!!propertyToDelete} onOpenChange={(open) => { if (!open) setPropertyToDelete(null); }}>
            <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base md:text-lg">Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription className="text-xs md:text-sm">
                  Are you sure you want to delete the property{" "}
                  <span className="font-medium">{propertyToDelete?.name}</span>? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel
                  onClick={() => setPropertyToDelete(null)}
                  className="hover:bg-slate-100 text-xs md:text-sm h-9 w-full sm:w-auto"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (propertyToDelete) {
                      handleDeleteProperty(propertyToDelete.id);
                      setPropertyToDelete(null);
                    }
                  }}
                  className="bg-red-600 text-white hover:bg-red-700 text-xs md:text-sm h-9 w-full sm:w-auto"
                >
                  Delete Property
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </PropertyManagerLayout>
    </ProtectedRoute>
  );
}
