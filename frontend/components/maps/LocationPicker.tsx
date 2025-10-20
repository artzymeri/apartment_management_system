"use client";

import { useState, useCallback, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MapPin, Lock, Unlock } from "lucide-react";

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  disabled?: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
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
  isLocked = false,
  onToggleLock,
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
      if (disabled || isLocked || !e.latLng) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      setMarkerPosition({ lat, lng });
      onLocationChange(lat, lng);
    },
    [onLocationChange, disabled, isLocked]
  );

  if (!apiKey) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Çelësi i Google Maps API nuk është konfiguruar. Ju lutem shtoni NEXT_PUBLIC_GOOGLE_MAPS_API_KEY në variablat e ambientit tuaj.
        </AlertDescription>
      </Alert>
    );
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Gabim në ngarkimin e Google Maps. Ju lutem provoni përsëri më vonë.
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
            Vendndodhja e Pronës
          </CardTitle>
          <CardDescription>
            {disabled
              ? "Shiko vendndodhjen e pronës në hartë"
              : "Kliko në hartë për të vendosur vendndodhjen e pronës"
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Vendndodhja e Pronës
            </CardTitle>
            <CardDescription>
              {isLocked
                ? "Vendndodhja është e kyçur. Kliko butonin për të aktivizuar modifikimin."
                : disabled
                ? "Shiko vendndodhjen e pronës në hartë"
                : "Kliko në hartë për të vendosur vendndodhjen e pronës"
              }
            </CardDescription>
          </div>
          {onToggleLock && markerPosition && (
            <Button
              type="button"
              variant={isLocked ? "outline" : "secondary"}
              size="sm"
              onClick={onToggleLock}
              className="gap-2"
            >
              {isLocked ? (
                <>
                  <Lock className="h-4 w-4" />
                  Zhblloko për Modifikim
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Kyç Vendndodhjen
                </>
              )}
            </Button>
          )}
        </div>
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
            draggableCursor: isLocked ? 'default' : 'crosshair',
          }}
        >
          {markerPosition && <Marker position={markerPosition} />}
        </GoogleMap>

        {markerPosition && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm font-medium text-slate-700">Koordinatat e Zgjedhura:</p>
            <p className="text-xs text-slate-600 mt-1">
              Gjerësia: {Number(markerPosition.lat).toFixed(6)}, Gjatësia: {Number(markerPosition.lng).toFixed(6)}
            </p>
            {isLocked && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Vendndodhja është e kyçur dhe nuk mund të ndryshohet
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
