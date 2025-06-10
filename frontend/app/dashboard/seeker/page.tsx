"use client";

import { motion } from "framer-motion";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SeekerDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/">
            <Button variant="ghost" className="text-[#EEEEEE] hover:text-[#76ABAE]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <h1 className="text-4xl font-bold text-[#EEEEEE] mb-8 text-center">
            Upload Your Resume
          </h1>
          <FileUpload />
        </motion.div>
      </div>
    </div>
  );
}