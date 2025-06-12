"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderOverlay } from "@/components/ui/loader";
import {
	ArrowLeft,
	Lightbulb,
	FileText,
	Users,
	AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Tip {
	category: string;
	advice: string;
}

interface TipsData {
	resume_tips: Tip[];
	interview_tips: Tip[];
}

export default function TipsClient() {
	const [tipsData, setTipsData] = useState<TipsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const searchParams = useSearchParams();

	useEffect(() => {
		const fetchTips = async () => {
			try {
				await new Promise((resolve) => setTimeout(resolve, 1000));

				const category = searchParams.get("category") || "";
				const skills = searchParams.get("skills") || "";

				const params = new URLSearchParams();
				if (category) params.append("job_category", category);
				if (skills) params.append("skills", skills);

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/tips/?${params.toString()}`
				);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const result = await response.json();

				if (result.success) {
					setTipsData(result.data);
				} else {
					throw new Error(result.message || "Failed to fetch tips");
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to fetch tips");
			} finally {
				setLoading(false);
			}
		};

		fetchTips();
	}, [searchParams]);

	return (
		<>
			<AnimatePresence>
				{loading && (
					<LoaderOverlay
						text="Generating personalized career tips..."
						variant="dots"
						size="xl"
					/>
				)}
			</AnimatePresence>

			{!loading && (
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
					<div className="container mx-auto px-4 py-8">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
						>
							<Link href="/dashboard/seeker">
								<Button
									variant="ghost"
									className="text-[#EEEEEE] hover:text-[#76ABAE]"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Dashboard
								</Button>
							</Link>
						</motion.div>

						{error ? (
							<div className="min-h-[60vh] flex items-center justify-center">
								<div className="text-center">
									<motion.div
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.5 }}
									>
										<AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
										<div className="text-[#EEEEEE] text-xl mb-4">
											Error loading tips
										</div>
										<div className="text-[#EEEEEE]/60 mb-4"></div>
										<Link href="/dashboard/seeker"></Link>
									</motion.div>
								</div>
							</div>
						) : (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.2 }}
								className="mt-12"
							>
								<div className="text-center mb-12">
									<h1 className="text-4xl font-bold text-[#EEEEEE] mb-4">
										Career Tips & Advice
									</h1>
									<p className="text-[#EEEEEE]/60 text-lg max-w-2xl mx-auto">
										Personalized tips to help you improve your resume and ace
										your interviews
									</p>
								</div>

								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
									{/* Resume Tips */}
									<div className="space-y-6">
										<div className="flex items-center space-x-3 mb-6">
											<FileText className="h-8 w-8 text-[#76ABAE]" />
											<h2 className="text-2xl text-[#EEEEEE] font-semibold">
												Resume Tips
											</h2>
										</div>

										{tipsData?.resume_tips.map((tip, index) => (
											<div
												key={index}
												className="p-4 bg-white/10 border-white/20 rounded-md"
											>
												<p className="text-[#EEEEEE]">{tip.advice}</p>
											</div>
										))}
									</div>

									{/* Interview Tips */}
									<div className="space-y-6">
										<div className="flex items-center space-x-3 mb-6">
											<Users className="h-8 w-8 text-[#76ABAE]" />
											<h2 className="text-2xl text-[#EEEEEE] font-semibold">
												Interview Tips
											</h2>
										</div>

										{tipsData?.interview_tips.map((tip, index) => (
											<div
												key={index}
												className="p-4 bg-white/10 border-white/20 rounded-md"
											>
												<p className="text-[#EEEEEE]">{tip.advice}</p>
											</div>
										))}
									</div>
								</div>

								{/* Additional Actions */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.8 }}
									className="mt-12 text-center"
								>
									<Card className="backdrop-blur-lg bg-white/5 border-white/10 max-w-2xl mx-auto"></Card>
								</motion.div>
							</motion.div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
