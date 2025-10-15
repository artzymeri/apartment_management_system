"use client";

import { useState, useCallback, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin } from "lucide-react";

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  disabled = false,
}: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: Number(latitude), lng: Number(longitude) } : null
  );
  const [mapCenter, setMapCenter] = useState(
    latitude && longitude ? { lat: Number(latitude), lng: Number(longitude) } : defaultCenter
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  useEffect(() => {
    if (latitude && longitude) {
      const position = { lat: Number(latitude), lng: Number(longitude) };
      setMarkerPosition(position);
      setMapCenter(position);
    }
  }, [latitude, longitude]);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (disabled || !e.latLng) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      setMarkerPosition({ lat, lng });
      onLocationChange(lat, lng);
    },
    [onLocationChange, disabled]
  );

  if (!apiKey) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
        </AlertDescription>
      </Alert>
    );
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading Google Maps. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Location
          </CardTitle>
          <CardDescription>
            {disabled
              ? "View the property location on the map"
              : "Click on the map to set the property location"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] bg-slate-50 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Property Location
        </CardTitle>
        <CardDescription>
          {disabled
            ? "View the property location on the map"
            : "Click on the map to set the property location"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={13}
          onClick={onMapClick}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {markerPosition && <Marker position={markerPosition} />}
        </GoogleMap>

        {markerPosition && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm font-medium text-slate-700">Selected Coordinates:</p>
            <p className="text-xs text-slate-600 mt-1">
              Latitude: {Number(markerPosition.lat).toFixed(6)}, Longitude: {Number(markerPosition.lng).toFixed(6)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
