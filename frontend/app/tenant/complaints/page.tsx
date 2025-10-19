"use client";

import { TenantLayout } from "@/components/layouts/TenantLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, Clock, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Property {
  id: number;
  name: string;
  address: string;
}

interface Complaint {
  id: number;
  property_id: number;
  title: string;
  description: string;
  response: string;
  status: string;
  created_at: string;
  property: {
    name: string;
    address: string;
  };
}

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);

  // Fetch properties and complaints
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/complaints/properties`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setProperties(data.properties);
          // Automatically select the first (and only) property for the tenant
          if (data.properties.length > 0) {
            setSelectedProperty(data.properties[0].id.toString());
          }
        } else {
          console.error("Failed to fetch properties:", response.status);
          toast.error("Failed to load properties");
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast.error("Failed to load properties");
      } finally {
        setFetchingData(false);
      }
    };

    const fetchMyComplaints = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/complaints/my-complaints`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setMyComplaints(data.complaints);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };

    if (user) {
      fetchProperties();
      fetchMyComplaints();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProperty || !title.trim()) {
      toast.error("Please select a property and enter a title");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          property_id: parseInt(selectedProperty),
          title: title.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Complaint submitted successfully!");
        // Don't reset selectedProperty since it's auto-selected
        setTitle("");
        setDescription("");

        // Refresh complaints list
        const complaintsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/complaints/my-complaints`, {
          credentials: 'include',
        });
        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json();
          setMyComplaints(complaintsData.complaints);
        }
      } else {
        toast.error(data.message || "Failed to submit complaint");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Failed to submit complaint");
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
            <AlertTriangle className="mr-1 h-3 w-3" />
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
        <TenantLayout title="My Complaints">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </TenantLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["tenant"]}>
      <TenantLayout title="My Complaints">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Complaint Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                  File a Complaint
                </CardTitle>
                <CardDescription>
                  Submit a complaint about your property
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="property">Property</Label>
                    <Select
                      value={selectedProperty}
                      onValueChange={setSelectedProperty}
                      disabled
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

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Brief description of your complaint"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={255}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide more details about your complaint..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Complaint"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>About Complaints</CardTitle>
                <CardDescription>How the complaint process works</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">When to file a complaint:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Issues with property management</li>
                    <li>Maintenance concerns</li>
                    <li>Noise or disturbances</li>
                    <li>Facility problems</li>
                    <li>Any other concerns</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Status meanings:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusBadge("pending")}
                      <span className="text-muted-foreground">Awaiting review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge("in_progress")}
                      <span className="text-muted-foreground">Being addressed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge("resolved")}
                      <span className="text-muted-foreground">Issue resolved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge("rejected")}
                      <span className="text-muted-foreground">Unable to process</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Complaints */}
          <Card>
            <CardHeader>
              <CardTitle>My Complaints</CardTitle>
              <CardDescription>
                Track the status of your submitted complaints
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myComplaints.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No complaints submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myComplaints.map((complaint) => (
                    <Card key={complaint.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-1 flex-1">
                            <h3 className="font-semibold">{complaint.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {complaint.property.name}
                            </p>
                            {complaint.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {complaint.description}
                              </p>
                            )}
                            {complaint.response && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                                <p className="text-xs font-semibold text-blue-900 mb-1">Property Manager Response:</p>
                                <p className="text-sm text-blue-800">
                                  {complaint.response}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            {getStatusBadge(complaint.status)}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-3">
                          Submitted on {format(new Date(complaint.created_at), "PPp")}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TenantLayout>
    </ProtectedRoute>
  );
}
