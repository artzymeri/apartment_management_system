"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUser, useUpdateUser } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCog, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);

  const { data: userData, isLoading } = useUser(userId);
  const updateMutation = useUpdateUser();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    number: "",
    role: "tenant" as "admin" | "property_manager" | "tenant",
  });
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (userData?.success && userData.data) {
      const user = userData.data;
      setFormData({
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: "",
        confirmPassword: "",
        number: user.number || "",
        role: user.role,
      });

      // Set expiry date if exists
      if (user.expiry_date) {
        setExpiryDate(new Date(user.expiry_date));
      } else {
        setExpiryDate(undefined);
      }
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validation
    const newErrors: string[] = [];
    if (!formData.name.trim()) newErrors.push("Emri është i nevojshëm");
    if (!formData.surname.trim()) newErrors.push("Mbiemri është i nevojshëm");
    if (!formData.email.trim()) newErrors.push("Email është i nevojshëm");
    if (formData.password && formData.password.length < 6) {
      newErrors.push("Fjalëkalimi duhet të jetë të paktën 6 karaktere");
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.push("Fjalëkalimet nuk përputhen");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      newErrors.forEach((error) => toast.error(error));
      return;
    }

    try {
      const updateData: any = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        number: formData.number || null,
        role: formData.role,
      };

      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Add expiry_date for property_manager users
      if (formData.role === 'property_manager') {
        updateData.expiry_date = expiryDate ? format(expiryDate, 'yyyy-MM-dd') : null;
      }

      const result = await updateMutation.mutateAsync({
        id: userId,
        data: updateData,
      });

      if (result.success) {
        toast.success("Përdoruesi u përditësua me sukses");
        router.push("/admin/users");
      } else {
        setErrors([result.message || "Dështoi përditësimi i përdoruesit"]);
        toast.error(result.message || "Dështoi përditësimi i përdoruesit");
      }
    } catch (err: any) {
      setErrors([err.message || "Dështoi përditësimi i përdoruesit"]);
      toast.error(err.message || "Dështoi përditësimi i përdoruesit");
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout title="Modifiko Përdoruesin">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!userData?.success || !userData?.data) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout title="Modifiko Përdoruesin">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Përdoruesi Nuk u Gjet
              </h2>
              <p className="text-slate-600 mt-2">
                Përdoruesi që po përpiqeni të modifikoni nuk ekziston.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/admin/users")}
              >
                Kthehu te Përdoruesit
              </Button>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminLayout title="Modifiko Përdoruesin">
        <div className="space-y-6 max-w-2xl">

          {/* Error Alert */}
          {errors.length > 0 && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* Heroicon name: mini/x-mark */}
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9.586L4.293 3.879 3.879 4.293 9.586 10l-5.707 5.707 0.414 0.414L10 10.414l5.707 5.707 0.414-0.414L10.414 10l5.707-5.707-0.414-0.414L10 9.586z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Ju lutem korrigjoni gabimet e mëposhtme:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Informacioni i Përdoruesit
              </CardTitle>
              <CardDescription>
                Përditëso detajet e përdoruesit (lëre fjalëkalimin bosh për ta mbajtur aktualin)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Emri <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Shkruaj emrin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="surname">
                      Mbiemri <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="surname"
                      value={formData.surname}
                      onChange={(e) =>
                        setFormData({ ...formData, surname: e.target.value })
                      }
                      placeholder="Shkruaj mbiemrin"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Shkruaj adresën e email-it"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Numri i Telefonit</Label>
                  <Input
                    id="number"
                    type="tel"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    placeholder="Shkruaj numrin e telefonit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">
                    Roli <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    key={`role-${formData.role}`}
                    value={formData.role}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, role: value })
                    }
                    disabled
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Zgjidh një rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant">Qiramarrës</SelectItem>
                      <SelectItem value="property_manager">Menaxher Pronash</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-500">
                    Roli nuk mund të ndryshohet pas krijimit të përdoruesit
                  </p>
                </div>

                {/* Expiry Date for Property Manager Users */}
                {formData.role === 'property_manager' && (
                  <div className="space-y-2 border-t pt-4">
                    <Label htmlFor="expiry-date">Data e Skadimit të Llogarisë</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !expiryDate && "text-slate-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expiryDate ? format(expiryDate, "PPP") : "Zgjidh një datë"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={expiryDate}
                          onSelect={setExpiryDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-sm text-slate-500">
                      Ky përdorues nuk do të mund të hyjë pas kësaj date.
                      {expiryDate && (
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto p-0 ml-2 text-red-600"
                          onClick={() => setExpiryDate(undefined)}
                        >
                          Fshi datën
                        </Button>
                      )}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-slate-600 mb-4">
                    Ndrysho Fjalëkalimin (opsionale - lëre bosh për ta mbajtur fjalëkalimin aktual)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Fjalëkalimi i Ri</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Shkruaj fjalëkalimin e ri"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Konfirmo Fjalëkalimin e Ri</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Shkruaj përsëri fjalëkalimin e ri"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                    isLoading={updateMutation.isPending}
                  >
                    Përditëso Përdoruesin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full sm:w-auto"
                  >
                    Anulo
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
