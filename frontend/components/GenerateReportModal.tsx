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

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
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
          <div className="flex-shrink-0 border-b px-8 py-4 bg-background">
            <DialogHeader>
              <DialogTitle className="text-2xl">Generate Monthly Report</DialogTitle>
              <DialogDescription className="text-base">
                Select property and time period to generate a new monthly report
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
            <div className="px-8 py-6 w-full">
              <div className="space-y-6 w-full">
                {/* Filters */}
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Report Filters</CardTitle>
                    <CardDescription>Select property and time period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Property</label>
                        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id.toString()}>
                                {property.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Month</label>
                        <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value.toString()}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Year</label>
                        <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
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
                    />
                  </div>
                ) : (
                  properties.length === 0 && (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">No properties found</p>
                        <p className="text-sm text-muted-foreground">Create a property to start generating reports</p>
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
