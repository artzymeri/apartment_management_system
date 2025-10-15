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

  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        number: user.number || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password fields if changing password
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        toast.error("Current password is required to change password");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
      if (formData.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters");
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
        toast.success("Profile updated successfully");

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
        toast.error(error.message || "Failed to update profile");
      },
    });
  };

  const SettingsContent = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Personal Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="inline h-4 w-4 mr-1" />
                    First Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    required
                    disabled={updateProfileMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surname">
                    <User className="inline h-4 w-4 mr-1" />
                    Last Name
                  </Label>
                  <Input
                    id="surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
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
                  placeholder="Enter your email"
                  required
                  disabled={updateProfileMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number
                </Label>
                <Input
                  id="number"
                  name="number"
                  type="tel"
                  value={formData.number}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  disabled={updateProfileMutation.isPending}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </h3>
                <p className="text-sm text-slate-600">
                  Leave blank if you don't want to change your password
                </p>

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter current password"
                    disabled={updateProfileMutation.isPending}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={updateProfileMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={updateProfileMutation.isPending}>
                  {!updateProfileMutation.isPending && <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render with appropriate layout based on user role
  if (!user) {
    return null;
  }

  if (user.role === "admin") {
    return (
      <AdminLayout>
        <SettingsContent />
      </AdminLayout>
    );
  }

  if (user.role === "property_manager") {
    return (
      <PropertyManagerLayout>
        <SettingsContent />
      </PropertyManagerLayout>
    );
  }

  return (
    <TenantLayout>
      <SettingsContent />
    </TenantLayout>
  );
}
