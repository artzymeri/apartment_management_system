"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PrivilegedLayout } from "@/components/layouts/PrivilegedLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useProperties } from "@/hooks/useProperties";
import { Property } from "@/lib/property-api";
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
import { Badge } from "@/components/ui/badge";
import { Building2, Search, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PrivilegedPropertiesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    city: "",
    page: 1,
    limit: 10,
    myProperties: true, // Flag to fetch only properties linked to this privileged user
  });

  const { data, isLoading, error } = useProperties(appliedFilters);

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

  const handleRowClick = (propertyId: number) => {
    router.push(`/privileged/properties/${propertyId}`);
  };

  const properties = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <ProtectedRoute allowedRoles={["privileged"]}>
      <PrivilegedLayout>
        <div className="space-y-6">
          {/* Filters */}
          <Card className="border-indigo-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Filter Properties
              </CardTitle>
              <CardDescription>
                Search by name, address, or filter by city
              </CardDescription>
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

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>Failed to load properties</AlertDescription>
            </Alert>
          )}

          {/* Properties Table */}
          <Card>
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
                      <TableHead>Location</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property: Property) => (
                      <TableRow
                        key={property.id}
                        onClick={() => handleRowClick(property.id)}
                        className="cursor-pointer hover:bg-indigo-50/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-indigo-600" />
                            {property.name}
                          </div>
                        </TableCell>
                        <TableCell>{property.address}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                            {property.cityDetails?.name || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
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
                        <TableCell className="text-sm text-slate-600">
                          {new Date(property.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
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
        </div>
      </PrivilegedLayout>
    </ProtectedRoute>
  );
}
