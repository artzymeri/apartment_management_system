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
import { Plus, Pencil, Trash2, Building2, AlertCircle, Euro } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { problemOptionAPI, ProblemOption } from "@/lib/problem-option-api";
import { spendingConfigAPI, SpendingConfig } from "@/lib/spending-config-api";
import { propertyAPI, Property } from "@/lib/property-api";

export default function ConfigurationsPage() {
  const [problemOptions, setProblemOptions] = useState<ProblemOption[]>([]);
  const [spendingConfigs, setSpendingConfigs] = useState<SpendingConfig[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Problem Options state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedProblemOption, setSelectedProblemOption] = useState<ProblemOption | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);

  // Spending Configs state
  const [isCreateSpendingOpen, setIsCreateSpendingOpen] = useState(false);
  const [isEditSpendingOpen, setIsEditSpendingOpen] = useState(false);
  const [isAssignSpendingOpen, setIsAssignSpendingOpen] = useState(false);
  const [selectedSpendingConfig, setSelectedSpendingConfig] = useState<SpendingConfig | null>(null);
  const [selectedSpendingProperty, setSelectedSpendingProperty] = useState<number | null>(null);
  const [selectedSpendingIds, setSelectedSpendingIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [spendingFormData, setSpendingFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchProblemOptions();
    fetchSpendingConfigs();
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

  const fetchSpendingConfigs = async () => {
    try {
      const data = await spendingConfigAPI.getMySpendingConfigs();
      setSpendingConfigs(data);
    } catch (error) {
      console.error("Error fetching spending configs:", error);
      toast.error("Error fetching spending configs");
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

  const handleCreateSpendingConfig = async () => {
    if (!spendingFormData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      await spendingConfigAPI.createSpendingConfig(spendingFormData);
      toast.success("Spending config created successfully");
      setIsCreateSpendingOpen(false);
      setSpendingFormData({ title: "", description: "" });
      fetchSpendingConfigs();
    } catch (error) {
      console.error("Error creating spending config:", error);
      toast.error(error instanceof Error ? error.message : "Error creating spending config");
    }
  };

  const handleUpdateSpendingConfig = async () => {
    if (!selectedSpendingConfig || !spendingFormData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      await spendingConfigAPI.updateSpendingConfig(selectedSpendingConfig.id, spendingFormData);
      toast.success("Spending config updated successfully");
      setIsEditSpendingOpen(false);
      setSelectedSpendingConfig(null);
      setSpendingFormData({ title: "", description: "" });
      fetchSpendingConfigs();
    } catch (error) {
      console.error("Error updating spending config:", error);
      toast.error(error instanceof Error ? error.message : "Error updating spending config");
    }
  };

  const handleDeleteSpendingConfig = async (id: number) => {
    if (!confirm("Are you sure you want to delete this spending config?")) {
      return;
    }

    try {
      await spendingConfigAPI.deleteSpendingConfig(id);
      toast.success("Spending config deleted successfully");
      fetchSpendingConfigs();
    } catch (error) {
      console.error("Error deleting spending config:", error);
      toast.error(error instanceof Error ? error.message : "Error deleting spending config");
    }
  };

  const handleAssignSpendingToProperty = async () => {
    if (!selectedSpendingProperty) {
      toast.error("Please select a property");
      return;
    }

    try {
      await spendingConfigAPI.assignSpendingConfigsToProperty(selectedSpendingProperty, {
        spendingConfigIds: selectedSpendingIds,
      });
      toast.success("Spending configs assigned successfully");
      setIsAssignSpendingOpen(false);
      setSelectedSpendingProperty(null);
      setSelectedSpendingIds([]);
      fetchSpendingConfigs();
    } catch (error) {
      console.error("Error assigning spending configs:", error);
      toast.error(error instanceof Error ? error.message : "Error assigning spending configs");
    }
  };

  const openEditSpendingDialog = (config: SpendingConfig) => {
    setSelectedSpendingConfig(config);
    setSpendingFormData({
      title: config.title,
      description: config.description || "",
    });
    setIsEditSpendingOpen(true);
  };

  const openAssignSpendingDialog = async (propertyId: number) => {
    setSelectedSpendingProperty(propertyId);

    // Fetch current spending configs for this property
    try {
      const data = await spendingConfigAPI.getPropertySpendingConfigs(propertyId);
      setSelectedSpendingIds(data.map((config) => config.id));
    } catch (error) {
      console.error("Error fetching property spending configs:", error);
    }

    setIsAssignSpendingOpen(true);
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
              <div className="flex flex-col gap-4">
                <div>
                  <CardTitle>Problem Options</CardTitle>
                  <CardDescription>
                    Create and manage problem types that tenants can report
                  </CardDescription>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Problem Option
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
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
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreateOpen(false);
                          setFormData({ title: "", description: "" });
                        }}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

          {/* Spending Configurations Section */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div>
                  <CardTitle>Spending Configurations</CardTitle>
                  <CardDescription>
                    Manage spending limits and configurations for properties
                  </CardDescription>
                </div>
                <Dialog open={isCreateSpendingOpen} onOpenChange={setIsCreateSpendingOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Spending Config
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create Spending Config</DialogTitle>
                      <DialogDescription>
                        Set up a new spending configuration for a property
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="spending-title">Title *</Label>
                        <Input
                          id="spending-title"
                          value={spendingFormData.title}
                          onChange={(e) =>
                            setSpendingFormData({ ...spendingFormData, title: e.target.value })
                          }
                          placeholder="e.g., Maintenance Budget"
                        />
                      </div>
                      <div>
                        <Label htmlFor="spending-description">Description</Label>
                        <Textarea
                          id="spending-description"
                          value={spendingFormData.description}
                          onChange={(e) =>
                            setSpendingFormData({ ...spendingFormData, description: e.target.value })
                          }
                          placeholder="Optional description..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreateSpendingOpen(false);
                          setSpendingFormData({ title: "", description: "" });
                        }}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateSpendingConfig} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {spendingConfigs.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-4 text-lg font-medium text-slate-900">No spending configs</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Get started by creating a spending config.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {spendingConfigs.map((config) => (
                    <Card key={config.id} className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base">{config.title}</CardTitle>
                        {config.description && (
                          <CardDescription className="text-sm">
                            {config.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                            {config.properties?.length || 0} Properties
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditSpendingDialog(config)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSpendingConfig(config.id)}
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
                Configure which problem options and spending configs are available for each property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <p className="text-center text-slate-600 py-8">No properties available</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {properties.map((property) => (
                    <Card key={property.id} className="border-slate-200">
                      <CardHeader>
                        <div className="flex flex-col gap-3">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              <Building2 className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{property.name}</span>
                            </CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {property.address}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAssignDialog(property.id)}
                              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 w-full"
                            >
                              Problem Options
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAssignSpendingDialog(property.id)}
                              className="border-green-200 text-green-700 hover:bg-green-50 w-full"
                            >
                              <Euro className="h-4 w-4 mr-1" />
                              Spending
                            </Button>
                          </div>
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
            <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
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
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedProblemOption(null);
                    setFormData({ title: "", description: "" });
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdate} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                  Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Assign Dialog */}
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
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
                        <div className="grid gap-1.5 leading-none flex-1">
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
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAssignOpen(false);
                    setSelectedProperty(null);
                    setSelectedProblemIds([]);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignToProperty}
                  className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                >
                  Save Assignment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>


          {/* Edit Spending Config Dialog */}
          <Dialog open={isEditSpendingOpen} onOpenChange={setIsEditSpendingOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Spending Config</DialogTitle>
                <DialogDescription>
                  Update the spending config details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-spending-title">Title *</Label>
                  <Input
                    id="edit-spending-title"
                    value={spendingFormData.title}
                    onChange={(e) =>
                      setSpendingFormData({ ...spendingFormData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-spending-description">Description</Label>
                  <Textarea
                    id="edit-spending-description"
                    value={spendingFormData.description}
                    onChange={(e) =>
                      setSpendingFormData({ ...spendingFormData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditSpendingOpen(false);
                    setSelectedSpendingConfig(null);
                    setSpendingFormData({ title: "", description: "" });
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateSpendingConfig} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                  Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Assign Spending Config Dialog */}
          <Dialog open={isAssignSpendingOpen} onOpenChange={setIsAssignSpendingOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Assign Spending Configurations</DialogTitle>
                <DialogDescription>
                  Select which spending configurations are available for this property
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {spendingConfigs.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    No spending configs available. Create some first.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {spendingConfigs.map((config) => (
                      <div key={config.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={`spending-config-${config.id}`}
                          checked={selectedSpendingIds.includes(config.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSpendingIds([...selectedSpendingIds, config.id]);
                            } else {
                              setSelectedSpendingIds(
                                selectedSpendingIds.filter((id) => id !== config.id)
                              );
                            }
                          }}
                        />
                        <div className="grid gap-1.5 leading-none flex-1">
                          <label
                            htmlFor={`spending-config-${config.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {config.title}
                          </label>
                          {config.description && (
                            <p className="text-sm text-slate-600">
                              {config.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAssignSpendingOpen(false);
                    setSelectedSpendingProperty(null);
                    setSelectedSpendingIds([]);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignSpendingToProperty}
                  className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
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
