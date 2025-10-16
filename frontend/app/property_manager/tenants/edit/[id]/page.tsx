"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useTenant, useUpdateTenant } from "@/hooks/useUsers";
import { useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditTenantPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = parseInt(params.id as string);

  const { data: tenantData, isLoading } = useTenant(tenantId);
  const updateMutation = useUpdateTenant();

  // Fetch properties managed by this property manager
  const { data: propertiesData, isLoading: propertiesLoading } = useProperties({
    myProperties: true,
  });

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    number: "",
    property_id: "",
    floor_assigned: "" as string,
  });
  const [error, setError] = useState("");

  // Get managed properties
  const managedProperties = useMemo(() => {
    if (!propertiesData?.data) return [];
    return propertiesData.data;
  }, [propertiesData]);

  useEffect(() => {
    if (tenantData?.data) {
      const tenant = tenantData.data;
      setFormData({
        name: tenant.name,
        surname: tenant.surname,
        email: tenant.email,
        password: "",
        number: tenant.number || "",
        property_id: tenant.property_ids && tenant.property_ids.length > 0
          ? tenant.property_ids[0].toString()
          : "",
        floor_assigned: tenant.floor_assigned !== null && tenant.floor_assigned !== undefined
          ? tenant.floor_assigned.toString()
          : "",
      });
    }
  }, [tenantData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate property selection
    if (!formData.property_id) {
      setError("Please select a property for this tenant");
      toast.error("Please select a property for this tenant");
      return;
    }

    try {
      const updateData: any = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        number: formData.number || null,
        property_ids: [parseInt(formData.property_id)],
        floor_assigned: formData.floor_assigned ? parseInt(formData.floor_assigned) : null,
      };

      // Only include password if it's been changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateMutation.mutateAsync({
        id: tenantId,
        data: updateData,
      });

      toast.success("Tenant updated successfully! Redirecting...");
      setTimeout(() => {
        router.push("/property_manager/tenants");
      }, 1500);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update tenant";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Update tenant error:", err);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["property_manager"]}>
        <PropertyManagerLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </PropertyManagerLayout>
      </ProtectedRoute>
    );
  }

  if (!tenantData?.data || tenantData.data.role !== "tenant") {
    return (
      <ProtectedRoute allowedRoles={["property_manager"]}>
        <PropertyManagerLayout>
          <Alert variant="destructive">
            <AlertDescription>
              Tenant not found or invalid tenant ID.
            </AlertDescription>
          </Alert>
        </PropertyManagerLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["property_manager"]}>
      <PropertyManagerLayout>
        <div className="max-w-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/property_manager/tenants")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Edit Tenant
              </h2>
              <p className="text-slate-600 mt-2">
                Update tenant information
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Tenant Information</CardTitle>
                <CardDescription>
                  Update the details for this tenant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">First Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                      placeholder="John"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="surname">Last Name *</Label>
                    <Input
                      id="surname"
                      value={formData.surname}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, surname: e.target.value }))
                      }
                      required
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Leave blank to keep current password"
                    minLength={6}
                  />
                  <p className="text-sm text-slate-500">
                    Only fill this if you want to change the password
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Phone Number</Label>
                  <Input
                    id="number"
                    type="tel"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, number: e.target.value }))
                    }
                    placeholder="+1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_id">Select Property</Label>
                  <Select
                    id="property_id"
                    value={formData.property_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, property_id: value }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {managedProperties.length === 0 && (
                        <SelectItem value="">
                          No properties found
                        </SelectItem>
                      )}
                      {managedProperties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name} - {property.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-500">
                    Assign the tenant to a property
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor_assigned">Floor Number</Label>
                  <Input
                    id="floor_assigned"
                    type="number"
                    value={formData.floor_assigned}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, floor_assigned: e.target.value }))
                    }
                    placeholder="e.g., 1, 2, 3..."
                    min="-20"
                    max="200"
                  />
                  <p className="text-sm text-slate-500">
                    Assign the tenant to a specific floor (leave blank to unassign)
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/property_manager/tenants")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {updateMutation.isPending ? (
                      <>Updating...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Tenant
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </PropertyManagerLayout>
    </ProtectedRoute>
  );
}
