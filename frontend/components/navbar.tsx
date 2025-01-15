"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Users, LayoutDashboard, LogIn } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Job Seekers",
    href: "/dashboard/seeker",
    icon: FileText,
  },
  {
    label: "Recruiters",
    href: "/dashboard/recruiter",
    icon: Users,
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="backdrop-blur-lg bg-white/[0.02] border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-[#76ABAE]" />
              <span className="text-[#EEEEEE] font-bold text-xl">ResumeAI</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm transition-colors duration-200",
                      isActive
                        ? "text-[#76ABAE] bg-[#76ABAE]/10"
                        : "text-[#EEEEEE]/70 hover:text-[#EEEEEE] hover:bg-white/[0.05]"
                    )}
                  >
                    <span className="flex items-center space-x-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button
                  variant="ghost"
                  className="text-[#EEEEEE] hover:text-[#76ABAE] hover:bg-[#76ABAE]/10"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <div className="h-4 w-px bg-white/10" />
              <Link href="/auth?tab=register">
                <Button className="bg-[#76ABAE] hover:bg-[#76ABAE]/90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}