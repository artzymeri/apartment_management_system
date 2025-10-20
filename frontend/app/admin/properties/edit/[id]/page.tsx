"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useProperty, useManagers, useUpdateProperty } from "@/hooks/useProperties";
import { useCities } from "@/hooks/useCities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import { LocationPicker } from "@/components/maps/LocationPicker";

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = parseInt(params.id as string);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city_id: 0,
    latitude: null as number | null,
    longitude: null as number | null,
    floors_from: null as number | null,
    floors_to: null as number | null,
    manager_ids: [] as number[],
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isMapLocked, setIsMapLocked] = useState(false);

  const { data: propertyData, isLoading } = useProperty(propertyId);
  const { data: managersData } = useManagers();
  const { data: citiesData, isLoading: citiesLoading } = useCities();
  const updateMutation = useUpdateProperty();

  const managers = managersData?.data || [];
  const cities = citiesData?.data || [];

  const managerOptions = managers.map((manager: { id: number; name: string; surname: string; email: string }) => ({
    label: `${manager.name} ${manager.surname} - ${manager.email}`,
    value: manager.id.toString(),
  }));

  useEffect(() => {
    if (propertyData?.success && propertyData.data) {
      const property = propertyData.data;
      const hasCoordinates = property.latitude !== null && property.longitude !== null;

      setFormData({
        name: property.name,
        address: property.address,
        city_id: property.city_id,
        latitude: property.latitude,
        longitude: property.longitude,
        floors_from: property.floors_from,
        floors_to: property.floors_to,
        manager_ids: property.managers?.map((m: { id: number }) => m.id) || [],
      });

      // Lock the map if coordinates already exist
      setIsMapLocked(hasCoordinates);
    }
  }, [propertyData]);

  // Check if form is ready to display (both property and cities loaded)
  const isFormReady = !isLoading && !citiesLoading && formData.city_id > 0;

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
      setError("Ju lutem zgjidhni një qytet");
      toast.error("Ju lutem zgjidhni një qytet");
      return;
    }

    try {
      const result = await updateMutation.mutateAsync({
        id: propertyId,
        data: {
          name: formData.name,
          address: formData.address,
          city_id: formData.city_id,
          latitude: formData.latitude,
          longitude: formData.longitude,
          floors_from: formData.floors_from,
          floors_to: formData.floors_to,
          manager_ids: formData.manager_ids,
        },
      });

      if (result.success) {
        setSuccess(true);
        toast.success("Prona u përditësua me sukses! Duke ridrejtuar...");
        setTimeout(() => {
          router.push("/admin/properties");
        }, 1500);
      } else {
        setError(result.message || "Dështoi përditësimi i pronës");
        toast.error(result.message || "Dështoi përditësimi i pronës");
      }
    } catch (err) {
      setError("Dështoi lidhja me serverin");
      toast.error("Dështoi lidhja me serverin");
      console.error("Update property error:", err);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout title="Modifiko Pronën">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminLayout title="Modifiko Pronën">
        <div className="w-full max-w-4xl mx-auto space-y-4 md:space-y-6">
          {/* Back Button - Mobile Friendly */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/properties")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kthehu te Pronat</span>
              <span className="sm:hidden">Kthehu</span>
            </Button>
          </div>

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Prona u përditësua me sukses! Duke ridrejtuar...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isFormReady && (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Property Details Form */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Detajet e Pronës</CardTitle>
                  <CardDescription className="text-sm">
                    Përditëso informacionin e pronës më poshtë
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Emri i Pronës *</Label>
                    <Input
                      id="name"
                      placeholder="p.sh., Apartamentet Greenwood"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      disabled={updateMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresa *</Label>
                    <Input
                      id="address"
                      placeholder="p.sh., Rruga Kryesore 123"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                      disabled={updateMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Qyteti *</Label>
                    <Select
                      value={formData.city_id.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, city_id: parseInt(value) })
                      }
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger id="city">
                        <SelectValue placeholder="Zgjidh një qytet" />
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
                    <Label>Diapazoni i Kateve (Opsionale)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="floors_from" className="text-sm text-slate-600">Nga</Label>
                        <Select
                          value={formData.floors_from !== null ? formData.floors_from.toString() : "none"}
                          onValueChange={(value) =>
                            setFormData({ ...formData, floors_from: value === "none" ? null : parseInt(value) })
                          }
                          disabled={updateMutation.isPending}
                        >
                          <SelectTrigger id="floors_from">
                            <SelectValue placeholder="Kati fillestar" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="none">Nuk është specifikuar</SelectItem>
                            {Array.from({ length: 221 }, (_, i) => i - 20).map((floor) => (
                              <SelectItem key={floor} value={floor.toString()}>
                                {floor === 0 ? "Kati Përdhesë" : floor < 0 ? `B${Math.abs(floor)}` : `Kati ${floor}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floors_to" className="text-sm text-slate-600">Deri</Label>
                        <Select
                          value={formData.floors_to !== null ? formData.floors_to.toString() : "none"}
                          onValueChange={(value) =>
                            setFormData({ ...formData, floors_to: value === "none" ? null : parseInt(value) })
                          }
                          disabled={updateMutation.isPending}
                        >
                          <SelectTrigger id="floors_to">
                            <SelectValue placeholder="Kati përfundimtar" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="none">Nuk është specifikuar</SelectItem>
                            {Array.from({ length: 221 }, (_, i) => i - 20).map((floor) => (
                              <SelectItem key={floor} value={floor.toString()}>
                                {floor === 0 ? "Kati Përdhesë" : floor < 0 ? `B${Math.abs(floor)}` : `Kati ${floor}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">
                      Specifikoni diapazonin e kateve për këtë pronë (nga -20 nëntokë deri në 200 mbi tokë)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="managers">Cakto Menaxherë</Label>
                    <MultiSelect
                      options={managerOptions}
                      selected={formData.manager_ids.map((id) => id.toString())}
                      onChange={handleManagersChange}
                      placeholder="Zgjidh menaxherë..."
                      disabled={updateMutation.isPending}
                    />
                    <p className="text-xs text-slate-600">
                      Cakto menaxherë pronash për të menaxhuar këtë pronë
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Location Picker */}
              <LocationPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={handleLocationChange}
                disabled={updateMutation.isPending || isMapLocked}
                isLocked={isMapLocked}
                onToggleLock={() => setIsMapLocked(!isMapLocked)}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 gap-2 w-full sm:w-auto"
                  isLoading={updateMutation.isPending}
                >
                  <Save className="h-4 w-4" />
                  Përditëso Pronën
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/properties")}
                  disabled={updateMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  Anulo
                </Button>
              </div>
            </form>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
