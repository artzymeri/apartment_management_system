"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Lock, Save } from "lucide-react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { TenantLayout } from "@/components/layouts/TenantLayout";
import { toast } from "sonner";
import { useUpdateOwnProfile } from "@/hooks/useUsers";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const updateProfileMutation = useUpdateOwnProfile();

  const [formData, setFormData] = React.useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
    number: user?.number || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    if (user && !isInitialized) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        number: user.number || "",
      }));
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate password fields if changing password
      if (formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword) {
          toast.error("Fjalëkalimi aktual është i nevojshëm për të ndryshuar fjalëkalimin");
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error("Fjalëkalimet e reja nuk përputhen");
          return;
        }
        if (formData.newPassword.length < 6) {
          toast.error("Fjalëkalimi i ri duhet të jetë të paktën 6 karaktere");
          return;
        }
      }

      // Prepare update data
      const updateData: {
        name: string;
        surname: string;
        email: string;
        number: string;
        password?: string;
        currentPassword?: string;
      } = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        number: formData.number,
      };

      // Add password fields if changing
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
        updateData.currentPassword = formData.currentPassword;
      }

      updateProfileMutation.mutate(updateData, {
        onSuccess: () => {
          toast.success("Profili u përditësua me sukses");

          // Clear password fields
          setFormData((prev) => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));

          // Refresh user data
          updateProfile();
        },
        onError: (error: Error) => {
          toast.error(error.message || "Dështoi përditësimi i profilit");
        },
      });
    },
    [formData, updateProfileMutation, updateProfile]
  );

  const SettingsContent = React.useMemo(
    () => (
      <div className="space-y-6">
        <div className="grid gap-6">
          {/* Personal Information Form */}
          <Card>
            <CardHeader>
              <CardTitle>Informacioni Personal</CardTitle>
              <CardDescription>
                Përditëso detajet e tua personale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="inline h-4 w-4 mr-1" />
                      Emri
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Shkruaj emrin tënd"
                      required
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="surname">
                      <User className="inline h-4 w-4 mr-1" />
                      Mbiemri
                    </Label>
                    <Input
                      id="surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      placeholder="Shkruaj mbiemrin tënd"
                      required
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Shkruaj email-in tënd"
                    required
                    disabled={updateProfileMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Numri i Telefonit
                  </Label>
                  <Input
                    id="number"
                    name="number"
                    type="tel"
                    value={formData.number}
                    onChange={handleInputChange}
                    placeholder="Shkruaj numrin e telefonit"
                    disabled={updateProfileMutation.isPending}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Ndrysho Fjalëkalimin
                  </h3>
                  <p className="text-sm text-slate-600">
                    Lëre bosh nëse nuk dëshiron të ndryshosh fjalëkalimin
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Fjalëkalimi Aktual</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Shkruaj fjalëkalimin aktual"
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Fjalëkalimi i Ri</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Shkruaj fjalëkalimin e ri"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Konfirmo Fjalëkalimin</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Konfirmo fjalëkalimin e ri"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={updateProfileMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    Anulo
                  </Button>
                  <Button type="submit" isLoading={updateProfileMutation.isPending} className="w-full sm:w-auto">
                    {!updateProfileMutation.isPending && <Save className="mr-2 h-4 w-4" />}
                    Ruaj Ndryshimet
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
    [formData, handleInputChange, handleSubmit, updateProfileMutation.isPending, router]
  );

  // Render with appropriate layout based on user role
  if (!user) {
    return null;
  }

  if (user.role === "admin") {
    return (
      <AdminLayout title="Cilësimet e Profilit">
        {SettingsContent}
      </AdminLayout>
    );
  }

  if (user.role === "property_manager") {
    return (
      <PropertyManagerLayout title="Cilësimet e Profilit">
        {SettingsContent}
      </PropertyManagerLayout>
    );
  }

  return (
    <TenantLayout title="Cilësimet e Profilit">
      {SettingsContent}
    </TenantLayout>
  );
}
