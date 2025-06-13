"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	FileText,
	Users,
	TrendingUp,
	Mail,
	MessageSquare,
	User,
	ArrowRight,
	ArrowLeft,
	Briefcase,
	Target,
	Clock,
	Star,
	BarChart3,
	Calendar,
	CheckCircle,
	PlusCircle,
	Zap,
	Award,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [currentTime, setCurrentTime] = useState("");

	// Get current time
	useEffect(() => {
		const updateTime = () => {
			const now = new Date();
			const timeString = now.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			});
			setCurrentTime(timeString);
		};

		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, []);

	// Get greeting based on time
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 17) return "Good afternoon";
		return "Good evening";
	};

	// Redirect if not authenticated
	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth");
		}
	}, [status, router]);

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center min-h-screen text-white bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
				Loading dashboard...
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex items-center justify-center min-h-screen text-white bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
				Redirecting to login...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] relative overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-10 -left-10 w-72 h-72 bg-[#76ABAE]/10 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute top-1/2 -right-20 w-96 h-96 bg-[#31363F]/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-[#76ABAE]/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
			</div>

			{/* Back Button */}
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.5 }}
				className="absolute top-6 left-6 z-10"
			>
				<Link href="/">
					<Button
						variant="ghost"
						className="text-white hover:text-[#76ABAE] hover:bg-white/10 backdrop-blur-sm border border-white/20"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Home
					</Button>
				</Link>
			</motion.div>

			<div className="container mx-auto px-6 py-8 relative z-10">
				{/* Add top spacing */}
				<div className="pt-20"></div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					{/* Enhanced Header */}
					<div className="mb-12 text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="mb-4"
						>
							<Badge
								variant="secondary"
								className="bg-[#76ABAE]/30 text-[#76ABAE] border-[#76ABAE]/40 mb-4"
							>
								<Clock className="w-3 h-3 mr-1" />
								{currentTime}
							</Badge>
						</motion.div>

						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white to-[#76ABAE] bg-clip-text text-transparent"
						>
							{getGreeting()}, {session?.user?.name || "User"}!
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="text-slate-300 text-xl max-w-2xl mx-auto"
						>
							Your AI-powered career companion is ready to help you succeed
						</motion.p>
					</div>

					{/* Quick Action Buttons - Enhanced */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="flex flex-wrap justify-center gap-4 mb-12"
					>
						<Link href="/dashboard/cold-mail">
							<Button className="bg-gradient-to-r from-[#76ABAE] to-[#5A8B8F] hover:from-[#5A8B8F] hover:to-[#76ABAE] text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 button-hover">
								<Mail className="h-5 w-5 mr-2" />
								Cold Mail Generator
								<Zap className="h-4 w-4 ml-2" />
							</Button>
						</Link>
						<Link href="/dashboard/hiring-assistant">
							<Button className="bg-gradient-to-r from-[#31363F] to-[#4C566A] hover:from-[#4C566A] hover:to-[#31363F] text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 button-hover border border-slate-600/50">
								<Users className="h-5 w-5 mr-2" />
								Hiring Assistant
								<Target className="h-4 w-4 ml-2" />
							</Button>
						</Link>
					</motion.div>

					{/* Enhanced Quick Stats */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
						>
							<Card className="backdrop-blur-sm bg-gradient-to-br from-[#31363F]/90 to-[#222831]/90 border-slate-600/30 shadow-2xl hover:shadow-3xl transition-all duration-300 card-hover group">
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-4">
										<div className="p-3 bg-[#76ABAE]/30 rounded-xl group-hover:bg-[#76ABAE]/40 transition-colors">
											<FileText className="h-6 w-6 text-[#76ABAE]" />
										</div>
										<Badge
											variant="secondary"
											className="bg-green-500/30 text-green-300 border-green-500/40"
										>
											<TrendingUp className="w-3 h-3 mr-1" />
											+0%
										</Badge>
									</div>
									<div>
										<p className="text-slate-300 text-sm font-medium mb-1">
											Total Resumes
										</p>
										<p className="text-3xl font-bold text-white mb-2">0</p>
										<Progress value={0} className="h-2 bg-slate-600/50" />
									</div>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							<Card className="backdrop-blur-sm bg-gradient-to-br from-[#31363F]/90 to-[#222831]/90 border-slate-600/30 shadow-2xl hover:shadow-3xl transition-all duration-300 card-hover group">
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-4">
										<div className="p-3 bg-blue-500/30 rounded-xl group-hover:bg-blue-500/40 transition-colors">
											<Briefcase className="h-6 w-6 text-blue-400" />
										</div>
										<Badge
											variant="secondary"
											className="bg-blue-500/30 text-blue-300 border-blue-500/40"
										>
											<Target className="w-3 h-3 mr-1" />
											Active
										</Badge>
									</div>
									<div>
										<p className="text-slate-300 text-sm font-medium mb-1">
											Applications
										</p>
										<p className="text-3xl font-bold text-white mb-2">0</p>
										<Progress value={0} className="h-2 bg-slate-600/50" />
									</div>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.3 }}
						>
							<Card className="backdrop-blur-sm bg-gradient-to-br from-[#31363F]/90 to-[#222831]/90 border-slate-600/30 shadow-2xl hover:shadow-3xl transition-all duration-300 card-hover group">
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-4">
										<div className="p-3 bg-purple-500/30 rounded-xl group-hover:bg-purple-500/40 transition-colors">
											<Mail className="h-6 w-6 text-purple-400" />
										</div>
										<Badge
											variant="secondary"
											className="bg-purple-500/30 text-purple-300 border-purple-500/40"
										>
											<MessageSquare className="w-3 h-3 mr-1" />
											New
										</Badge>
									</div>
									<div>
										<p className="text-slate-300 text-sm font-medium mb-1">
											Messages
										</p>
										<p className="text-3xl font-bold text-white mb-2">0</p>
										<Progress value={0} className="h-2 bg-slate-600/50" />
									</div>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
						>
							<Card className="backdrop-blur-sm bg-gradient-to-br from-[#31363F]/90 to-[#222831]/90 border-slate-600/30 shadow-2xl hover:shadow-3xl transition-all duration-300 card-hover group">
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-4">
										<div className="p-3 bg-yellow-500/30 rounded-xl group-hover:bg-yellow-500/40 transition-colors">
											<Award className="h-6 w-6 text-yellow-400" />
										</div>
										<Badge
											variant="secondary"
											className="bg-yellow-500/30 text-yellow-300 border-yellow-500/40"
										>
											<Star className="w-3 h-3 mr-1" />
											Score
										</Badge>
									</div>
									<div>
										<p className="text-slate-300 text-sm font-medium mb-1">
											Profile Score
										</p>
										<p className="text-3xl font-bold text-white mb-2">--</p>
										<Progress value={0} className="h-2 bg-slate-600/50" />
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</div>

					{/* Enhanced Feature Cards */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.5 }}
						>
							<Card className="backdrop-blur-sm bg-gradient-to-br from-[#31363F]/95 to-[#222831]/95 border-slate-600/30 shadow-2xl hover:shadow-3xl transition-all duration-300 card-hover group h-full">
								<CardHeader className="pb-4">
									<div className="flex items-center justify-between mb-2">
										<CardTitle className="text-white flex items-center gap-3 text-xl">
											<div className="p-2 bg-[#76ABAE]/30 rounded-lg group-hover:bg-[#76ABAE]/40 transition-colors">
												<FileText className="h-6 w-6 text-[#76ABAE]" />
											</div>
											Resume Analysis
										</CardTitle>
										<Badge className="bg-[#76ABAE]/30 text-[#76ABAE] border-[#76ABAE]/40">
											AI-Powered
										</Badge>
									</div>
									<CardDescription className="text-slate-300 text-base">
										Upload and analyze your resume to get AI-powered insights,
										suggestions, and optimization tips
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="mb-6 space-y-2">
										<div className="flex items-center text-sm text-slate-300">
											<CheckCircle className="h-4 w-4 mr-2 text-green-400" />
											ATS Compatibility Check
										</div>
										<div className="flex items-center text-sm text-slate-300">
											<CheckCircle className="h-4 w-4 mr-2 text-green-400" />
											Skill Gap Analysis
										</div>
										<div className="flex items-center text-sm text-slate-300">
											<CheckCircle className="h-4 w-4 mr-2 text-green-400" />
											Industry-Specific Recommendations
										</div>
									</div>
									<Link href="/dashboard/seeker">
										<Button className="w-full bg-gradient-to-r from-[#76ABAE] to-[#5A8B8F] hover:from-[#5A8B8F] hover:to-[#76ABAE] group text-lg py-3 shadow-lg hover:shadow-xl transition-all duration-300 button-hover">
											<PlusCircle className="mr-2 h-5 w-5" />
											Get Started
											<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
										</Button>
									</Link>
								</CardContent>
							</Card>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.6 }}
						>
							<Card className="backdrop-blur-sm bg-gradient-to-br from-[#31363F]/95 to-[#222831]/95 border-slate-600/30 shadow-2xl hover:shadow-3xl transition-all duration-300 card-hover group h-full">
								<CardHeader className="pb-4">
									<div className="flex items-center justify-between mb-2">
										<CardTitle className="text-white flex items-center gap-3 text-xl">
											<div className="p-2 bg-blue-500/30 rounded-lg group-hover:bg-blue-500/40 transition-colors">
												<Users className="h-6 w-6 text-blue-400" />
											</div>
											For Recruiters
										</CardTitle>
										<Badge className="bg-blue-500/30 text-blue-400 border-blue-500/40">
											Pro Tools
										</Badge>
									</div>
									<CardDescription className="text-slate-300 text-base">
										Find and analyze candidate profiles with AI assistance and
										advanced filtering options
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="mb-6 space-y-2">
										<div className="flex items-center text-sm text-slate-300">
											<CheckCircle className="h-4 w-4 mr-2 text-blue-400" />
											Smart Candidate Matching
										</div>
										<div className="flex items-center text-sm text-slate-300">
											<CheckCircle className="h-4 w-4 mr-2 text-blue-400" />
											Bulk Resume Processing
										</div>
										<div className="flex items-center text-sm text-slate-300">
											<CheckCircle className="h-4 w-4 mr-2 text-blue-400" />
											Interview Question Generator
										</div>
									</div>
									<Link href="/dashboard/recruiter">
										<Button
											variant="outline"
											className="w-full border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:text-white group text-lg py-3 shadow-lg hover:shadow-xl transition-all duration-300 button-hover"
										>
											<BarChart3 className="mr-2 h-5 w-5" />
											Explore Tools
											<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
										</Button>
									</Link>
								</CardContent>
							</Card>
						</motion.div>
					</div>

					{/* Quick Tips Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.7 }}
						className="mb-12"
					>
						<Card className="backdrop-blur-sm bg-gradient-to-br from-[#31363F]/95 to-[#222831]/95 border-slate-600/30 shadow-2xl">
							<CardHeader>
								<CardTitle className="text-white flex items-center gap-2">
									<Zap className="h-5 w-5 text-yellow-400" />
									Quick Tips for Today
								</CardTitle>
								<CardDescription className="text-slate-300">
									Personalized recommendations to boost your career
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="p-4 rounded-lg bg-gradient-to-br from-[#76ABAE]/20 to-[#76ABAE]/10 border border-[#76ABAE]/30">
										<div className="flex items-center mb-2">
											<Target className="h-4 w-4 text-[#76ABAE] mr-2" />
											<span className="text-sm font-medium text-white">
												Optimize Keywords
											</span>
										</div>
										<p className="text-xs text-slate-300">
											Add industry-specific keywords to improve ATS
											compatibility
										</p>
									</div>
									<div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/30">
										<div className="flex items-center mb-2">
											<Calendar className="h-4 w-4 text-blue-400 mr-2" />
											<span className="text-sm font-medium text-white">
												Update Profile
											</span>
										</div>
										<p className="text-xs text-slate-300">
											Keep your profile fresh with recent achievements
										</p>
									</div>
									<div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/30">
										<div className="flex items-center mb-2">
											<MessageSquare className="h-4 w-4 text-purple-400 mr-2" />
											<span className="text-sm font-medium text-white">
												Network Smart
											</span>
										</div>
										<p className="text-xs text-slate-300">
											Use AI-generated cold emails to expand your network
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Recent Activity - Enhanced */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.8 }}
					>
						<Card className="backdrop-blur-sm bg-gradient-to-br from-[#31363F]/95 to-[#222831]/95 border-slate-600/30 shadow-2xl">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-white flex items-center gap-2">
											<BarChart3 className="h-5 w-5 text-[#76ABAE]" />
											Activity Center
										</CardTitle>
										<CardDescription className="text-slate-300">
											Your latest actions and achievements
										</CardDescription>
									</div>
									<Badge className="bg-[#76ABAE]/30 text-[#76ABAE] border-[#76ABAE]/40">
										Live
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-center py-12">
									<div className="text-center max-w-md">
										<div className="relative mb-6">
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="w-24 h-24 bg-gradient-to-r from-[#76ABAE]/30 to-[#76ABAE]/20 rounded-full animate-pulse"></div>
											</div>
											<MessageSquare className="relative h-12 w-12 text-[#76ABAE] mx-auto" />
										</div>
										<h3 className="text-xl font-semibold text-white mb-2">
											Ready to Get Started?
										</h3>
										<p className="text-slate-300 mb-6">
											Begin your journey by uploading a resume or exploring our
											AI-powered features
										</p>
										<div className="flex flex-col sm:flex-row gap-3 justify-center">
											<Link href="/dashboard/seeker">
												<Button className="bg-gradient-to-r from-[#76ABAE] to-[#5A8B8F] hover:from-[#5A8B8F] hover:to-[#76ABAE] text-white px-6 py-2">
													<FileText className="mr-2 h-4 w-4" />
													Upload Resume
												</Button>
											</Link>
											<Link href="/dashboard/cold-mail">
												<Button
													variant="outline"
													className="border-[#76ABAE]/50 text-[#76ABAE] hover:bg-[#76ABAE]/10 hover:text-white px-6 py-2"
												>
													<Mail className="mr-2 h-4 w-4" />
													Try Cold Mail
												</Button>
											</Link>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
