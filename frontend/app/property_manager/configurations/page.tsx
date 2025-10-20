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
      toast.error("Gabim në marrjen e opsioneve të problemeve");
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
      toast.error("Gabim në marrjen e konfigurimeve të shpenzimeve");
    }
  };

  const fetchProperties = async () => {
    try {
      const data = await propertyAPI.getProperties();
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Gabim në marrjen e pronave");
      setProperties([]); // Ensure it's always an array
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error("Titulli është i detyrueshëm");
      return;
    }

    try {
      await problemOptionAPI.createProblemOption(formData);
      toast.success("Opsioni i problemit u krijua me sukses");
      setIsCreateOpen(false);
      setFormData({ title: "", description: "" });
      fetchProblemOptions();
    } catch (error) {
      console.error("Error creating problem option:", error);
      toast.error(error instanceof Error ? error.message : "Gabim në krijimin e opsionit të problemit");
    }
  };

  const handleUpdate = async () => {
    if (!selectedProblemOption || !formData.title.trim()) {
      toast.error("Titulli është i detyrueshëm");
      return;
    }

    try {
      await problemOptionAPI.updateProblemOption(selectedProblemOption.id, formData);
      toast.success("Opsioni i problemit u përditësua me sukses");
      setIsEditOpen(false);
      setSelectedProblemOption(null);
      setFormData({ title: "", description: "" });
      fetchProblemOptions();
    } catch (error) {
      console.error("Error updating problem option:", error);
      toast.error(error instanceof Error ? error.message : "Gabim në përditësimin e opsionit të problemit");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Jeni të sigurt që dëshironi të fshini këtë opsion problemi?")) {
      return;
    }

    try {
      await problemOptionAPI.deleteProblemOption(id);
      toast.success("Opsioni i problemit u fshi me sukses");
      fetchProblemOptions();
    } catch (error) {
      console.error("Error deleting problem option:", error);
      toast.error(error instanceof Error ? error.message : "Gabim në fshirjen e opsionit të problemit");
    }
  };

  const handleAssignToProperty = async () => {
    if (!selectedProperty) {
      toast.error("Ju lutem zgjidhni një pronë");
      return;
    }

    try {
      await problemOptionAPI.assignProblemOptionsToProperty(selectedProperty, {
        problemOptionIds: selectedProblemIds,
      });
      toast.success("Opsionet e problemeve u caktuan me sukses");
      setIsAssignOpen(false);
      setSelectedProperty(null);
      setSelectedProblemIds([]);
      fetchProblemOptions();
    } catch (error) {
      console.error("Error assigning problem options:", error);
      toast.error(error instanceof Error ? error.message : "Gabim në caktimin e opsioneve të problemeve");
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
      toast.error("Titulli është i detyrueshëm");
      return;
    }

    try {
      await spendingConfigAPI.createSpendingConfig(spendingFormData);
      toast.success("Konfigurimi i shpenzimeve u krijua me sukses");
      setIsCreateSpendingOpen(false);
      setSpendingFormData({ title: "", description: "" });
      fetchSpendingConfigs();
    } catch (error) {
      console.error("Error creating spending config:", error);
      toast.error(error instanceof Error ? error.message : "Gabim në krijimin e konfigurimit të shpenzimeve");
    }
  };

  const handleUpdateSpendingConfig = async () => {
    if (!selectedSpendingConfig || !spendingFormData.title.trim()) {
      toast.error("Titulli është i detyrueshëm");
      return;
    }

    try {
      await spendingConfigAPI.updateSpendingConfig(selectedSpendingConfig.id, spendingFormData);
      toast.success("Konfigurimi i shpenzimeve u përditësua me sukses");
      setIsEditSpendingOpen(false);
      setSelectedSpendingConfig(null);
      setSpendingFormData({ title: "", description: "" });
      fetchSpendingConfigs();
    } catch (error) {
      console.error("Error updating spending config:", error);
      toast.error(error instanceof Error ? error.message : "Gabim në përditësimin e konfigurimit të shpenzimeve");
    }
  };

  const handleDeleteSpendingConfig = async (id: number) => {
    if (!confirm("Jeni të sigurt që dëshironi të fshini këtë konfigurim shpenzimesh?")) {
      return;
    }

    try {
      await spendingConfigAPI.deleteSpendingConfig(id);
      toast.success("Konfigurimi i shpenzimeve u fshi me sukses");
      fetchSpendingConfigs();
    } catch (error) {
      console.error("Error deleting spending config:", error);
      toast.error(error instanceof Error ? error.message : "Gabim në fshirjen e konfigurimit të shpenzimeve");
    }
  };

  const handleAssignSpendingToProperty = async () => {
    if (!selectedSpendingProperty) {
      toast.error("Ju lutem zgjidhni një pronë");
      return;
    }

    try {
      await spendingConfigAPI.assignSpendingConfigsToProperty(selectedSpendingProperty, {
        spendingConfigIds: selectedSpendingIds,
      });
      toast.success("Konfigurimet e shpenzimeve u caktuan me sukses");
      setIsAssignSpendingOpen(false);
      setSelectedSpendingProperty(null);
      setSelectedSpendingIds([]);
      fetchSpendingConfigs();
    } catch (error) {
      console.error("Error assigning spending configs:", error);
      toast.error(error instanceof Error ? error.message : "Gabim në caktimin e konfigurimeve të shpenzimeve");
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
              <p className="text-slate-600">Po ngarkohet...</p>
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
                    <CardTitle>Opsionet e Problemeve</CardTitle>
                    <CardDescription>
                      Krijoni dhe menaxhoni llojet e problemeve që qiramarrësit mund të raportojnë
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Shto Opsion Problemi
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Krijo Opsion Problemi</DialogTitle>
                        <DialogDescription>
                          Shtoni një lloj të ri problemi që qiramarrësit mund të zgjedhin kur raportojnë çështje
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Titulli *</Label>
                          <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) =>
                                  setFormData({ ...formData, title: e.target.value })
                              }
                              placeholder="p.sh., Problem Hidraulik"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Përshkrimi</Label>
                          <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) =>
                                  setFormData({ ...formData, description: e.target.value })
                              }
                              placeholder="Përshkrim opsional..."
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
                          Anulo
                        </Button>
                        <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                          Krijo
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
                      <h3 className="mt-4 text-lg font-medium text-slate-900">Nuk ka opsione problemeësh</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Filloni duke krijuar një opsion problemi.
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
                                  {option.properties?.length || 0} Prona
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
                    <CardTitle>Konfigurimet e Shpenzimeve</CardTitle>
                    <CardDescription>
                      Menaxhoni limitet e shpenzimeve dhe konfigurimet për pronat
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateSpendingOpen} onOpenChange={setIsCreateSpendingOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Shto Konfigurim Shpenzimesh
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Krijo Konfigurim Shpenzimesh</DialogTitle>
                        <DialogDescription>
                          Vendosni një konfigurim të ri shpenzimesh për një pronë
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="spending-title">Titulli *</Label>
                          <Input
                              id="spending-title"
                              value={spendingFormData.title}
                              onChange={(e) =>
                                  setSpendingFormData({ ...spendingFormData, title: e.target.value })
                              }
                              placeholder="p.sh., Buxheti i Mirëmbajtjes"
                          />
                        </div>
                        <div>
                          <Label htmlFor="spending-description">Përshkrimi</Label>
                          <Textarea
                              id="spending-description"
                              value={spendingFormData.description}
                              onChange={(e) =>
                                  setSpendingFormData({ ...spendingFormData, description: e.target.value })
                              }
                              placeholder="Përshkrim opsional..."
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
                          Anulo
                        </Button>
                        <Button onClick={handleCreateSpendingConfig} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                          Krijo
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
                      <h3 className="mt-4 text-lg font-medium text-slate-900">Nuk ka konfigurime shpenzimesh</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Filloni duke krijuar një konfigurim shpenzimesh.
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
                                  {config.properties?.length || 0} Prona
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
                <CardTitle>Cakto te Pronat</CardTitle>
                <CardDescription>
                  Konfiguroni cilat opsione problemesh dhe konfigurime shpenzimesh janë në dispozicion për çdo pronë
                </CardDescription>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                    <p className="text-center text-slate-600 py-8">Nuk ka prona të disponueshme</p>
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
                                    Opsionet e Problemeve
                                  </Button>
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openAssignSpendingDialog(property.id)}
                                      className="border-green-200 text-green-700 hover:bg-green-50 w-full"
                                  >
                                    <Euro className="h-4 w-4 mr-1" />
                                    Shpenzimet
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
                  <DialogTitle>Ndrysho Opsionin e Problemit</DialogTitle>
                  <DialogDescription>
                    Përditësoni detajet e opsionit të problemit
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Titulli *</Label>
                    <Input
                        id="edit-title"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Përshkrimi</Label>
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
                    Anulo
                  </Button>
                  <Button onClick={handleUpdate} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                    Përditëso
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Assign Dialog */}
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
              <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cakto Opsionet e Problemeve</DialogTitle>
                  <DialogDescription>
                    Zgjidhni cilat opsione problemesh janë në dispozicion për këtë pronë
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {problemOptions.length === 0 ? (
                      <p className="text-sm text-slate-600">
                        Nuk ka opsione problemesh në dispozicion. Krijoni disa fillimisht.
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
                    Anulo
                  </Button>
                  <Button
                      onClick={handleAssignToProperty}
                      className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                  >
                    Ruaj Caktimin
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>


            {/* Edit Spending Config Dialog */}
            <Dialog open={isEditSpendingOpen} onOpenChange={setIsEditSpendingOpen}>
              <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Ndrysho Konfigurimin e Shpenzimeve</DialogTitle>
                  <DialogDescription>
                    Përditësoni detajet e konfigurimit të shpenzimeve
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-spending-title">Titulli *</Label>
                    <Input
                        id="edit-spending-title"
                        value={spendingFormData.title}
                        onChange={(e) =>
                            setSpendingFormData({ ...spendingFormData, title: e.target.value })
                        }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-spending-description">Përshkrimi</Label>
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
                    Anulo
                  </Button>
                  <Button onClick={handleUpdateSpendingConfig} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                    Përditëso
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Assign Spending Config Dialog */}
            <Dialog open={isAssignSpendingOpen} onOpenChange={setIsAssignSpendingOpen}>
              <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cakto Konfigurimet e Shpenzimeve</DialogTitle>
                  <DialogDescription>
                    Zgjidhni cilat konfigurime shpenzimesh janë në dispozicion për këtë pronë
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {spendingConfigs.length === 0 ? (
                      <p className="text-sm text-slate-600">
                        Nuk ka konfigurime shpenzimesh në dispozicion. Krijoni disa fillimisht.
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
                    Anulo
                  </Button>
                  <Button
                      onClick={handleAssignSpendingToProperty}
                      className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                  >
                    Ruaj Caktimin
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </PropertyManagerLayout>
      </ProtectedRoute>
  );
}

