"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Construction } from "lucide-react";
import Link from "next/link";

export default function PlaceholderSection() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
				{/* Back button */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-6 sm:mb-8"
				>
					<Link href="/dashboard">
						<Button
							variant="ghost"
							size="sm"
							className="text-[#EEEEEE] hover:text-[#76ABAE] hover:bg-white/5 transition-all duration-300 p-2 sm:p-3"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							<span className="hidden sm:inline">Back to Dashboard</span>
							<span className="sm:hidden">Back</span>
						</Button>
					</Link>
				</motion.div>

				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="text-center mb-8 sm:mb-12"
					>
						<div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#76ABAE]/10 rounded-2xl mb-4 sm:mb-6">
							<Construction className="h-8 w-8 sm:h-10 sm:w-10 text-[#76ABAE]" />
						</div>
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#EEEEEE] mb-3 sm:mb-4 leading-tight">
							Coming Soon
						</h1>
						<p className="text-[#EEEEEE]/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">
							This section is currently under construction. We're working hard
							to bring you something amazing.
						</p>
					</motion.div>

					{/* Main Content Card */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
						className="max-w-2xl mx-auto"
					>
						<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden">
							<CardHeader className="pb-4">
								<CardTitle className="text-[#EEEEEE] text-xl sm:text-2xl font-semibold">
									What's Coming?
								</CardTitle>
								<p className="text-[#EEEEEE]/60 text-sm mt-2">
									We're working on this feature to provide you with the best
									experience
								</p>
							</CardHeader>
							<CardContent>
								<div className="py-8 text-center">
									<motion.div
										animate={{ scale: [1, 1.05, 1] }}
										transition={{ duration: 2, repeat: Infinity }}
										className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#76ABAE]/10 flex items-center justify-center mb-6"
									>
										<Construction className="h-8 w-8 sm:h-10 sm:w-10 text-[#76ABAE]" />
									</motion.div>
									<h3 className="text-lg sm:text-xl font-semibold text-[#EEEEEE] mb-2">
										Stay Tuned
									</h3>
									<p className="text-[#EEEEEE]/70 mb-8 max-w-md mx-auto">
										We're currently developing this feature. Check back soon for
										updates!
									</p>
									<Link href="/dashboard">
										<motion.div
											whileHover={{ scale: 1.01 }}
											whileTap={{ scale: 0.99 }}
										>
											<Button className="bg-gradient-to-r from-[#76ABAE] to-[#76ABAE]/80 hover:from-[#76ABAE]/90 hover:to-[#76ABAE]/70 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
												Return to Dashboard
											</Button>
										</motion.div>
									</Link>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
