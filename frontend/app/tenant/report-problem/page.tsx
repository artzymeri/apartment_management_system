"use client";

import { TenantLayout } from "@/components/layouts/TenantLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ProblemOption {
  id: number;
  title: string;
  description: string;
}

interface Property {
  id: number;
  name: string;
  address: string;
  floors_from: number | null;
  floors_to: number | null;
  problemOptions: ProblemOption[];
}

interface Report {
  id: number;
  property_id: number;
  problem_option_id: number;
  floor: number | null;
  description: string;
  status: string;
  created_at: string;
  property: {
    name: string;
    address: string;
  };
  problemOption: {
    title: string;
  };
}

export default function ReportProblemPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedProblem, setSelectedProblem] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [myReports, setMyReports] = useState<Report[]>([]);

  // Fetch problem options for tenant's properties
  useEffect(() => {
    const fetchProblemOptions = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/reports/problem-options", {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setProperties(data.properties);
          if (data.properties.length > 0) {
            setSelectedProperty(data.properties[0]);
          }
        } else {
          console.error("Failed to fetch problem options:", response.status);
          toast.error("Failed to load problem options");
        }
      } catch (error) {
        console.error("Error fetching problem options:", error);
        toast.error("Failed to load problem options");
      } finally {
        setFetchingData(false);
      }
    };

    const fetchMyReports = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/reports/my-reports", {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setMyReports(data.reports);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    if (user) {
      fetchProblemOptions();
      fetchMyReports();
    }
  }, [user]);

  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find((p) => p.id.toString() === propertyId);
    setSelectedProperty(property || null);
    setSelectedProblem("");
    setSelectedFloor("");
  };

  const generateFloorOptions = () => {
    if (!selectedProperty || selectedProperty.floors_from === null || selectedProperty.floors_to === null) {
      return [];
    }

    const floors = [];
    for (let i = selectedProperty.floors_from; i <= selectedProperty.floors_to; i++) {
      floors.push(i);
    }
    return floors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProperty || !selectedProblem) {
      toast.error("Please select a property and problem type");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          property_id: selectedProperty.id,
          problem_option_id: parseInt(selectedProblem),
          floor: selectedFloor ? parseInt(selectedFloor) : null,
          description: null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Problem reported successfully!");
        setSelectedProblem("");
        setSelectedFloor("");

        // Refresh reports list
        const reportsResponse = await fetch("http://localhost:5000/api/reports/my-reports", {
          credentials: 'include',
        });
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          setMyReports(reportsData.reports);
        }
      } else {
        toast.error(data.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Loader2 className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Resolved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (fetchingData) {
    return (
      <ProtectedRoute allowedRoles={["tenant"]}>
        <TenantLayout title="Report a Problem">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </TenantLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["tenant"]}>
      <TenantLayout title="Report a Problem">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Report Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-emerald-600" />
                  New Report
                </CardTitle>
                <CardDescription>
                  Fill out the form below to report an issue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="property">Property</Label>
                    <Select
                      value={selectedProperty?.id.toString()}
                      onValueChange={handlePropertyChange}
                    >
                      <SelectTrigger id="property">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.name} - {property.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProperty && selectedProperty.problemOptions.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="problem">Problem Type *</Label>
                      <Select value={selectedProblem} onValueChange={setSelectedProblem}>
                        <SelectTrigger id="problem">
                          <SelectValue placeholder="Select problem type" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedProperty.problemOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id.toString()}>
                              {option.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedProperty &&
                    selectedProperty.floors_from !== null &&
                    selectedProperty.floors_to !== null && (
                      <div className="space-y-2">
                        <Label htmlFor="floor">Floor (Optional)</Label>
                        <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                          <SelectTrigger id="floor">
                            <SelectValue placeholder="Select floor" />
                          </SelectTrigger>
                          <SelectContent>
                            {generateFloorOptions().map((floor) => (
                              <SelectItem key={floor} value={floor.toString()}>
                                Floor {floor}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={loading || !selectedProperty || !selectedProblem}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* My Reports */}
            <Card>
              <CardHeader>
                <CardTitle>My Reports</CardTitle>
                <CardDescription>Track your submitted reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {myReports.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">
                      No reports submitted yet
                    </p>
                  ) : (
                    myReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 border border-slate-200 rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">
                              {report.problemOption.title}
                            </p>
                            <p className="text-sm text-slate-600">
                              {report.property.name}
                            </p>
                            {report.floor && (
                              <p className="text-xs text-slate-500">Floor {report.floor}</p>
                            )}
                          </div>
                          {getStatusBadge(report.status)}
                        </div>
                        {report.description && (
                          <p className="text-sm text-slate-600">{report.description}</p>
                        )}
                        <p className="text-xs text-slate-400">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TenantLayout>
    </ProtectedRoute>
  );
}
