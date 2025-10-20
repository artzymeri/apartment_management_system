"use client";

import { useState } from "react";
import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MonthlyReportsList } from "@/components/MonthlyReportsList";
import { GenerateReportModal } from "@/components/GenerateReportModal";
import { useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Filter } from "lucide-react";
import { Property } from "@/lib/property-api";

export default function MonthlyReportsPage() {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  const { data: propertiesData } = useProperties({ limit: 1000 });
  const properties = propertiesData?.data || [];

  // Generate year options (current year and 4 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <ProtectedRoute allowedRoles={["property_manager"]}>
      <PropertyManagerLayout>
        <div className="space-y-4 md:space-y-6">
          {/* Filters Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <Filter className="h-4 w-4 md:h-5 md:w-5 mt-1" />
                  <div className="flex-1">
                    <CardTitle className="text-base md:text-lg">Filter Reports</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Select a property and year to view reports</CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => setIsGenerateModalOpen(true)}
                  className="w-full sm:w-auto h-9 md:h-10 text-xs md:text-sm"
                >
                  <Plus className="h-3 w-3 md:h-5 md:w-5 mr-2" />
                  Generate New Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium">Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property: Property) => (
                        <SelectItem key={property.id} value={property.id.toString()} className="text-xs md:text-sm">
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium">Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
                      <SelectValue placeholder="Select a year" />
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

          {/* Reports List - Only show when both filters are selected */}
          {selectedProperty && selectedYear ? (
            <MonthlyReportsList
              propertyId={parseInt(selectedProperty)}
              year={parseInt(selectedYear)}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
                <FileText className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
                <p className="text-base md:text-lg font-medium text-muted-foreground">Select filters to view reports</p>
                <p className="text-xs md:text-sm text-muted-foreground">Please select both a property and year above</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Generate Report Modal */}
        <GenerateReportModal
          open={isGenerateModalOpen}
          onOpenChange={setIsGenerateModalOpen}
        />
      </PropertyManagerLayout>
    </ProtectedRoute>
  );
}
