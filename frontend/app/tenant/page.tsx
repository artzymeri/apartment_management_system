import { TenantLayout } from "@/components/layouts/TenantLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Wrench, FileText, MessageSquare, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TenantDashboard() {
  return (
    <ProtectedRoute allowedRoles={['tenant']}>
      <TenantLayout title="Dashboard">
        <div className="space-y-6">
          {/* Alert for upcoming payment */}
          <Alert className="border-emerald-200 bg-emerald-50">
            <AlertCircle className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="text-emerald-900">Rent Due Soon</AlertTitle>
            <AlertDescription className="text-emerald-700">
              Your rent payment of $1,250 is due on October 31, 2025.
            </AlertDescription>
          </Alert>

          {/* Quick Actions Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-emerald-200 bg-emerald-50/50 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rent Payment</CardTitle>
                <CreditCard className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">$1,250</div>
                <p className="text-xs text-slate-600">Due Oct 31, 2025</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/50 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">2</div>
                <p className="text-xs text-slate-600">Active requests</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/50 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileText className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">8</div>
                <p className="text-xs text-slate-600">Lease & agreements</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/50 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">3</div>
                <p className="text-xs text-slate-600">Unread messages</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Your payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">September 2025</p>
                      <p className="text-sm text-slate-600">Paid on Sep 28</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      Paid
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">August 2025</p>
                      <p className="text-sm text-slate-600">Paid on Aug 30</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      Paid
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">July 2025</p>
                      <p className="text-sm text-slate-600">Paid on Jul 29</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      Paid
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Track your service requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Kitchen faucet leak</p>
                      <p className="text-sm text-slate-600">Submitted Oct 10</p>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      In Progress
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">AC not cooling</p>
                      <p className="text-sm text-slate-600">Submitted Oct 8</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Scheduled
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    Submit New Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TenantLayout>
    </ProtectedRoute>
  );
}
