"use client";

import { useParams, useRouter } from "next/navigation";
import { PrivilegedLayout } from "@/components/layouts/PrivilegedLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useQuery } from "@tanstack/react-query";
import { propertyAPI, Property } from "@/lib/property-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  User,
  ArrowLeft,
  Calendar,
  Users,
} from "lucide-react";

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = parseInt(params.id as string);

  const { data, isLoading, error } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => propertyAPI.getPropertyById(propertyId),
  });

  const property = data?.data;

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["privileged"]}>
        <PrivilegedLayout>
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </PrivilegedLayout>
      </ProtectedRoute>
    );
  }

  if (error || !property) {
    return (
      <ProtectedRoute allowedRoles={["privileged"]}>
        <PrivilegedLayout>
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Alert variant="destructive">
              <AlertDescription>
                Failed to load property details. The property may not exist or you
                don't have access to it.
              </AlertDescription>
            </Alert>
          </div>
        </PrivilegedLayout>
      </ProtectedRoute>
    );
  }

  const managers = property.managers || [];

  return (
    <ProtectedRoute allowedRoles={["privileged"]}>
      <PrivilegedLayout>
        <div className="space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Button>

          {/* Property Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-indigo-600" />
                {property.name}
              </h2>
              <p className="text-slate-600 mt-1">{property.address}</p>
            </div>
            <Badge className="bg-indigo-600 text-white">
              {property.cityDetails?.name || "Unknown"}
            </Badge>
          </div>

          {/* Property Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  Property Information
                </CardTitle>
                <CardDescription>
                  Basic details about this property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Address
                      </p>
                      <p className="text-sm text-slate-600">
                        {property.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">City</p>
                      <p className="text-sm text-slate-600">
                        {property.cityDetails?.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Coordinates
                      </p>
                      <p className="text-sm text-slate-600">
                        {property.latitude && property.longitude
                          ? `${Number(property.latitude).toFixed(6)}, ${Number(property.longitude).toFixed(6)}`
                          : "Not set"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Created
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(property.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Managers */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-600" />
                  Property Managers
                </CardTitle>
                <CardDescription>
                  {managers.length === 0
                    ? "No managers assigned"
                    : `${managers.length} manager(s) assigned to this property`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {managers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                      No managers assigned to this property
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {managers.map(
                      (manager: any) => (
                        <div
                          key={manager.id}
                          className="p-4 border border-slate-200 rounded-lg bg-slate-50/50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-indigo-600" />
                                <p className="font-medium text-slate-900">
                                  {manager.name} {manager.surname}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Mail className="h-3 w-3" />
                                  <a
                                    href={`mailto:${manager.email}`}
                                    className="hover:text-indigo-600 transition-colors"
                                  >
                                    {manager.email}
                                  </a>
                                </div>
                                {manager.number && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone className="h-3 w-3" />
                                    <a
                                      href={`tel:${manager.number}`}
                                      className="hover:text-indigo-600 transition-colors"
                                    >
                                      {manager.number}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Map Section (if coordinates are available) */}
          {property.latitude && property.longitude && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  Location
                </CardTitle>
                <CardDescription>Property location on map</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">
                    Map integration can be added here (Google Maps, Leaflet, etc.)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PrivilegedLayout>
    </ProtectedRoute>
  );
}
