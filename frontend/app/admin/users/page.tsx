"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import { User } from "@/lib/user-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Users, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
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

export default function UsersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    role: "",
    page: 1,
    limit: 10,
  });
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data, isLoading } = useUsers(appliedFilters);
  const deleteMutation = useDeleteUser();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters((prev) => ({
        ...prev,
        search: searchTerm,
        page: 1,
      }));
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply role filter immediately on change
  useEffect(() => {
    setAppliedFilters((prev) => ({
      ...prev,
      role: selectedRoles.join(','),
      page: 1,
    }));
    setCurrentPage(1);
  }, [selectedRoles]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setAppliedFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const result = await deleteMutation.mutateAsync(userToDelete.id);
      if (result.success) {
        toast.success(`User ${userToDelete.name} deleted successfully`);
        setUserToDelete(null);
      } else {
        toast.error(`Failed to delete user ${userToDelete.name}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("An error occurred while deleting the user");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "property_manager":
        return "default";
      case "tenant":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const capitalizeRole = (role: string) => {
    if (role === "property_manager") return "Property Manager";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const isExpired = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    return expiry < today;
  };

  const isExpiringSoon = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    // Check if expiry date is within 3 days from now
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    return expiry >= today && expiry <= threeDaysFromNow;
  };

  const getRowClassName = (user: User) => {
    if (user.role !== 'property_manager') return '';

    if (isExpired(user.expiry_date)) {
      return 'bg-red-50'; // Expired - stronger red
    } else if (isExpiringSoon(user.expiry_date)) {
      return 'bg-red-50/30'; // Expiring soon - subtle red
    }

    return '';
  };

  const users = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Filters */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Filter Users
              </CardTitle>
              <CardDescription>
                Search by name, surname, email or filter by role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, surname, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Role Checkboxes */}
                <div className="space-y-3 md:space-y-0 md:flex md:items-center md:gap-6 pt-2">
                  <Label className="text-sm font-medium">Filter by Role:</Label>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-admin"
                        checked={selectedRoles.includes("admin")}
                        onCheckedChange={() => handleRoleToggle("admin")}
                      />
                      <Label
                        htmlFor="role-admin"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Admin
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-property_manager"
                        checked={selectedRoles.includes("property_manager")}
                        onCheckedChange={() => handleRoleToggle("property_manager")}
                      />
                      <Label
                        htmlFor="role-property_manager"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Property Manager
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-tenant"
                        checked={selectedRoles.includes("tenant")}
                        onCheckedChange={() => handleRoleToggle("tenant")}
                      />
                      <Label
                        htmlFor="role-tenant"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Tenant
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table - Desktop */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Users className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No users found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: User) => (
                      <TableRow key={user.id} className={getRowClassName(user)}>
                        <TableCell className="font-medium">
                          {user.name} {user.surname}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.number || (
                            <span className="text-slate-400 text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role) as any}>
                            {capitalizeRole(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.role === 'property_manager' && user.expiry_date ? (
                            <span className="text-sm">{formatDate(user.expiry_date)}</span>
                          ) : user.role === 'property_manager' ? (
                            <span className="text-slate-400 text-sm">No expiry set</span>
                          ) : (
                            <span className="text-slate-400 text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.role === 'property_manager' && user.expiry_date ? (
                            isExpired(user.expiry_date) ? (
                              <Badge variant="destructive" className="w-fit">
                                Expired
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="w-fit text-green-700 border-green-300">
                                Active
                              </Badge>
                            )
                          ) : user.role === 'property_manager' ? (
                            <Badge variant="outline" className="w-fit text-green-700 border-green-300">
                              Active
                            </Badge>
                          ) : (
                            <span className="text-slate-400 text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(`/admin/users/edit/${user.id}`)
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setUserToDelete(user)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Users Cards - Mobile */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
              </div>
            ) : users.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Users className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              users.map((user: User) => (
                <Card key={user.id} className={getRowClassName(user)}>
                  <CardContent className="pt-6 space-y-3">
                    {/* Name and Role */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-base">
                          {user.name} {user.surname}
                        </h3>
                        <Badge variant={getRoleBadgeVariant(user.role) as any} className="mt-1">
                          {capitalizeRole(user.role)}
                        </Badge>
                      </div>
                      {user.role === 'property_manager' && user.expiry_date ? (
                        isExpired(user.expiry_date) ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            Active
                          </Badge>
                        )
                      ) : user.role === 'property_manager' ? (
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          Active
                        </Badge>
                      ) : null}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="break-all">{user.email}</span>
                      </div>
                      {user.number && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{user.number}</span>
                        </div>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Created: {formatDate(user.created_at)}</span>
                      </div>
                      {user.role === 'property_manager' && user.expiry_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Expires: {formatDate(user.expiry_date)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/admin/users/edit/${user.id}`)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => setUserToDelete(user)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {!isLoading && users.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600 text-center sm:text-left">
                Page {currentPage} of {totalPages} • {data?.pagination?.total}{" "}
                total users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 sm:ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Delete Confirmation AlertDialog */}
          <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete user "{userToDelete?.name} {userToDelete?.surname}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
