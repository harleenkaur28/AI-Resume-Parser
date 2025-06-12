"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, BarChart3, Lightbulb } from "lucide-react";
import Link from "next/link";
import { KnowButton } from "@/components/know-more-button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";

export default function SeekerDashboard() {
	const [isPageLoading, setIsPageLoading] = useState(true);

	// Simulate page load
	useState(() => {
		const timer = setTimeout(() => setIsPageLoading(false), 800);
		return () => clearTimeout(timer);
	});

	return (
		<>
			<AnimatePresence>
				{isPageLoading && (
					<motion.div
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] flex items-center justify-center z-50"
					>
						<Loader
							variant="pulse"
							size="xl"
							text="Loading your dashboard..."
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{!isPageLoading && (
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
								<motion.h1
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.4 }}
									className="text-4xl font-bold text-[#EEEEEE] mb-4"
								>
									Resume Analysis Dashboard
								</motion.h1>
								<motion.p
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.6 }}
									className="text-[#EEEEEE]/60 text-lg max-w-2xl mx-auto"
								>
									Upload your resume to get instant analysis, detailed insights,
									and personalized career tips
								</motion.p>
							</div>

							{/* Features Overview */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
								{[
									{
										icon: Upload,
										title: "Quick Analysis",
										desc: "Instant resume parsing with key information extraction",
										delay: 0.8,
									},
									{
										icon: BarChart3,
										title: "Detailed Insights",
										desc: "Comprehensive analysis with skills assessment and recommendations",
										delay: 1.0,
									},
									{
										icon: Lightbulb,
										title: "Career Tips",
										desc: "Personalized advice for resume improvement and interview prep",
										delay: 1.2,
									},
								].map((feature, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.8, delay: feature.delay }}
									>
										<Card className="backdrop-blur-lg bg-white/5 border-white/10 hover:bg-white/10 transition-colors duration-300">
											<CardContent className="p-6 text-center">
												<feature.icon className="h-12 w-12 text-[#76ABAE] mx-auto mb-4" />
												<h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">
													{feature.title}
												</h3>
												<p className="text-[#EEEEEE]/60 text-sm">
													{feature.desc}
												</p>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</div>

							{/* File Upload Component */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 1.4 }}
							>
								<FileUpload />
							</motion.div>
						</motion.div>
					</div>
					<KnowButton />
				</div>
			)}
		</>
	);
}
