"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    number: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Fjalëkalimet nuk përputhen");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error("Fjalëkalimi duhet të jetë të paktën 6 karaktere i gjatë");
      return;
    }

    // Validate phone number format
    if (formData.number) {
      const phoneRegex = /^\+3834\d{7}$/;
      if (!phoneRegex.test(formData.number)) {
        toast.error(
          "Numri i telefonit duhet të fillojë me +383 dhe të jetë në formatin +3834911122"
        );
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
            password: formData.password,
            number: formData.number,
            role: "tenant",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          data.message || "Regjistrimi u krye me sukses! Duke ridrejtuar në hyrje..."
        );
        setFormData({
          name: "",
          surname: "",
          email: "",
          password: "",
          confirmPassword: "",
          number: "",
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(data.message || "Regjistrimi dështoi");
      }
    } catch (err) {
      toast.error("Dështoi lidhja me serverin. Ju lutemi provoni përsëri.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex justify-center items-center mb-4 gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Image
              src="/favicon.svg"
              alt="BllokuSync"
              width={10}
              height={10}
              className="h-8 w-auto"
              priority
              style={{ filter: "brightness(0%)" }}
            />
            <h1 className="font-bold text-xl">BllokuSync</h1>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Krijo Llogari
          </h1>
          <p className="text-slate-600">
            Regjistrohuni për Sistemin e Menaxhimit të Apartamenteve
          </p>
        </div>

        <Card className="border-emerald-200 shadow-xl">
          <CardHeader>
            <CardTitle>Formular Regjistrimi</CardTitle>
            <CardDescription>
              Vendosni detajet tuaja për të kërkuar qasje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Emri *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Agron"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Mbiemri *</Label>
                  <Input
                    id="surname"
                    name="surname"
                    type="text"
                    placeholder="Krasniqi"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="agron.krasniqi@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">Numri i Telefonit</Label>
                <Input
                  id="number"
                  name="number"
                  type="tel"
                  placeholder="+3834911122"
                  value={formData.number}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-600">
                  Formati: +3834911122 (duhet të fillojë me +383)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Fjalëkalimi *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-600">
                  Duhet të jetë të paktën 6 karaktere
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmo Fjalëkalimin *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                isLoading={isLoading}
              >
                Dërgo Regjistrimin
              </Button>

              <div className="text-center text-sm">
                <span className="text-slate-600">Keni tashmë një llogari? </span>
                <Link
                  href="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Hyni këtu
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
