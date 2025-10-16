"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateUser } from "@/hooks/useUsers";
import { useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateTenantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateUser();

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get managed properties
  const managedProperties = useMemo(() => {
    if (!propertiesData?.data) return [];
    return propertiesData.data;
  }, [propertiesData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validate property selection
    if (!formData.property_id) {
      setError("Please select a property for this tenant");
      toast.error("Please select a property for this tenant");
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        password: formData.password,
        number: formData.number || null,
        role: "tenant",
        property_ids: [parseInt(formData.property_id)],
        floor_assigned: formData.floor_assigned ? parseInt(formData.floor_assigned) : null,
      });

      if (result.success) {
        toast.success("Tenant created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/property_manager/tenants");
        }, 1500);
      } else {
        setError(result.message || "Failed to create tenant");
        toast.error(result.message || "Failed to create tenant");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create tenant";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Create tenant error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Add New Tenant
              </h2>
              <p className="text-slate-600 mt-2">
                Create a new tenant account
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Tenant Information</CardTitle>
                <CardDescription>
                  Fill in the details to create a new tenant account
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
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                    placeholder="Minimum 6 characters"
                    minLength={6}
                  />
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
                  <Label htmlFor="property_id">Select Property *</Label>
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
                      {propertiesLoading ? (
                        <SelectItem value="">Loading properties...</SelectItem>
                      ) : (
                        managedProperties.map((property) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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
                    Assign the tenant to a specific floor (optional)
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
                    disabled={isSubmitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isSubmitting ? (
                      <>Creating...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Tenant
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
