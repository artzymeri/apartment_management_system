"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home as HomeIcon, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function LoginPage() {
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMethodToggle = (method: "email" | "phone") => {
    setLoginMethod(method);
    setFormData({
      identifier: "",
      password: formData.password,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number format if using phone login
    if (loginMethod === "phone" && formData.identifier) {
      const phoneRegex = /^\+3834\d{7}$/;
      if (!phoneRegex.test(formData.identifier)) {
        toast.error(
          "Phone number must start with +383 and be in format +3834911122"
        );
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = await login(
        formData.identifier,
        formData.password,
        loginMethod
      );

      if (!result.success) {
        toast.error(result.message || "Login failed");
      } else {
        toast.success("Login successful! Redirecting...");
      }
      // If successful, AuthContext will handle the redirect
    } catch (err) {
      toast.error("Failed to connect to server. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <HomeIcon className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex justify-center items-center mb-2 gap-2">
            <Image
              src="/favicon.svg"
              alt="BllokuSync"
              width={10}
              height={10}
              className="h-8 w-auto"
              priority
              style={{filter: 'brightness(0%)'}}
            />
            <h1 className="font-bold">BllokuSync</h1>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600">
            Sign in to access your apartment portal
          </p>
        </div>

        <Card className="border-blue-200 shadow-xl">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Login Method Toggle */}
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={loginMethod === "email" ? "default" : "outline"}
                className={`flex-1 ${
                  loginMethod === "email"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""
                }`}
                onClick={() => handleMethodToggle("email")}
                disabled={isLoading}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                type="button"
                variant={loginMethod === "phone" ? "default" : "outline"}
                className={`flex-1 ${
                  loginMethod === "phone"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""
                }`}
                onClick={() => handleMethodToggle("phone")}
                disabled={isLoading}
              >
                <Phone className="h-4 w-4 mr-2" />
                Phone
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {loginMethod === "email" ? "Email" : "Phone Number"}
                </Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type={loginMethod === "email" ? "email" : "tel"}
                  placeholder={
                    loginMethod === "email"
                      ? "john.doe@example.com"
                      : "+3834911122"
                  }
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  autoComplete={loginMethod === "email" ? "email" : "tel"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                isLoading={isLoading}
              >
                Sign In
              </Button>

              <div className="text-center text-sm space-y-2">
                <div>
                  <span className="text-slate-600">Don't have an account? </span>
                  <Link
                    href="/register"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Register here
                  </Link>
                </div>
                <div>
                  <Link
                    href="/forgot-password"
                    className="text-slate-600 hover:text-slate-700"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-slate-700 text-center">
            <strong>Note:</strong> Your account must be approved by an
            administrator before you can log in.
          </p>
        </div>
      </div>
    </div>
  );
}
