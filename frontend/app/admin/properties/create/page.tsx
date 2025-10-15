"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCreateProperty, useManagers } from "@/hooks/useProperties";
import { useCities } from "@/hooks/useCities";
import { LocationPicker } from "@/components/maps/LocationPicker";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function CreatePropertyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city_id: 0,
    latitude: null as number | null,
    longitude: null as number | null,
    manager_ids: [] as number[],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { data: managersData } = useManagers();
  const { data: citiesData } = useCities();
  const createMutation = useCreateProperty();

  const managers = managersData?.data || [];
  const cities = citiesData?.data || [];

  const managerOptions = managers.map((manager: { id: number; name: string; surname: string; email: string }) => ({
    label: `${manager.name} ${manager.surname} - ${manager.email}`,
    value: manager.id.toString(),
  }));

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleManagersChange = (values: string[]) => {
    setFormData((prev) => ({
      ...prev,
      manager_ids: values.map((v) => parseInt(v)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.city_id) {
      setError("Please select a city");
      toast.error("Please select a city");
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        name: formData.name,
        address: formData.address,
        city_id: formData.city_id,
        latitude: formData.latitude,
        longitude: formData.longitude,
        manager_ids: formData.manager_ids.length > 0 ? formData.manager_ids : undefined,
      });

      if (result.success) {
        setSuccess(true);
        toast.success("Property created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/admin/properties");
        }, 1500);
      } else {
        setError(result.message || "Failed to create property");
        toast.error(result.message || "Failed to create property");
      }
    } catch (err) {
      setError("Failed to connect to server");
      toast.error("Failed to connect to server");
      console.error("Create property error:", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminLayout>
        <div className="max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/admin/properties")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Create Property
              </h2>
              <p className="text-slate-600 mt-2">
                Add a new property to the system
              </p>
            </div>
          </div>

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Property created successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Details Form */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>
                  Enter the property information below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Property Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Greenwood Apartments"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    disabled={createMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="e.g., 123 Main Street"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                    disabled={createMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Select
                    value={formData.city_id ? formData.city_id.toString() : ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, city_id: parseInt(value) })
                    }
                    disabled={createMutation.isPending}
                  >
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managers">Assign Managers (Optional)</Label>
                  <MultiSelect
                    options={managerOptions}
                    selected={formData.manager_ids.map((id) => id.toString())}
                    onChange={handleManagersChange}
                    placeholder="Select managers..."
                    disabled={createMutation.isPending}
                  />
                  <p className="text-xs text-slate-600">
                    Assign property managers to manage this property
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location Picker */}
            <LocationPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={handleLocationChange}
              disabled={createMutation.isPending}
            />

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 gap-2"
                isLoading={createMutation.isPending}
              >
                <Save className="h-4 w-4" />
                Create Property
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/properties")}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
