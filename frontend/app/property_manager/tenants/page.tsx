"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useTenants, useDeleteTenant } from "@/hooks/useUsers";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [monthlyRateFilter, setMonthlyRateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tenantToDelete, setTenantToDelete] = useState<{ id: number; name: string } | null>(null);
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error } = useTenants(appliedFilters);
  const { data: propertiesData } = useProperties({ myProperties: true });
  const deleteMutation = useDeleteTenant();

  // Create a properties map for quick lookup
  const propertiesMap = useMemo(() => {
    if (!propertiesData?.data) return new Map();
    return new Map(propertiesData.data.map((p: any) => [p.id, p]));
  }, [propertiesData]);

  // Get list of managed properties for the filter dropdown
  const managedProperties = useMemo(() => {
    if (!propertiesData?.data) return [];
    return propertiesData.data;
  }, [propertiesData]);

  // Get available floors from selected property
  const availableFloors = useMemo(() => {
    // If no specific property is selected, return empty array (floor filter will be disabled)
    if (selectedProperty === "all" || !propertiesData?.data) return [];

    // Find the selected property
    const property = propertiesData.data.find((p: any) => p.id === parseInt(selectedProperty));

    if (!property) return [];

    const floorsFrom = property.floors_from ?? null;
    const floorsTo = property.floors_to ?? null;

    // If no floor range is defined, return empty array
    if (floorsFrom === null || floorsTo === null) return [];

    // Generate floor range from floors_from to floors_to
    const floors = [];
    for (let i = floorsFrom; i <= floorsTo; i++) {
      floors.push(i);
    }

    return floors;
  }, [propertiesData, selectedProperty]);

  // Filter tenants by all criteria (client-side filter)
  const filteredTenants = useMemo(() => {
    if (!data?.data) return [];

    return data.data.filter((tenant: User) => {
      // Filter by property
      if (selectedProperty !== "all") {
        const hasProperty = tenant.property_ids && tenant.property_ids.includes(parseInt(selectedProperty));
        if (!hasProperty) return false;
      }

      // Filter by floor
      if (selectedFloor !== "all") {
        if (tenant.floor_assigned !== parseInt(selectedFloor)) return false;
      }

      // Filter by monthly rate
      if (monthlyRateFilter) {
        const filterRate = parseFloat(monthlyRateFilter);
        if (!tenant.monthly_rate || Number(tenant.monthly_rate) !== filterRate) return false;
      }

      // Filter by search term (name, surname, email, or phone number)
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = tenant.name.toLowerCase().includes(search);
        const matchesSurname = tenant.surname.toLowerCase().includes(search);
        const matchesEmail = tenant.email.toLowerCase().includes(search);
        const matchesNumber = tenant.number?.toLowerCase().includes(search) || false;

        if (!matchesName && !matchesSurname && !matchesEmail && !matchesNumber) return false;
      }

      return true;
    });
  }, [data?.data, selectedProperty, selectedFloor, monthlyRateFilter, searchTerm]);

  // Helper function to get property name by ID
  const getPropertyName = (propertyIds: number[] | undefined) => {
    if (!propertyIds || propertyIds.length === 0) return "Nuk është caktuar";
    const property = propertiesMap.get(propertyIds[0]);
    return property ? property.name : "I panjohur";
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

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
    setAppliedFilters((prev) => ({ ...prev, page: 1 }));
  }, [selectedProperty, selectedFloor, monthlyRateFilter]);

  // Reset floor filter when property changes
  useEffect(() => {
    if (selectedProperty === "all") {
      setSelectedFloor("all");
    }
  }, [selectedProperty]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setAppliedFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleDeleteTenant = (tenantId: number) => {
    deleteMutation.mutate(tenantId, {
      onSuccess: () => {
        toast.success("Qiramarrësi u fshi me sukses");
        setTenantToDelete(null);
        // Refetch tenants after deletion
        setAppliedFilters((prev) => ({ ...prev, page: 1 }));
        setCurrentPage(1);
      },
      onError: () => {
        toast.error("Dështoi fshirja e qiramarrësit");
      },
    });
  };

  const tenants = filteredTenants;
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <ProtectedRoute allowedRoles={["property_manager"]}>
      <PropertyManagerLayout>
        <div className="space-y-4 md:space-y-6">
          {/* Filters */}
          <Card className="border-indigo-200">
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base md:text-lg flex items-center gap-2">
                      <Search className="h-4 w-4 md:h-5 md:w-5" />
                      Filtro Qiramarrësit
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm mt-1">
                      Kërko sipas emrit, email-it, numrit të telefonit ose filtro sipas pronës, katit dhe normës mujore
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {(selectedProperty !== "all" || selectedFloor !== "all" || monthlyRateFilter || searchTerm) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedProperty("all");
                          setSelectedFloor("all");
                          setMonthlyRateFilter("");
                        }}
                        className="text-slate-600 text-xs md:text-sm h-8 md:h-9"
                      >
                        Pastro Të Gjithë Filtrat
                      </Button>
                    )}
                    <Button
                      onClick={() => router.push("/property_manager/tenants/create")}
                      className="bg-indigo-600 hover:bg-indigo-700 gap-2 text-xs md:text-sm h-8 md:h-9"
                    >
                      <Plus className="h-4 w-4" />
                      Shto Qiramarrës
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {/* Search Input */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Kërko sipas emrit, email-it, ose numrit të telefonit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-sm md:text-base h-9 md:h-10"
                    />
                  </div>
                </div>

                {/* Filter Dropdowns and Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <label className="text-xs md:text-sm font-medium text-slate-700 mb-1 block">
                      Prona
                    </label>
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="w-full h-9 md:h-10 px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    >
                      <option value="all">Të Gjitha Pronat</option>
                      {managedProperties.map((property: any) => (
                        <option key={property.id} value={property.id.toString()}>
                          {property.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm font-medium text-slate-700 mb-1 block">
                      Kati
                    </label>
                    <select
                      value={selectedFloor}
                      onChange={(e) => setSelectedFloor(e.target.value)}
                      disabled={selectedProperty === "all"}
                      className={`w-full h-9 md:h-10 px-3 py-2 text-xs md:text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        selectedProperty === "all" 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                          : "bg-white"
                      }`}
                    >
                      <option value="all">
                        {selectedProperty === "all" ? "Zgjidhni një pronë së pari" : "Të Gjithë Katet"}
                      </option>
                      {availableFloors.map((floor) => (
                        <option key={floor} value={floor.toString()}>
                          Kati {floor}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm font-medium text-slate-700 mb-1 block">
                      Norma Mujore
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Filtro sipas normës..."
                        value={monthlyRateFilter}
                        onChange={(e) => setMonthlyRateFilter(e.target.value)}
                        className="w-full pr-8 text-sm md:text-base h-9 md:h-10"
                        min="0"
                        step="0.01"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-xs md:text-sm">
                        €
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenants Table - Desktop */}
          <Card className="hidden lg:block">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Lista e Qiramarrësve
              </CardTitle>
              <CardDescription className="text-sm">
                {tenants.length} {(selectedProperty !== "all" || selectedFloor !== "all" || monthlyRateFilter || searchTerm) ? "të filtruar" : "gjithsej"} qiramarrës
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription className="text-sm">
                    Gabim në ngarkimin e qiramarrësve. Ju lutemi provoni përsëri.
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : tenants.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  {(selectedProperty !== "all" || selectedFloor !== "all" || monthlyRateFilter || searchTerm)
                    ? "Asnjë qiramarrës nuk u gjet që përputhet me filtrat e zgjedhur."
                    : "Asnjë qiramarrës nuk u gjet."}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Emri</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefoni</TableHead>
                        <TableHead>Kati</TableHead>
                        <TableHead>Prona</TableHead>
                        <TableHead>Norma Mujore</TableHead>
                        <TableHead className="text-right">Veprimet</TableHead>
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
                                Kati {tenant.floor_assigned}
                              </Badge>
                            ) : (
                              <span className="text-slate-400">Nuk është caktuar</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getPropertyName(tenant.property_ids)}
                          </TableCell>
                          <TableCell>
                            {tenant.monthly_rate !== null && tenant.monthly_rate !== undefined ? (
                              <span className="font-medium">€{Number(tenant.monthly_rate).toFixed(2)}</span>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
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
                        Faqja {currentPage} nga {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          E mëparshme
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
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

          {/* Tenants Cards - Mobile & Tablet */}
          <div className="lg:hidden space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Lista e Qiramarrësve
                </CardTitle>
                <CardDescription className="text-xs">
                  {tenants.length} {(selectedProperty !== "all" || selectedFloor !== "all" || monthlyRateFilter || searchTerm) ? "të filtruar" : "gjithsej"} qiramarrës
                </CardDescription>
              </CardHeader>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs md:text-sm">
                  Gabim në ngarkimin e qiramarrësve. Ju lutemi provoni përsëri.
                </AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                </CardContent>
              </Card>
            ) : tenants.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-slate-500 text-xs md:text-sm">
                    {(selectedProperty !== "all" || selectedFloor !== "all" || monthlyRateFilter || searchTerm)
                      ? "Asnjë qiramarrës nuk u gjet që përputhet me filtrat e zgjedhur."
                      : "Asnjë qiramarrës nuk u gjet."}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-3">
                  {tenants.map((tenant: User) => (
                    <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                                {tenant.name} {tenant.surname}
                              </h3>
                              <p className="text-xs md:text-sm text-slate-600 mt-0.5 truncate">
                                {tenant.email}
                              </p>
                            </div>
                            {tenant.monthly_rate !== null && tenant.monthly_rate !== undefined && (
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs text-slate-500">Norma Mujore</p>
                                <p className="text-base md:text-lg font-bold text-indigo-600">
                                  €{Number(tenant.monthly_rate).toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                            <div>
                              <p className="text-xs text-slate-500">Telefoni</p>
                              <p className="text-sm font-medium text-slate-900 mt-0.5">
                                {tenant.number || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Kati</p>
                              <p className="text-sm font-medium text-slate-900 mt-0.5">
                                {tenant.floor_assigned !== null && tenant.floor_assigned !== undefined ? (
                                  <Badge variant="outline" className="gap-1 text-xs h-6">
                                    <Building className="h-3 w-3" />
                                    Kati {tenant.floor_assigned}
                                  </Badge>
                                ) : (
                                  <span className="text-slate-400">Nuk është caktuar</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Property */}
                          <div className="pt-2 border-t">
                            <p className="text-xs text-slate-500">Prona</p>
                            <p className="text-sm font-medium text-slate-900 mt-0.5">
                              {getPropertyName(tenant.property_ids)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/property_manager/tenants/edit/${tenant.id}`)}
                              className="flex-1 gap-2 text-xs h-8"
                            >
                              <Pencil className="h-3 w-3" />
                              Ndrysho
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
                              className="flex-1 gap-2 text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              Fshi
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs md:text-sm text-slate-600">
                      Faqja {currentPage} nga {totalPages}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex-1 sm:flex-initial text-xs md:text-sm h-8 md:h-9"
                      >
                        <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                        E mëparshme
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex-1 sm:flex-initial text-xs md:text-sm h-8 md:h-9"
                      >
                        Tjetër
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!tenantToDelete} onOpenChange={() => setTenantToDelete(null)}>
          <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base md:text-lg">Jeni i sigurt?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs md:text-sm">
                Kjo do të fshijë përgjithmonë qiramarrësin <strong>{tenantToDelete?.name}</strong>.
                Ky veprim nuk mund të zhbëhet.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="text-xs md:text-sm h-9 w-full sm:w-auto">Anulo</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => tenantToDelete && handleDeleteTenant(tenantToDelete.id)}
                className="bg-red-600 hover:bg-red-700 text-xs md:text-sm h-9 w-full sm:w-auto"
              >
                Fshi
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PropertyManagerLayout>
    </ProtectedRoute>
  );
}
