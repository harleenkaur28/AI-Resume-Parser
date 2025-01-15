"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText, Users, Sparkles } from "lucide-react";
import Link from "next/link";

export function LandingHero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Glassmorphic background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#76ABAE] opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#76ABAE] opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#EEEEEE] to-[#76ABAE] mb-6">
            Your Resume, Your Future
          </h1>
          <p className="text-[#EEEEEE]/80 text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
            Upload your resume and let AI match you with your perfect role. 
            Powerful insights for job seekers and recruiters alike.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link href="/dashboard/seeker">
              <Button size="lg" className="bg-[#76ABAE] hover:bg-[#76ABAE]/90 text-white w-full md:w-auto">
                <FileText className="mr-2 h-5 w-5" />
                I&apos;m a Job Seeker
              </Button>
            </Link>
            <Link href="/dashboard/recruiter">
              <Button size="lg" variant="outline" className="border-[#76ABAE] text-[#EEEEEE] hover:bg-[#76ABAE]/10 w-full md:w-auto">
                <Users className="mr-2 h-5 w-5" />
                I&apos;m a Recruiter
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 flex items-center justify-center gap-8 text-[#EEEEEE]/60"
          >
            <Sparkles className="h-6 w-6" />
            <p>Powered by advanced AI</p>
            <p>|</p>
            <p>Instant insights</p>
            <p>|</p>
            <p>Bulk processing</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}