import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Star, Home as HomeIcon, UserPlus, LogIn } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Auth Buttons */}
        <div className="flex justify-end gap-4 mb-8">
          <Link href="/login">
            <Button variant="outline" className="gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <UserPlus className="h-4 w-4" />
              Register
            </Button>
          </Link>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Apartment Management System
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose your portal to access the system
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {/* Admin Portal Card */}
          <Card className="border-red-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-slate-900">
                Admin Portal
              </CardTitle>
              <CardDescription className="text-slate-600">
                Full system access and control
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-slate-600 mb-6 space-y-2">
                <li>✓ Manage all buildings</li>
                <li>✓ User management</li>
                <li>✓ System settings</li>
                <li>✓ Financial reports</li>
              </ul>
              <Link href="/admin">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Access Admin Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Manager Portal Card */}
          <Card className="border-indigo-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center">
                <Star className="h-8 w-8 text-amber-400" />
              </div>
              <CardTitle className="text-2xl text-slate-900">
                Manager Portal
              </CardTitle>
              <CardDescription className="text-slate-600">
                Property and tenant management
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-slate-600 mb-6 space-y-2">
                <li>✓ Manage properties</li>
                <li>✓ Handle maintenance</li>
                <li>✓ Tenant communication</li>
                <li>✓ Property inspections</li>
              </ul>
              <Link href="/property_manager">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Access Manager Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tenant Portal Card */}
          <Card className="border-emerald-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center">
                <HomeIcon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-slate-900">
                Tenant Portal
              </CardTitle>
              <CardDescription className="text-slate-600">
                Manage your apartment and payments
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-slate-600 mb-6 space-y-2">
                <li>✓ Pay rent online</li>
                <li>✓ Submit maintenance requests</li>
                <li>✓ View documents</li>
                <li>✓ Contact management</li>
              </ul>
              <Link href="/tenant">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Access Tenant Portal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
