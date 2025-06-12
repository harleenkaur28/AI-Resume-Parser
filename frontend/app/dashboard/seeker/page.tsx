"use client";

import { motion } from "framer-motion";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, BarChart3, Lightbulb } from "lucide-react";
import Link from "next/link";
import { KnowButton } from "@/components/know-more-button";
import { Card, CardContent } from "@/components/ui/card";

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
					className="max-w-4xl mx-auto mt-12"
				>
					<div className="text-center mb-12">
						<h1 className="text-4xl font-bold text-[#EEEEEE] mb-4">
							Resume Analysis Dashboard
						</h1>
						<p className="text-[#EEEEEE]/60 text-lg max-w-2xl mx-auto">
							Upload your resume to get instant analysis, detailed insights, and
							personalized career tips
						</p>
					</div>

					{/* Features Overview */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
						<Card className="backdrop-blur-lg bg-white/5 border-white/10">
							<CardContent className="p-6 text-center">
								<Upload className="h-12 w-12 text-[#76ABAE] mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">
									Quick Analysis
								</h3>
								<p className="text-[#EEEEEE]/60 text-sm">
									Instant resume parsing with key information extraction
								</p>
							</CardContent>
						</Card>

						<Card className="backdrop-blur-lg bg-white/5 border-white/10">
							<CardContent className="p-6 text-center">
								<BarChart3 className="h-12 w-12 text-[#76ABAE] mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">
									Detailed Insights
								</h3>
								<p className="text-[#EEEEEE]/60 text-sm">
									Comprehensive analysis with skills assessment and
									recommendations
								</p>
							</CardContent>
						</Card>

						<Card className="backdrop-blur-lg bg-white/5 border-white/10">
							<CardContent className="p-6 text-center">
								<Lightbulb className="h-12 w-12 text-[#76ABAE] mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">
									Career Tips
								</h3>
								<p className="text-[#EEEEEE]/60 text-sm">
									Personalized advice for resume improvement and interview prep
								</p>
							</CardContent>
						</Card>
					</div>

					{/* File Upload Component */}
					<FileUpload />
				</motion.div>
			</div>
			<KnowButton />
		</div>
	);
}
