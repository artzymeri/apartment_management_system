"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight, Building2, Users, Shield, Sparkles, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Home() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>

      {/* Floating orbs for depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/favicon.svg"
                  alt="BllokuSync"
                  width={32}
                  height={32}
                  className="w-7 h-7 sm:w-8 sm:h-8 invert"
                  priority
                />
              </motion.div>
              <span className="text-xl sm:text-2xl font-semibold tracking-tight">
                BllokuSync
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/10 text-sm sm:text-base px-3 sm:px-4"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-white text-black hover:bg-gray-100 text-sm sm:text-base px-3 sm:px-4">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6 sm:mb-8"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              <span className="text-xs sm:text-sm text-gray-300">
                Next-generation property management
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                Manage smarter.
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Live better.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base sm:text-xl md:text-2xl text-gray-400 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
            >
              Streamline property operations and enhance tenant experiences with intelligent
              automation, seamless communication, and comprehensive management tools. From maintenance
              tracking to payment management, everything you need in one elegant platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full font-semibold shadow-2xl shadow-white/20 group"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white text-black border-white/20 hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full font-semibold"
                >
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto"
          >
            {/* Property Manager Portal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Link href="/property_manager">
                <div className="relative h-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-transparent transition-all duration-500" />

                  <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                      Property Manager
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                      Streamline operations with intelligent property and tenant
                      management tools.
                    </p>

                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400" />
                        <span>Property oversight</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400" />
                        <span>Maintenance tracking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400" />
                        <span>Tenant communication</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Tenant Portal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Link href="/tenant">
                <div className="relative h-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-500" />

                  <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                      Tenant Portal
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                      Your personalized space for seamless living and instant
                      support.
                    </p>

                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                        <span>Payment tracking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                        <span>Service requests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                        <span>Document access</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/favicon.svg"
                alt="BllokuSync"
                width={24}
                height={24}
                className="invert opacity-60"
              />
              <span className="text-sm text-gray-500">
                © 2025 BllokuSync. All rights reserved.
              </span>
            </div>
            <div className="flex gap-4 sm:gap-6 text-sm text-gray-500">
              <button
                onClick={() => setPrivacyOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy
              </button>
              <button
                onClick={() => setContactOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Contact
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Privacy Modal */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-slate-900 to-slate-800 text-white border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Privacy Policy
            </DialogTitle>
            <DialogDescription className="text-gray-300 pt-4 leading-relaxed">
              At BllokuSync, we are committed to protecting your privacy and ensuring the security of your personal information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <p>
              This application preserves the privacy of each user by implementing industry-standard security measures and data protection protocols.
            </p>
            <p>
              We collect only the necessary information required to provide our property management services, and we never share your personal data with third parties without your explicit consent.
            </p>
            <p>
              Your data is encrypted both in transit and at rest, ensuring that your information remains confidential and secure at all times.
            </p>
            <p className="text-xs text-gray-400 pt-2">
              For more information about how we handle your data, please contact our support team.
            </p>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setPrivacyOpen(false)}
              className="bg-white text-black hover:bg-gray-100"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-[400px] bg-gradient-to-br from-slate-900 to-slate-800 text-white border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Contact Us
            </DialogTitle>
            <DialogDescription className="text-gray-300 pt-4">
              Get in touch with our team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Phone Number</p>
                <a
                  href="tel:+38346131908"
                  className="text-lg font-semibold text-white hover:text-purple-400 transition-colors"
                >
                  +383 46 131 908
                </a>
              </div>
            </div>
            <p className="text-sm text-gray-400 text-center">
              Our support team is available to assist you with any questions or concerns.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setContactOpen(false)}
              className="bg-white text-black hover:bg-gray-100"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
