"use client";

import { useState, useEffect } from "react";
import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Building2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { problemOptionAPI, ProblemOption } from "@/lib/problem-option-api";
import { propertyAPI, Property } from "@/lib/property-api";

export default function ConfigurationsPage() {
  const [problemOptions, setProblemOptions] = useState<ProblemOption[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedProblemOption, setSelectedProblemOption] = useState<ProblemOption | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchProblemOptions();
    fetchProperties();
  }, []);

  const fetchProblemOptions = async () => {
    try {
      const data = await problemOptionAPI.getMyProblemOptions();
      setProblemOptions(data);
    } catch (error) {
      console.error("Error fetching problem options:", error);
      toast.error("Error fetching problem options");
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const data = await propertyAPI.getProperties();
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Error fetching properties");
      setProperties([]); // Ensure it's always an array
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      await problemOptionAPI.createProblemOption(formData);
      toast.success("Problem option created successfully");
      setIsCreateOpen(false);
      setFormData({ title: "", description: "" });
      fetchProblemOptions();
    } catch (error) {
      console.error("Error creating problem option:", error);
      toast.error(error instanceof Error ? error.message : "Error creating problem option");
    }
  };

  const handleUpdate = async () => {
    if (!selectedProblemOption || !formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      await problemOptionAPI.updateProblemOption(selectedProblemOption.id, formData);
      toast.success("Problem option updated successfully");
      setIsEditOpen(false);
      setSelectedProblemOption(null);
      setFormData({ title: "", description: "" });
      fetchProblemOptions();
    } catch (error) {
      console.error("Error updating problem option:", error);
      toast.error(error instanceof Error ? error.message : "Error updating problem option");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this problem option?")) {
      return;
    }

    try {
      await problemOptionAPI.deleteProblemOption(id);
      toast.success("Problem option deleted successfully");
      fetchProblemOptions();
    } catch (error) {
      console.error("Error deleting problem option:", error);
      toast.error(error instanceof Error ? error.message : "Error deleting problem option");
    }
  };

  const handleAssignToProperty = async () => {
    if (!selectedProperty) {
      toast.error("Please select a property");
      return;
    }

    try {
      await problemOptionAPI.assignProblemOptionsToProperty(selectedProperty, {
        problemOptionIds: selectedProblemIds,
      });
      toast.success("Problem options assigned successfully");
      setIsAssignOpen(false);
      setSelectedProperty(null);
      setSelectedProblemIds([]);
      fetchProblemOptions();
    } catch (error) {
      console.error("Error assigning problem options:", error);
      toast.error(error instanceof Error ? error.message : "Error assigning problem options");
    }
  };

  const openEditDialog = (option: ProblemOption) => {
    setSelectedProblemOption(option);
    setFormData({
      title: option.title,
      description: option.description || "",
    });
    setIsEditOpen(true);
  };

  const openAssignDialog = async (propertyId: number) => {
    setSelectedProperty(propertyId);

    // Fetch current problem options for this property
    try {
      const data = await problemOptionAPI.getPropertyProblemOptions(propertyId);
      setSelectedProblemIds(data.map((opt) => opt.id));
    } catch (error) {
      console.error("Error fetching property problem options:", error);
    }

    setIsAssignOpen(true);
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["property_manager"]}>
        <PropertyManagerLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-600">Loading...</p>
          </div>
        </PropertyManagerLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["property_manager"]}>
      <PropertyManagerLayout>
        <div className="space-y-6">
          {/* Problem Options Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Problem Options</CardTitle>
                  <CardDescription>
                    Create and manage problem types that tenants can report
                  </CardDescription>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Problem Option
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Problem Option</DialogTitle>
                      <DialogDescription>
                        Add a new problem type that tenants can select when reporting issues
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="e.g., Plumbing Issue"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="Optional description..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreateOpen(false);
                          setFormData({ title: "", description: "" });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {problemOptions.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-4 text-lg font-medium text-slate-900">No problem options</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Get started by creating a problem option.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {problemOptions.map((option) => (
                    <Card key={option.id} className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base">{option.title}</CardTitle>
                        {option.description && (
                          <CardDescription className="text-sm">
                            {option.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                            {option.properties?.length || 0} Properties
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(option)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(option.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Assignment Section */}
          <Card>
            <CardHeader>
              <CardTitle>Assign to Properties</CardTitle>
              <CardDescription>
                Configure which problem options are available for each property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <p className="text-center text-slate-600 py-8">No properties available</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {properties.map((property) => (
                    <Card key={property.id} className="border-slate-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {property.name}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {property.address}
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAssignDialog(property.id)}
                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          >
                            Configure
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Problem Option</DialogTitle>
                <DialogDescription>
                  Update the problem option details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedProblemOption(null);
                    setFormData({ title: "", description: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdate} className="bg-indigo-600 hover:bg-indigo-700">
                  Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Assign Dialog */}
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Problem Options</DialogTitle>
                <DialogDescription>
                  Select which problem options are available for this property
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {problemOptions.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    No problem options available. Create some first.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {problemOptions.map((option) => (
                      <div key={option.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={`option-${option.id}`}
                          checked={selectedProblemIds.includes(option.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProblemIds([...selectedProblemIds, option.id]);
                            } else {
                              setSelectedProblemIds(
                                selectedProblemIds.filter((id) => id !== option.id)
                              );
                            }
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`option-${option.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {option.title}
                          </label>
                          {option.description && (
                            <p className="text-sm text-slate-600">
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAssignOpen(false);
                    setSelectedProperty(null);
                    setSelectedProblemIds([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignToProperty}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Assignment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PropertyManagerLayout>
    </ProtectedRoute>
  );
}
