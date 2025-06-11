"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { KnowButton } from "@/components/know-more-button";

export default function RecruiterDashboard() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
			<div className="container mx-auto px-4 py-8">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
				>
					<Link href="/">
						<Button
							variant="ghost"
							className="text-[#EEEEEE] hover:text-[#76ABAE]"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Home
						</Button>
					</Link>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="max-w-6xl mx-auto mt-12"
				>
					<h1 className="text-4xl font-bold text-[#EEEEEE] mb-8">
						Candidate Database
					</h1>

					<div className="relative mb-8">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#76ABAE]" />
						<Input
							placeholder="Search candidates by skills, experience, or role..."
							className="pl-10 bg-white/5 border-white/10 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
						/>
					</div>

					<div className="backdrop-blur-lg bg-white/5 rounded-xl p-8 border border-white/10">
						<p className="text-[#EEEEEE]/60 text-center">
							No candidates in the database yet. They will appear here once job
							seekers upload their resumes.
						</p>
					</div>
				</motion.div>
				<KnowButton />
			</div>
		</div>
	);
}
