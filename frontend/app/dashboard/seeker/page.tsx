"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Upload,
	BarChart3,
	Lightbulb,
	Mail,
	Users,
} from "lucide-react";
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
							className="mb-8"
						>
							<Link href="/">
								<Button
									variant="ghost"
									className="text-[#EEEEEE] hover:text-[#76ABAE] hover:bg-white/5 transition-all duration-300"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Home
								</Button>
							</Link>
						</motion.div>

						<div className="max-w-4xl mx-auto">
							{/* Main Upload Section */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.2 }}
								className="text-center mb-12"
							>
								<h1 className="text-4xl md:text-5xl font-bold text-[#EEEEEE] mb-4">
									Upload Your Resume
								</h1>
								<p className="text-[#EEEEEE]/70 text-lg mb-8 max-w-2xl mx-auto">
									Get instant AI-powered analysis of your resume with detailed
									insights and career recommendations
								</p>

								{/* Upload Component - Front and Center */}
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.8, delay: 0.4 }}
								>
									<FileUpload />
								</motion.div>
							</motion.div>

							{/* Simple Features Grid */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.6 }}
								className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
							>
								<Card className="backdrop-blur-lg bg-white/5 border-white/10 text-center">
									<CardContent className="p-6">
										<Upload className="h-8 w-8 text-[#76ABAE] mx-auto mb-3" />
										<h3 className="text-[#EEEEEE] font-semibold mb-2">
											Quick Analysis
										</h3>
										<p className="text-[#EEEEEE]/60 text-sm">
											Instant parsing and field prediction
										</p>
									</CardContent>
								</Card>

								<Card className="backdrop-blur-lg bg-white/5 border-white/10 text-center">
									<CardContent className="p-6">
										<BarChart3 className="h-8 w-8 text-[#76ABAE] mx-auto mb-3" />
										<h3 className="text-[#EEEEEE] font-semibold mb-2">
											Detailed Insights
										</h3>
										<p className="text-[#EEEEEE]/60 text-sm">
											Skills analysis and recommendations
										</p>
									</CardContent>
								</Card>

								<Card className="backdrop-blur-lg bg-white/5 border-white/10 text-center">
									<CardContent className="p-6">
										<Lightbulb className="h-8 w-8 text-[#76ABAE] mx-auto mb-3" />
										<h3 className="text-[#EEEEEE] font-semibold mb-2">
											Career Tips
										</h3>
										<p className="text-[#EEEEEE]/60 text-sm">
											Personalized career advice
										</p>
									</CardContent>
								</Card>
							</motion.div>

							{/* Additional Services */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.8 }}
								className="text-center mb-8"
							>
								<h2 className="text-2xl md:text-3xl font-bold text-[#EEEEEE] mb-4">
									Additional Services
								</h2>
								<p className="text-[#EEEEEE]/70 text-lg mb-8 max-w-2xl mx-auto">
									Enhance your job search with our AI-powered tools
								</p>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<Link href="/dashboard/cold-mail">
										<Card className="backdrop-blur-lg bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
											<CardContent className="p-8 text-center">
												<Mail className="h-12 w-12 text-[#76ABAE] mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
												<h3 className="text-[#EEEEEE] font-semibold text-xl mb-3">
													Cold Mail Generator
												</h3>
												<p className="text-[#EEEEEE]/60 text-sm mb-4">
													Generate personalized cold emails to connect with
													potential employers and expand your network
												</p>
												<Button className="bg-[#76ABAE] hover:bg-[#76ABAE]/80 text-white">
													Generate Cold Mail
												</Button>
											</CardContent>
										</Card>
									</Link>

									<Link href="/dashboard/hiring-assistant">
										<Card className="backdrop-blur-lg bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
											<CardContent className="p-8 text-center">
												<Users className="h-12 w-12 text-[#76ABAE] mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
												<h3 className="text-[#EEEEEE] font-semibold text-xl mb-3">
													Hiring Assistant
												</h3>
												<p className="text-[#EEEEEE]/60 text-sm mb-4">
													Get AI-powered answers to interview questions tailored
													to your resume and target role
												</p>
												<Button className="bg-[#76ABAE] hover:bg-[#76ABAE]/80 text-white">
													Prepare for Interview
												</Button>
											</CardContent>
										</Card>
									</Link>
								</div>
							</motion.div>
						</div>
					</div>
					<KnowButton />
				</div>
			)}
		</>
	);
}
