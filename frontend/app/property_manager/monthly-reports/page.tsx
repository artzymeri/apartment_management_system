"use client";

import { useState, useEffect } from "react";
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
        <div className="space-y-6">
          {/* Filters Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  <div>
                    <CardTitle>Filter Reports</CardTitle>
                    <CardDescription>Select a property and year to view reports</CardDescription>
                  </div>
                </div>
                <Button onClick={() => setIsGenerateModalOpen(true)} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Generate New Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property: Property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a year" />
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

          {/* Reports List - Only show when both filters are selected */}
          {selectedProperty && selectedYear ? (
            <MonthlyReportsList
              propertyId={parseInt(selectedProperty)}
              year={parseInt(selectedYear)}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Select filters to view reports</p>
                <p className="text-sm text-muted-foreground">Please select both a property and year above</p>
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
