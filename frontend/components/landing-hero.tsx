"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { Features } from "./features";
import { useEffect, useState } from "react";

function calMobile() {
	if (typeof window === "undefined") return false;
	return window.innerWidth < 640;
}

export function LandingHero() {
	const [isMobile, setIsMobile] = useState(calMobile());

	useEffect(() => {
		function handleResize() {
			setIsMobile(calMobile());
		}
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20 sm:py-32">
			{/* Glassmorphic background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-[#76ABAE] opacity-20 blur-3xl" />
				<div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-[#76ABAE] opacity-20 blur-3xl" />
			</div>

			<div className="relative z-10 container mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center"
				>
					<h1 className="text-4xl sm:text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#EEEEEE] to-[#76ABAE] mb-4 sm:mb-6">
						Your Resume, Your Future
					</h1>
					<p className="text-lg sm:text-xl md:text-2xl text-[#EEEEEE]/80 mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
						Upload your resume and let AI match you with your perfect role.
						Powerful insights for job seekers and recruiters alike.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
						<Link href="/dashboard/seeker">
							<Button
								size="lg"
								className="bg-[#76ABAE] hover:bg-[#76ABAE]/90 text-white w-full md:w-auto"
							>
								<FileText className="mr-2 h-5 w-5" />
								I&apos;m a Job Seeker
							</Button>
						</Link>
						<Link href="/dashboard/recruiter">
							<Button
								size="lg"
								variant="outline"
								className="border-[#76ABAE] text-[#76ABAE] hover:bg-[#76ABAE]/10 hover:text-white w-full md:w-auto transition-colors"
							>
								<Users className="mr-2 h-5 w-5" />
								I&apos;m a Recruiter
							</Button>
						</Link>
					</div>

					{!isMobile && <Features />}

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5, duration: 0.8 }}
						className="mt-12 sm:mt-20 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-[#EEEEEE]/60 text-sm sm:text-base"
					>
						<div className="flex items-center gap-2">
							<Sparkles className="h-5 w-5" />
							<p>Powered by advanced AI</p>
						</div>
						<div className="hidden sm:block">|</div>
						<p>Instant insights</p>
						<div className="hidden sm:block">|</div>
						<p>Bulk processing</p>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
