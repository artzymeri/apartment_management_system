"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCities, useCreateCity, useDeleteCity, useUpdateCity } from "@/hooks/useCities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, MapPin, Loader2, Pencil, Settings } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ConfigurationsPage() {
  const [newCityName, setNewCityName] = useState("");
  const [isAddCityDialogOpen, setIsAddCityDialogOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState<{ id: number; name: string } | null>(null);
  const [cityToEdit, setCityToEdit] = useState<{ id: number; name: string } | null>(null);
  const [editCityName, setEditCityName] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCitiesDialogOpen, setIsCitiesDialogOpen] = useState(false);

  const { data: citiesData, isLoading } = useCities();
  const createMutation = useCreateCity();
  const deleteMutation = useDeleteCity();
  const updateMutation = useUpdateCity();

  const cities = citiesData?.data || [];

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCityName.trim()) {
      toast.error("Emri i qytetit është i nevojshëm");
      return;
    }

    try {
      const result = await createMutation.mutateAsync(newCityName.trim());

      if (result.success) {
        setNewCityName("");
        setIsAddCityDialogOpen(false);
        toast.success("Qyteti u shtua me sukses!");
      } else {
        toast.error(result.message || "Dështoi shtimi i qytetit");
      }
    } catch (err) {
      console.error("Create city error:", err);
      toast.error("Dështoi lidhja me serverin");
    }
  };

  const handleDeleteCity = async () => {
    if (!cityToDelete) return;

    try {
      const result = await deleteMutation.mutateAsync(cityToDelete.id);

      if (result.success) {
        setCityToDelete(null);
        toast.success("Qyteti u fshi me sukses!");
      } else {
        setCityToDelete(null);
        toast.error(result.message || "Dështoi fshirja e qytetit");
      }
    } catch (err) {
      console.error("Delete city error:", err);
      setCityToDelete(null);
      toast.error("Dështoi lidhja me serverin");
    }
  };

  const handleUpdateCity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editCityName.trim()) {
      toast.error("Emri i qytetit është i nevojshëm");
      return;
    }

    if (!cityToEdit) {
      toast.error("Nuk është zgjedhur qytet për editim");
      return;
    }

    try {
      const result = await updateMutation.mutateAsync({ id: cityToEdit.id, name: editCityName.trim() });

      if (result.success) {
        setEditCityName("");
        setCityToEdit(null);
        setIsEditDialogOpen(false);
        toast.success("Qyteti u përditësua me sukses!");
      } else {
        toast.error(result.message || "Dështoi përditësimi i qytetit");
      }
    } catch (err) {
      console.error("Update city error:", err);
      toast.error("Dështoi lidhja me serverin");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Configuration Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Cities Configuration Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-red-200" onClick={() => setIsCitiesDialogOpen(true)}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Qytetet</CardTitle>
                    <CardDescription className="text-sm">
                      {isLoading ? "Duke u ngarkuar..." : `${cities.length} qytete`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Menaxho listën e qyteteve të disponueshme për pronat
                </p>
                <Button
                  className="w-full mt-4 bg-red-600 hover:bg-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCitiesDialogOpen(true);
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Menaxho Qytetet
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Cities Management Dialog */}
          <Dialog open={isCitiesDialogOpen} onOpenChange={setIsCitiesDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Menaxhimi i Qyteteve
                </DialogTitle>
                <DialogDescription>
                  Menaxho listën e qyteteve të disponueshme për pronat
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="flex justify-end mb-4">
                  <Dialog open={isAddCityDialogOpen} onOpenChange={setIsAddCityDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700 gap-2">
                        <Plus className="h-4 w-4" />
                        Shto Qytet
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleCreateCity}>
                        <DialogHeader>
                          <DialogTitle>Shto Qytet të Ri</DialogTitle>
                          <DialogDescription>
                            Vendos emrin e qytetit që dëshiron të shtosh në sistem.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label htmlFor="cityName">Emri i Qytetit</Label>
                          <Input
                            id="cityName"
                            placeholder="p.sh., Prishtina"
                            value={newCityName}
                            onChange={(e) => setNewCityName(e.target.value)}
                            className="mt-2"
                            disabled={createMutation.isPending}
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddCityDialogOpen(false)}
                            disabled={createMutation.isPending}
                          >
                            Anulo
                          </Button>
                          <Button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700"
                            disabled={createMutation.isPending}
                          >
                            Shto Qytet
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : cities.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Nuk u gjetën qytete. Shto qytetin e parë për të filluar.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">ID</TableHead>
                          <TableHead>Emri i Qytetit</TableHead>
                          <TableHead className="text-right">Veprime</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cities.map((city) => (
                          <TableRow key={city.id}>
                            <TableCell className="font-medium">{city.id}</TableCell>
                            <TableCell>{city.name}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCityToEdit({ id: city.id, name: city.name });
                                    setEditCityName(city.name);
                                    setIsEditDialogOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCityToDelete({ id: city.id, name: city.name })}
                                  disabled={deleteMutation.isPending}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!cityToDelete} onOpenChange={() => setCityToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Jeni i sigurt?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ky veprim do të fshijë përgjithmonë qytetin &quot;{cityToDelete?.name}&quot;.
                  Ky veprim nuk mund të zhbëhet.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteMutation.isPending}>
                  Anulo
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCity}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Duke fshirë...
                    </>
                  ) : (
                    "Fshi"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Edit City Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <form onSubmit={handleUpdateCity}>
                <DialogHeader>
                  <DialogTitle>Edito Qytetin</DialogTitle>
                  <DialogDescription>
                    Përditëso emrin e qytetit në sistem.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="editCityName">Emri i Qytetit</Label>
                  <Input
                    id="editCityName"
                    placeholder="p.sh., Prishtina"
                    value={editCityName}
                    onChange={(e) => setEditCityName(e.target.value)}
                    className="mt-2"
                    disabled={updateMutation.isPending}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={updateMutation.isPending}
                  >
                    Anulo
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={updateMutation.isPending}
                  >
                    Përditëso Qytetin
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
