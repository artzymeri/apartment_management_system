"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCreateProperty } from "@/hooks/useProperties";
import { useCities } from "@/hooks/useCities";
import { LocationPicker } from "@/components/maps/LocationPicker";
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
    floors_from: null as number | null,
    floors_to: null as number | null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { data: citiesData } = useCities();
  const createMutation = useCreateProperty();

  const cities = citiesData?.data || [];

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
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
        floors_from: formData.floors_from,
        floors_to: formData.floors_to,
      });

      if (result.success) {
        setSuccess(true);
        toast.success("Property created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/property_manager/properties");
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
    <ProtectedRoute allowedRoles={["property_manager"]}>
      <PropertyManagerLayout title="Create Property">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          {/* Back Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/property_manager/properties")}
              className="h-9 w-9 md:h-10 md:w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <p className="text-xs md:text-sm text-slate-600">
              Add a new property to the system
            </p>
          </div>

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800 text-xs md:text-sm">
                Property created successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs md:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Property Details Form */}
            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Property Details</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Enter the property information below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs md:text-sm">Property Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Greenwood Apartments"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    disabled={createMutation.isPending}
                    className="text-sm md:text-base h-9 md:h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs md:text-sm">Address *</Label>
                  <Input
                    id="address"
                    placeholder="e.g., 123 Main Street"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                    disabled={createMutation.isPending}
                    className="text-sm md:text-base h-9 md:h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs md:text-sm">City *</Label>
                  <Select
                    value={formData.city_id ? formData.city_id.toString() : ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, city_id: parseInt(value) })
                    }
                    disabled={createMutation.isPending}
                  >
                    <SelectTrigger id="city" className="text-sm md:text-base h-9 md:h-10">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()} className="text-sm md:text-base">
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Floor Range (Optional)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="floors_from" className="text-xs text-slate-600">From</Label>
                      <Select
                        value={formData.floors_from !== null ? formData.floors_from.toString() : "none"}
                        onValueChange={(value) =>
                          setFormData({ ...formData, floors_from: value === "none" ? null : parseInt(value) })
                        }
                        disabled={createMutation.isPending}
                      >
                        <SelectTrigger id="floors_from" className="text-sm md:text-base h-9 md:h-10">
                          <SelectValue placeholder="Starting floor" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="none" className="text-sm">Not specified</SelectItem>
                          {Array.from({ length: 221 }, (_, i) => i - 20).map((floor) => (
                            <SelectItem key={floor} value={floor.toString()} className="text-sm">
                              {floor === 0 ? "Ground Level" : floor < 0 ? `B${Math.abs(floor)}` : `Floor ${floor}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floors_to" className="text-xs text-slate-600">To</Label>
                      <Select
                        value={formData.floors_to !== null ? formData.floors_to.toString() : "none"}
                        onValueChange={(value) =>
                          setFormData({ ...formData, floors_to: value === "none" ? null : parseInt(value) })
                        }
                        disabled={createMutation.isPending}
                      >
                        <SelectTrigger id="floors_to" className="text-sm md:text-base h-9 md:h-10">
                          <SelectValue placeholder="Ending floor" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="none" className="text-sm">Not specified</SelectItem>
                          {Array.from({ length: 221 }, (_, i) => i - 20).map((floor) => (
                            <SelectItem key={floor} value={floor.toString()} className="text-sm">
                              {floor === 0 ? "Ground Level" : floor < 0 ? `B${Math.abs(floor)}` : `Floor ${floor}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    Specify the floor range for this property (from -20 underground to 200 above ground)
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
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 gap-2 text-xs md:text-sm h-9 md:h-10"
                isLoading={createMutation.isPending}
              >
                <Save className="h-4 w-4" />
                Create Property
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/property_manager/properties")}
                disabled={createMutation.isPending}
                className="text-xs md:text-sm h-9 md:h-10"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </PropertyManagerLayout>
    </ProtectedRoute>
  );
}
