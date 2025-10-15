import { PropertyManagerLayout } from "@/components/layouts/PropertyManagerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Wrench, Users, MessageSquare } from "lucide-react";

export default function PropertyManagerDashboard() {
  return (
    <ProtectedRoute allowedRoles={['property_manager']}>
      <PropertyManagerLayout>
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-indigo-200 bg-indigo-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Properties</CardTitle>
                <Building2 className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-700">8</div>
                <p className="text-xs text-slate-600">Under your management</p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                <Users className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">142</div>
                <p className="text-xs text-slate-600">96% occupancy rate</p>
              </CardContent>
            </Card>

            <Card className="border-indigo-200 bg-indigo-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-700">7</div>
                <p className="text-xs text-slate-600">Pending requests</p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">23</div>
                <p className="text-xs text-slate-600">Unread messages</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your properties and tenants efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Maintenance Requests</p>
                    <p className="text-sm text-slate-600">Review and assign work orders</p>
                  </div>
                  <Badge variant="secondary" className="bg-amber-500 text-slate-900">
                    7 Pending
                  </Badge>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Tenant Messages</p>
                    <p className="text-sm text-slate-600">Respond to tenant inquiries</p>
                  </div>
                  <Badge variant="secondary" className="bg-indigo-600 text-white">
                    23 New
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Property Inspections</p>
                    <p className="text-sm text-slate-600">Schedule and track inspections</p>
                  </div>
                  <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PropertyManagerLayout>
    </ProtectedRoute>
  );
}
