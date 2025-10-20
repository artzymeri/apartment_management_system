"use client";

import { useState, useEffect } from "react";
import { useProperties } from "@/hooks/useProperties";
import { MonthlyReportDashboard } from "@/components/MonthlyReportDashboard";
import { Property } from "@/lib/property-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";

interface GenerateReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateReportModal({ open, onOpenChange }: GenerateReportModalProps) {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const { data: propertiesData, refetch: refetchProperties } = useProperties({ limit: 1000 });
  const properties: Property[] = propertiesData?.data || [];

  // Refetch data when modal opens
  useEffect(() => {
    if (open) {
      refetchProperties();
    }
  }, [open, refetchProperties]);

  // Auto-select first property if available
  useEffect(() => {
    if (properties.length > 0 && !selectedProperty) {
      setSelectedProperty(properties[0].id.toString());
    }
  }, [properties, selectedProperty]);

  // Handle successful report generation - close modal
  const handleReportSuccess = () => {
    onOpenChange(false);
  };

  const months = [
    { value: 1, label: "Janar" },
    { value: 2, label: "Shkurt" },
    { value: 3, label: "Mars" },
    { value: 4, label: "Prill" },
    { value: 5, label: "Maj" },
    { value: 6, label: "Qershor" },
    { value: 7, label: "Korrik" },
    { value: 8, label: "Gusht" },
    { value: 9, label: "Shtator" },
    { value: 10, label: "Tetor" },
    { value: 11, label: "Nëntor" },
    { value: 12, label: "Dhjetor" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        fullscreen
        className="p-0 gap-0"
      >
        <div className="flex flex-col h-full w-full">
          {/* Sticky Header */}
          <div className="flex-shrink-0 border-b px-4 md:px-8 py-3 md:py-4 bg-background">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-2xl">Gjenero Raport Mujor</DialogTitle>
              <DialogDescription className="text-xs md:text-base">
                Zgjidhni pronën dhe periudhën kohore për të gjeneruar një raport të ri mujor
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
            <div className="px-4 md:px-8 py-4 md:py-6 w-full">
              <div className="space-y-4 md:space-y-6 w-full">
                {/* Filters */}
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">Filtrat e Raportit</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Zgjidhni pronën dhe periudhën kohore</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                      <div className="space-y-2">
                        <label className="text-xs md:text-sm font-medium">Prona</label>
                        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                          <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                            <SelectValue placeholder="Zgjidhni pronën" />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id.toString()} className="text-xs md:text-sm">
                                {property.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs md:text-sm font-medium">Muaji</label>
                        <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                          <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value.toString()} className="text-xs md:text-sm">
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs md:text-sm font-medium">Viti</label>
                        <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                          <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()} className="text-xs md:text-sm">
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dashboard Component */}
                {selectedProperty ? (
                  <div className="w-full">
                    <MonthlyReportDashboard
                      propertyId={parseInt(selectedProperty)}
                      month={selectedMonth}
                      year={selectedYear}
                      onSuccess={handleReportSuccess}
                    />
                  </div>
                ) : (
                  properties.length === 0 && (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
                        <FileText className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
                        <p className="text-base md:text-lg font-medium text-muted-foreground">Nuk u gjetën prona</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Krijoni një pronë për të filluar gjenerimin e raporteve</p>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
