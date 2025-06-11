"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	FileText,
	Brain,
	Users,
	Database,
	Zap,
	CheckCircle,
	TrendingUp,
	Building,
	Code,
	Server,
	Cpu,
} from "lucide-react";

// Add shimmer animation styles
const shimmerKeyframes = `
@keyframes shimmer {
	0% { transform: translateX(-100%); }
	100% { transform: translateX(100%); }
}
.animate-shimmer {
	animation: shimmer 2s ease-in-out infinite;
}
`;

// Inject styles
if (typeof document !== "undefined") {
	const style = document.createElement("style");
	style.textContent = shimmerKeyframes;
	document.head.appendChild(style);
}

const marketStats = [
	{
		value: "286%",
		label: "Year-Over-Year Increase",
		description:
			"in job applications, averaging 48.7 per job, creating a bottleneck for manual review.",
		color: "from-red-500 to-red-600",
		icon: TrendingUp,
	},
	{
		value: "93%",
		label: "of U.S. Employers",
		description:
			"use Applicant Tracking Systems (ATS), often filtering out qualified candidates due to formatting issues.",
		color: "from-orange-500 to-orange-600",
		icon: Building,
	},
];

const techStack = [
	{
		category: "Frontend",
		color: "border-[#76ABAE]",
		icon: Code,
		technologies: [
			{
				name: "Next.js",
				description:
					"For building fast, scalable, and SEO-friendly React applications.",
			},
			{
				name: "Tailwind CSS",
				description:
					"For highly customizable and utility-first styling, ensuring a responsive and modern UI.",
			},
			{
				name: "Framer Motion",
				description:
					"For fluid and engaging animations, enhancing user interactivity.",
			},
		],
	},
	{
		category: "Backend & Database",
		color: "border-orange-500",
		icon: Server,
		technologies: [
			{
				name: "FastAPI",
				description:
					"A modern, fast (high-performance) web framework for building APIs with Python.",
			},
			{
				name: "PostgreSQL",
				description:
					"A powerful, open-source relational database for secure and scalable data storage.",
			},
		],
	},
	{
		category: "AI/ML & NLP",
		color: "border-purple-500",
		icon: Cpu,
		technologies: [
			{
				name: "NLP (Natural Language Processing)",
				description:
					"Core for understanding and extracting information from diverse resume texts.",
			},
			{
				name: "ML (Machine Learning)",
				description:
					"Models for predicting job fields and analyzing resume effectiveness.",
			},
			{
				name: "GenAI (Generative AI)",
				description:
					"Potential for enhancing resume analysis and generating insights.",
			},
			{
				name: "LangChain",
				description:
					"For orchestrating complex AI workflows, potentially integrating various models and data sources.",
			},
		],
	},
];

const features = {
	jobSeekers: [
		{
			title: "Detailed Resume Analysis",
			description:
				"Receive actionable feedback to optimize your resume for ATS and improve your chances.",
			icon: FileText,
		},
		{
			title: "AI Job Field Prediction",
			description:
				"Discover the career paths you're best suited for based on your unique skills and experience.",
			icon: Brain,
		},
		{
			title: "Unlimited & Free Access",
			description:
				"No limits on resume uploads or analysis. Our core tools are free to help you succeed.",
			icon: Zap,
		},
	],
	employers: [
		{
			title: "Intuitive Candidate Dashboard",
			description:
				"Instantly access a curated pool of analyzed, matched, and high-quality candidates.",
			icon: Users,
		},
		{
			title: "Efficient Bulk Processing",
			description:
				"Easily upload hundreds of resumes via ZIP file, saving countless hours of manual data entry.",
			icon: Database,
		},
		{
			title: "Reduced Time-to-Hire",
			description:
				"Quickly identify the most relevant talent, drastically shortening your recruitment cycle.",
			icon: CheckCircle,
		},
	],
};

const competitiveEdge = [
	{
		feature: "Detailed Seeker Resume Analysis",
		us: true,
		b2bParsers: false,
		b2cBuilders: true,
	},
	{
		feature: "Employer Hiring Dashboard",
		us: true,
		b2bParsers: true,
		b2cBuilders: false,
	},
	{
		feature: "Bulk ZIP File Uploads",
		us: true,
		b2bParsers: "limited",
		b2cBuilders: false,
	},
	{
		feature: "Unlimited Free Seeker Access",
		us: true,
		b2bParsers: false,
		b2cBuilders: "limited",
	},
];

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
			{/* Hero Section */}
			<div className="max-w-7xl mx-auto">
				<section className="relative overflow-hidden px-4 py-20 sm:py-32">
					<div className="absolute inset-0 overflow-hidden">
						<div className="fixed -top-20 sm:-top-40 -right-20 sm:-right-40 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-[#76ABAE] opacity-20 blur-3xl" />
						<div className="fixed -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-[#76ABAE] opacity-20 blur-3xl" />
					</div>
					<div className="relative z-10 container mx-auto text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
						>
							<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#EEEEEE] to-[#76ABAE] mb-6">
								The AI-Powered Talent Revolution
							</h1>
							<p className="text-lg sm:text-xl md:text-2xl text-[#EEEEEE]/80 mb-8 max-w-4xl mx-auto">
								Transforming Recruitment with Intelligent Resume Analysis and
								Precision Job Matching
							</p>
						</motion.div>
					</div>
				</section>

				{/* Problem Statement */}
				<section className="py-16 px-4">
					<div className="container mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-center mb-12"
						>
							<h2 className="text-3xl font-bold text-[#EEEEEE] mb-4">
								The Challenge of Modern Hiring
							</h2>
							<p className="text-lg text-[#EEEEEE]/70 max-w-3xl mx-auto">
								Traditional hiring is drowning in data. With application volumes
								soaring, recruiters face an impossible task of manual screening,
								leading to inefficiency, high costs, and missed talent.
							</p>
						</motion.div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{marketStats.map((stat, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: index * 0.1 }}
								>
									<Card className="relative backdrop-blur-lg bg-white/5 border border-white/10 p-8 text-center">
										<div
											className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color} rounded-t-lg`}
										/>
										<stat.icon className="h-12 w-12 text-[#76ABAE] mx-auto mb-4" />
										<div
											className={`text-6xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
										>
											{stat.value}
										</div>
										<p className="text-lg font-semibold text-[#EEEEEE] mb-2">
											{stat.label}
										</p>
										<p className="text-[#EEEEEE]/60">{stat.description}</p>
									</Card>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Market Growth Visualization */}
				<section className="py-16 px-4">
					<div className="container mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-center mb-12"
						>
							<h2 className="text-3xl font-bold text-[#EEEEEE] mb-4">
								Sizing the Opportunity: A Market in Hyper-Growth
							</h2>
							<p className="text-lg text-[#EEEEEE]/70 max-w-3xl mx-auto">
								Our platform operates at the intersection of several rapidly
								expanding markets. The shift towards AI-driven solutions is not
								just a trend; it's the primary engine of growth in HR
								Technology.
							</p>
						</motion.div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8 }}
							>
								<Card className="backdrop-blur-lg bg-white/5 border border-white/10 p-6">
									<h3 className="text-xl font-bold text-center mb-4 text-[#EEEEEE]">
										The AI in HR Growth Imperative (2024-2029)
									</h3>
									<p className="text-sm text-center text-[#EEEEEE]/60 mb-6">
										The AI in HR market's projected 19.1% CAGR far outpaces the
										broader HR software market, signaling a fundamental shift
										towards intelligent, automated solutions as a strategic
										necessity.
									</p>
									<div className="space-y-4">
										<div className="flex justify-between items-center">
											<span className="text-[#EEEEEE]">AI in HR Market</span>
											<Badge className="bg-red-500/20 text-red-300 border-red-400">
												CAGR 19.1%
											</Badge>
										</div>
										<div className="grid grid-cols-3 gap-4 text-center">
											<div>
												<div className="text-2xl font-bold text-red-400">
													$6.05B
												</div>
												<div className="text-xs text-[#EEEEEE]/60">2024</div>
											</div>
											<div>
												<div className="text-2xl font-bold text-red-400">
													$10.08B
												</div>
												<div className="text-xs text-[#EEEEEE]/60">2027</div>
											</div>
											<div>
												<div className="text-2xl font-bold text-red-400">
													$14.08B
												</div>
												<div className="text-xs text-[#EEEEEE]/60">2029</div>
											</div>
										</div>
									</div>
								</Card>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, x: 20 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8 }}
							>
								<Card className="backdrop-blur-lg bg-white/5 border border-white/10 p-6">
									<h3 className="text-xl font-bold text-center mb-4 text-[#EEEEEE]">
										Resume Parsing Market Explosion
									</h3>
									<p className="text-sm text-center text-[#EEEEEE]/60 mb-6">
										The market for specialized resume parsing is set to more
										than double by 2029, driven by the critical need to automate
										and streamline the top of the hiring funnel.
									</p>
									<div className="space-y-4">
										<div className="flex justify-between items-center">
											<span className="text-[#EEEEEE]">
												Resume Parsing Market
											</span>
											<Badge className="bg-blue-500/20 text-blue-300 border-blue-400">
												114% Growth
											</Badge>
										</div>
										<div className="grid grid-cols-2 gap-8 text-center">
											<div>
												<div className="text-3xl font-bold text-blue-400">
													$20.19B
												</div>
												<div className="text-sm text-[#EEEEEE]/60">2024</div>
											</div>
											<div>
												<div className="text-3xl font-bold text-blue-400">
													$43.20B
												</div>
												<div className="text-sm text-[#EEEEEE]/60">2029</div>
											</div>
										</div>
									</div>
								</Card>
							</motion.div>
						</div>
					</div>
				</section>
				{/* Workflow Section */}
				<section className="py-16 px-4">
					<div className="container mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-center mb-12"
						>
							<h2 className="text-3xl font-bold text-[#EEEEEE] mb-4">
								Our Solution: The Intelligent Workflow
							</h2>
							<p className="text-lg text-[#EEEEEE]/70 max-w-3xl mx-auto">
								We automate the entire screening process from start to finish,
								transforming raw resumes into actionable intelligence for both
								job seekers and employers.
							</p>
						</motion.div>

						<Card className="backdrop-blur-lg bg-white/5 border border-white/10 p-8 relative overflow-hidden">
							{/* Enhanced Background Pattern */}
							<div className="absolute inset-0 opacity-5">
								<div
									className="absolute top-0 left-0 w-full h-full"
									style={{
										backgroundImage: `
										radial-gradient(circle at 25% 25%, #76ABAE 1px, transparent 1px), 
										radial-gradient(circle at 75% 75%, #76ABAE 1px, transparent 1px),
										linear-gradient(45deg, transparent 40%, rgba(118, 171, 174, 0.1) 45%, rgba(118, 171, 174, 0.1) 55%, transparent 60%)
									`,
										backgroundSize: "50px 50px, 50px 50px, 100px 100px",
									}}
								></div>
							</div>

							<div className="relative max-w-7xl mx-auto overflow-x-auto">
								{/* Enhanced flowchart with grid layout */}
								<div className="min-w-[1200px] relative">
									{/* Start Node */}
									<div className="flex justify-center mb-8">
										<motion.div
											initial={{ opacity: 0, scale: 0.8 }}
											whileInView={{ opacity: 1, scale: 1 }}
											whileHover={{
												scale: 1.05,
												boxShadow: "0 25px 50px -12px rgba(236, 72, 153, 0.3)",
											}}
											transition={{ duration: 0.6 }}
											className="bg-gradient-to-br from-pink-500/30 to-pink-600/20 border-3 border-pink-400 text-pink-200 rounded-full px-10 py-5 font-bold text-xl shadow-2xl hover:shadow-pink-500/40 cursor-pointer relative overflow-hidden"
										>
											<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
											<div className="relative z-10">START</div>
										</motion.div>
									</div>

									{/* Connector */}
									<div className="flex justify-center mb-6">
										<div className="w-px h-12 bg-gradient-to-b from-pink-400 to-[#76ABAE] relative">
											<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#76ABAE] rotate-45"></div>
										</div>
									</div>

									{/* Enhanced File Upload Section */}
									<div className="flex justify-center mb-8">
										<motion.div
											initial={{ opacity: 0, x: -50 }}
											whileInView={{ opacity: 1, x: 0 }}
											whileHover={{ scale: 1.05, y: -3 }}
											transition={{ duration: 0.6, delay: 0.1 }}
											className="bg-gradient-to-br from-blue-500/30 to-blue-600/20 border-3 border-blue-400 text-blue-200 rounded-xl px-10 py-6 text-center font-semibold shadow-2xl min-w-[380px] hover:shadow-blue-500/40 cursor-pointer relative overflow-hidden group"
										>
											<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
											<div className="relative z-10">
												<div className="font-bold text-xl mb-3 flex items-center justify-center space-x-3">
													<span>FILE UPLOAD</span>
												</div>
												<div className="grid grid-cols-2 gap-3 text-sm mb-3">
													<div className="bg-blue-500/20 rounded-lg px-3 py-2">
														<div className="font-semibold">Formats</div>
														<div className="text-xs opacity-90">
															ZIP, PDF, TXT, DOCX
														</div>
													</div>
													<div className="bg-blue-500/20 rounded-lg px-3 py-2">
														<div className="font-semibold">Max Size</div>
														<div className="text-xs opacity-90">
															10MB per file
														</div>
													</div>
												</div>
												<div className="text-xs opacity-70 flex items-center justify-center space-x-4">
													<span>• Drag & Drop Support</span>
													<span>• Batch Processing</span>
													<span>• Auto-validation</span>
												</div>
											</div>
										</motion.div>
									</div>

									{/* Connector */}
									<div className="flex justify-center mb-8">
										<div className="w-px h-12 bg-gradient-to-b from-blue-400 to-orange-400 relative">
											<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-orange-400 rotate-45"></div>
										</div>
									</div>

									{/* File Type Check Decision */}
									<div className="flex justify-center mb-8">
										<motion.div
											initial={{ opacity: 0, scale: 0.8 }}
											whileInView={{ opacity: 1, scale: 1 }}
											whileHover={{ scale: 1.05 }}
											transition={{ duration: 0.6, delay: 0.2 }}
											className="bg-gradient-to-br from-orange-500/30 to-orange-600/20 border-3 border-orange-400 text-orange-200 rounded-xl px-8 py-6 text-center font-semibold shadow-2xl min-w-[280px] hover:shadow-orange-500/40 cursor-pointer relative overflow-hidden"
										>
											<div className="relative z-10">
												<div className="font-bold text-lg mb-1">
													IS ZIP FILE?
												</div>
												<div className="text-xs opacity-80">
													Check file format
												</div>
											</div>
										</motion.div>
									</div>

									{/* Branch Separators */}
									<div className="relative mb-8">
										<div className="flex justify-center">
											<div className="w-64 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
										</div>
										<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-orange-400 to-transparent"></div>
									</div>

									{/* Main Processing Flow */}
									<div className="grid grid-cols-3 gap-12 mb-8">
										{/* ZIP Path (Left) */}
										<div className="flex flex-col items-center space-y-6">
											<motion.div
												initial={{ opacity: 0, x: -30 }}
												whileInView={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.6, delay: 0.3 }}
												className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg"
											>
												✅ Yes - ZIP File
											</motion.div>

											{/* ZIP Extraction */}
											<motion.div
												initial={{ opacity: 0, y: 20 }}
												whileInView={{ opacity: 1, y: 0 }}
												whileHover={{ scale: 1.05 }}
												transition={{ duration: 0.6, delay: 0.4 }}
												className="bg-gradient-to-br from-indigo-500/30 to-indigo-600/20 border-3 border-indigo-400 text-indigo-200 rounded-xl px-6 py-5 text-center font-semibold shadow-2xl hover:shadow-indigo-500/40 cursor-pointer w-full"
											>
												<div className="font-bold text-lg mb-2">
													EXTRACT FILES
												</div>
												<div className="text-sm opacity-80">
													Unzip and validate contents
												</div>
											</motion.div>

											{/* Processing Multiple Files */}
											<motion.div
												initial={{ opacity: 0, y: 20 }}
												whileInView={{ opacity: 1, y: 0 }}
												whileHover={{ scale: 1.05 }}
												transition={{ duration: 0.6, delay: 0.5 }}
												className="bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 border-3 border-cyan-400 text-cyan-200 rounded-xl px-6 py-5 text-center font-semibold shadow-2xl hover:shadow-cyan-500/40 cursor-pointer w-full"
											>
												<div className="font-bold text-lg mb-2">
													BATCH PROCESS
												</div>
												<div className="text-sm opacity-80">
													Handle multiple PDFs
												</div>
											</motion.div>
										</div>

										{/* Single File Path (Center) */}
										<div className="flex flex-col items-center space-y-6">
											<motion.div
												initial={{ opacity: 0, x: 0 }}
												whileInView={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.6, delay: 0.3 }}
												className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg"
											>
												📄 No - Single File
											</motion.div>

											{/* Direct Processing */}
											<motion.div
												initial={{ opacity: 0, y: 20 }}
												whileInView={{ opacity: 1, y: 0 }}
												whileHover={{ scale: 1.05 }}
												transition={{ duration: 0.6, delay: 0.4 }}
												className="bg-gradient-to-br from-blue-500/30 to-blue-600/20 border-3 border-blue-400 text-blue-200 rounded-xl px-6 py-5 text-center font-semibold shadow-2xl hover:shadow-blue-500/40 cursor-pointer w-full"
											>
												<div className="font-bold text-lg mb-2">
													🔄 DIRECT PROCESS
												</div>
												<div className="text-sm opacity-80">
													Single file handling
												</div>
											</motion.div>

											{/* File Validation */}
											<motion.div
												initial={{ opacity: 0, scale: 0.8 }}
												whileInView={{ opacity: 1, scale: 1 }}
												whileHover={{ scale: 1.05 }}
												transition={{ duration: 0.6, delay: 0.5 }}
												className="bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 border-3 border-yellow-400 text-yellow-200 rounded-xl px-6 py-5 text-center font-semibold shadow-2xl hover:shadow-yellow-500/40 cursor-pointer w-full"
											>
												<div className="font-bold text-lg mb-1">
													VALIDATE FILE
												</div>
												<div className="text-xs opacity-80">
													Check if valid resume
												</div>
											</motion.div>
										</div>

										{/* Error Path (Right) */}
										<div className="flex flex-col items-center space-y-6">
											<motion.div
												initial={{ opacity: 0, x: 30 }}
												whileInView={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.6, delay: 0.3 }}
												className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg"
											>
												❌ Invalid Format
											</motion.div>

											{/* Error Display */}
											<motion.div
												initial={{ opacity: 0, y: 20 }}
												whileInView={{ opacity: 1, y: 0 }}
												whileHover={{ scale: 1.05 }}
												transition={{ duration: 0.6, delay: 0.4 }}
												className="bg-gradient-to-br from-red-500/30 to-red-600/20 border-3 border-red-400 text-red-200 rounded-xl px-6 py-5 text-center font-semibold shadow-2xl hover:shadow-red-500/40 cursor-pointer w-full"
											>
												<div className="font-bold text-lg mb-2">SHOW ERROR</div>
												<div className="text-sm opacity-80">
													Display warning message
												</div>
											</motion.div>

											{/* Stop */}
											<motion.div
												initial={{ opacity: 0, scale: 0.8 }}
												whileInView={{ opacity: 1, scale: 1 }}
												whileHover={{ scale: 1.05 }}
												transition={{ duration: 0.6, delay: 0.5 }}
												className="bg-gradient-to-br from-red-500/30 to-red-600/20 border-3 border-red-400 text-red-200 rounded-full px-8 py-4 font-bold text-lg shadow-2xl hover:shadow-red-500/40 cursor-pointer"
											>
												STOP
											</motion.div>
										</div>
									</div>

									{/* Convergence Point */}
									<div className="flex justify-center mb-8">
										<div className="w-32 h-px bg-gradient-to-r from-transparent via-[#76ABAE] to-transparent"></div>
									</div>

									{/* AI Processing Pipeline */}
									<div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-400/30 mb-8">
										<div className="text-center mb-8">
											<h3 className="text-2xl font-bold text-purple-300 mb-3">
												AI Processing Engine
											</h3>
											<p className="text-sm text-purple-200/70 mb-4">
												Advanced machine learning pipeline with 8-stage
												processing
											</p>
											<div className="flex justify-center items-center space-x-4 text-xs text-purple-200/60">
												<div className="flex items-center space-x-1">
													<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
													<span>Real-time Processing</span>
												</div>
												<div className="flex items-center space-x-1">
													<div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
													<span>Multi-model Architecture</span>
												</div>
												<div className="flex items-center space-x-1">
													<div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
													<span>Continuous Learning</span>
												</div>
											</div>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
											{[
												{
													step: "DOCUMENT PARSING",
													desc: "Multi-format content extraction",
													icon: "",
													color: "blue",
													details: "PyPDF2, python-docx, OCR",
													stage: "Input Layer",
													processing:
														"File format detection → Content extraction → Structure analysis",
												},
												{
													step: "CONTENT VALIDATION",
													desc: "Resume structure verification",
													icon: "",
													color: "orange",
													decision: true,
													details: "Pattern matching, Layout analysis",
													stage: "Validation Layer",
													processing:
														"Structure check → Content quality → Format validation",
												},
												{
													step: "ENTITY EXTRACTION",
													desc: "Personal & professional data",
													icon: "",
													color: "green",
													details: "spaCy NER, Custom models",
													stage: "NLP Layer",
													processing:
														"Contact info → Education → Work history → Skills",
												},
												{
													step: "TEXT PREPROCESSING",
													desc: "Clean & normalize content",
													icon: "",
													color: "teal",
													details: "NLTK, Text normalization",
													stage: "Preprocessing",
													processing:
														"Tokenization → Stemming → Stop word removal",
												},
												{
													step: "SKILL CLASSIFICATION",
													desc: "Technical & soft skills categorization",
													icon: "",
													color: "purple",
													details: "ML classifiers, Skill taxonomy",
													stage: "ML Processing",
													processing:
														"Skill extraction → Category mapping → Proficiency scoring",
												},
												{
													step: "EXPERIENCE ANALYSIS",
													desc: "Career progression & roles",
													icon: "",
													color: "indigo",
													details: "Timeline analysis, Role mapping",
													stage: "Career Intelligence",
													processing:
														"Duration calculation → Role hierarchy → Progress tracking",
												},
												{
													step: "FIELD PREDICTION",
													desc: "Job category recommendation",
													icon: "",
													color: "pink",
													details: "Ensemble models, Deep learning",
													stage: "AI Prediction",
													processing:
														"Feature engineering → Model inference → Confidence scoring",
												},
												{
													step: "QUALITY SCORING",
													desc: "Resume effectiveness rating",
													icon: "",
													color: "yellow",
													details: "Multi-criteria evaluation",
													stage: "Quality Assessment",
													processing:
														"Content completeness → ATS compatibility → Presentation score",
												},
											].map((item, index) => (
												<motion.div
													key={index}
													initial={{ opacity: 0, y: 30 }}
													whileInView={{ opacity: 1, y: 0 }}
													whileHover={{
														scale: item.decision ? 1.05 : 1.03,
														y: -8,
													}}
													transition={{
														duration: 0.6,
														delay: 0.6 + index * 0.08,
													}}
													className={`
													border-3 text-center font-semibold shadow-2xl px-4 py-6 cursor-pointer relative overflow-hidden group
													${item.decision ? "rounded-xl" : "rounded-xl"}
													${
														item.color === "blue"
															? "bg-gradient-to-br from-blue-500/30 to-blue-600/20 border-blue-400 text-blue-200 hover:shadow-blue-500/40"
															: ""
													}
													${
														item.color === "orange"
															? "bg-gradient-to-br from-orange-500/30 to-orange-600/20 border-orange-400 text-orange-200 hover:shadow-orange-500/40"
															: ""
													}
													${
														item.color === "green"
															? "bg-gradient-to-br from-green-500/30 to-green-600/20 border-green-400 text-green-200 hover:shadow-green-500/40"
															: ""
													}
													${
														item.color === "teal"
															? "bg-gradient-to-br from-teal-500/30 to-teal-600/20 border-teal-400 text-teal-200 hover:shadow-teal-500/40"
															: ""
													}
													${
														item.color === "purple"
															? "bg-gradient-to-br from-purple-500/30 to-purple-600/20 border-purple-400 text-purple-200 hover:shadow-purple-500/40"
															: ""
													}
													${
														item.color === "indigo"
															? "bg-gradient-to-br from-indigo-500/30 to-indigo-600/20 border-indigo-400 text-indigo-200 hover:shadow-indigo-500/40"
															: ""
													}
													${
														item.color === "pink"
															? "bg-gradient-to-br from-pink-500/30 to-pink-600/20 border-pink-400 text-pink-200 hover:shadow-pink-500/40"
															: ""
													}
													${
														item.color === "yellow"
															? "bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 border-yellow-400 text-yellow-200 hover:shadow-yellow-500/40"
															: ""
													}
												`}
												>
													{/* Enhanced shimmer effect */}
													<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1200"></div>
													<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

													<div className="relative z-10">
														<div className="font-bold text-base mb-2">
															{item.step}
														</div>
														<div className="text-sm opacity-90 mb-3">
															{item.desc}
														</div>
														<div className="text-xs opacity-70 bg-black/30 rounded-lg px-2 py-1 mb-2">
															{item.stage}
														</div>
														<div className="text-xs opacity-60 bg-black/20 rounded px-2 py-1 mb-2">
															{item.details}
														</div>
														{/* Processing details on hover */}
														<div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40 rounded p-2 mt-2 border border-white/10">
															{item.processing}
														</div>
													</div>
												</motion.div>
											))}
										</div>

										{/* AI Model Performance Indicators */}
										<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
											{" "}
											{[
												{
													model: "NER Model",
													accuracy: "96.8%",
													type: "Named Entity Recognition",
													icon: "",
												},
												{
													model: "Classification Model",
													accuracy: "94.2%",
													type: "Job Field Prediction",
													icon: "",
												},
												{
													model: "Quality Scorer",
													accuracy: "91.5%",
													type: "Resume Assessment",
													icon: "",
												},
											].map((model, index) => (
												<motion.div
													key={index}
													initial={{ opacity: 0, scale: 0.9 }}
													whileInView={{ opacity: 1, scale: 1 }}
													whileHover={{ scale: 1.05, y: -2 }}
													transition={{
														duration: 0.5,
														delay: 1.0 + index * 0.1,
													}}
													className="bg-white/5 border border-purple-400/30 rounded-lg p-4 text-center hover:bg-white/10 cursor-pointer group"
												>
													<div className="font-bold text-purple-300 mb-1">
														{model.model}
													</div>
													<div className="text-sm text-[#EEEEEE]/70 mb-2">
														{model.type}
													</div>
													<div className="text-lg font-bold text-green-400">
														{model.accuracy}
													</div>
												</motion.div>
											))}
										</div>
									</div>

									{/* Enhanced Results & Storage */}
									<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
										<motion.div
											initial={{ opacity: 0, y: 30 }}
											whileInView={{ opacity: 1, y: 0 }}
											whileHover={{ scale: 1.05, y: -5 }}
											transition={{ duration: 0.6, delay: 1.0 }}
											className="bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 border-3 border-cyan-400 text-cyan-200 rounded-xl px-6 py-6 text-center font-semibold shadow-2xl hover:shadow-cyan-500/40 cursor-pointer relative overflow-hidden group"
										>
											<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
											<div className="relative z-10">
												<div className="font-bold text-lg mb-2">
													SECURE STORAGE
												</div>
												<div className="text-sm opacity-80 mb-3">
													PostgreSQL Database
												</div>
												<div className="space-y-1 text-xs opacity-70">
													<div className="bg-cyan-500/20 rounded px-2 py-1">
														Encrypted at rest
													</div>
													<div className="bg-cyan-500/20 rounded px-2 py-1">
														ACID compliance
													</div>
													<div className="bg-cyan-500/20 rounded px-2 py-1">
														Backup redundancy
													</div>
												</div>
											</div>
										</motion.div>

										<motion.div
											initial={{ opacity: 0, y: 30 }}
											whileInView={{ opacity: 1, y: 0 }}
											whileHover={{ scale: 1.05, y: -5 }}
											transition={{ duration: 0.6, delay: 1.1 }}
											className="bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-3 border-emerald-400 text-emerald-200 rounded-xl px-6 py-6 text-center font-semibold shadow-2xl hover:shadow-emerald-500/40 cursor-pointer relative overflow-hidden group"
										>
											<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
											<div className="relative z-10">
												<div className="font-bold text-lg mb-2">
													SMART ANALYTICS
												</div>
												<div className="text-sm opacity-80 mb-3">
													Interactive Dashboard
												</div>
												<div className="space-y-1 text-xs opacity-70">
													<div className="bg-emerald-500/20 rounded px-2 py-1">
														Real-time charts
													</div>
													<div className="bg-emerald-500/20 rounded px-2 py-1">
														Skill mapping
													</div>
													<div className="bg-emerald-500/20 rounded px-2 py-1">
														Career insights
													</div>
												</div>
											</div>
										</motion.div>

										<motion.div
											initial={{ opacity: 0, y: 30 }}
											whileInView={{ opacity: 1, y: 0 }}
											whileHover={{ scale: 1.05, y: -5 }}
											transition={{ duration: 0.6, delay: 1.2 }}
											className="bg-gradient-to-br from-blue-500/30 to-blue-600/20 border-3 border-blue-400 text-blue-200 rounded-xl px-6 py-6 text-center font-semibold shadow-2xl hover:shadow-blue-500/40 cursor-pointer relative overflow-hidden group"
										>
											<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
											<div className="relative z-10">
												<div className="font-bold text-lg mb-2">
													RESPONSIVE UI
												</div>
												<div className="text-sm opacity-80 mb-3">
													Cross-platform Access
												</div>
												<div className="space-y-1 text-xs opacity-70">
													<div className="bg-blue-500/20 rounded px-2 py-1">
														Mobile optimized
													</div>
													<div className="bg-blue-500/20 rounded px-2 py-1">
														Real-time updates
													</div>
													<div className="bg-blue-500/20 rounded px-2 py-1">
														Export options
													</div>
												</div>
											</div>
										</motion.div>
									</div>

									{/* Final Success Node */}
									<div className="flex justify-center">
										<motion.div
											initial={{ opacity: 0, scale: 0.8 }}
											whileInView={{ opacity: 1, scale: 1 }}
											whileHover={{
												scale: 1.05,
												boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.3)",
											}}
											transition={{ duration: 0.6, delay: 1.3 }}
											className="bg-gradient-to-br from-green-500/30 to-green-600/20 border-3 border-green-400 text-green-200 rounded-full px-12 py-6 font-bold text-xl shadow-2xl hover:shadow-green-500/40 cursor-pointer relative overflow-hidden"
										>
											<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
											<div className="relative z-10 flex items-center space-x-3">
												<span>SUCCESS</span>
											</div>
										</motion.div>
									</div>
								</div>
							</div>

							{/* Enhanced Statistics Dashboard */}
							<div className="mt-12 space-y-8">
								{/* Real-time Performance Metrics */}
								<div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-400/30">
									<h3 className="text-xl font-bold text-center text-blue-300 mb-6">
										Live Performance Dashboard
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
										{[
											{
												label: "Avg Processing Speed",
												value: "< 30 sec",
												icon: "",
												color: "from-green-500 to-emerald-600",
												detail: "Per document analysis",
											},
											{
												label: "ML Accuracy Rate",
												value: "98.5%",
												icon: "",
												color: "from-blue-500 to-cyan-600",
												detail: "Job field prediction",
											},
											{
												label: "Supported Formats",
												value: "4 Types",
												icon: "",
												color: "from-purple-500 to-pink-600",
												detail: "PDF, TXT, DOCX, ZIP",
											},
											{
												label: "Concurrent Processing",
												value: "1000+",
												icon: "",
												color: "from-orange-500 to-red-600",
												detail: "Simultaneous users",
											},
										].map((stat, index) => (
											<motion.div
												key={index}
												initial={{ opacity: 0, y: 20 }}
												whileInView={{ opacity: 1, y: 0 }}
												whileHover={{ scale: 1.08, y: -5 }}
												transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
												className="relative bg-white/5 border border-white/20 rounded-xl p-5 text-center backdrop-blur-sm hover:bg-white/10 cursor-pointer overflow-hidden group"
											>
												{/* Animated background gradient */}
												<div
													className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
												></div>
												<div
													className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000`}
												></div>

												<div className="relative z-10">
													<div className="text-[#EEEEEE] font-bold text-xl mb-1 group-hover:text-blue-300 transition-colors duration-300">
														{stat.value}
													</div>
													<div className="text-[#EEEEEE]/70 text-sm font-semibold mb-2">
														{stat.label}
													</div>
													<div className="text-[#EEEEEE]/50 text-xs bg-black/20 rounded-full px-2 py-1">
														{stat.detail}
													</div>
												</div>
											</motion.div>
										))}
									</div>
								</div>

								{/* Processing Volume & Scalability */}
								<div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl p-6 border border-green-400/30">
									<h3 className="text-xl font-bold text-center text-green-300 mb-6">
										Scalability & Volume Metrics
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
										{[
											{
												title: "Daily Processing",
												value: "50K+",
												subtitle: "Resumes per day",
												icon: "",
												trend: "+23%",
											},
											{
												title: "Peak Capacity",
												value: "10K/hr",
												subtitle: "Documents per hour",
												icon: "",
												trend: "+45%",
											},
											{
												title: "Storage Efficiency",
												value: "2.3TB",
												subtitle: "Processed data",
												icon: "",
												trend: "+67%",
											},
											{
												title: "Global Reach",
												value: "15 Regions",
												subtitle: "CDN deployment",
												icon: "",
												trend: "+8%",
											},
										].map((metric, index) => (
											<motion.div
												key={index}
												initial={{ opacity: 0, y: 30 }}
												whileInView={{ opacity: 1, y: 0 }}
												whileHover={{ scale: 1.05, y: -3 }}
												transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
												className="bg-white/5 border border-white/20 rounded-xl p-4 text-center backdrop-blur-sm hover:bg-white/10 cursor-pointer group relative overflow-hidden"
											>
												<div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 group-hover:from-green-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
												<div className="relative z-10">
													<div className="text-[#EEEEEE] font-bold text-2xl mb-1">
														{metric.value}
													</div>
													<div className="text-[#EEEEEE]/70 text-sm font-semibold mb-2">
														{metric.title}
													</div>
													<div className="text-[#EEEEEE]/50 text-xs mb-2">
														{metric.subtitle}
													</div>
													<div className="inline-flex items-center space-x-1 bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
														<span>↗</span>
														<span>{metric.trend}</span>
													</div>
												</div>
											</motion.div>
										))}
									</div>
								</div>
							</div>
						</Card>
					</div>
				</section>

				{/* Technical Architecture */}
				<section className="py-16 px-4">
					<div className="container mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-center mb-12"
						>
							<h2 className="text-3xl font-bold text-[#EEEEEE] mb-4">
								Technical Architecture: Powering the Platform
							</h2>
							<p className="text-lg text-[#EEEEEE]/70 max-w-3xl mx-auto">
								Our robust and scalable architecture is built on modern,
								efficient technologies to deliver high performance and seamless
								user experiences.
							</p>
						</motion.div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{techStack.map((category, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: index * 0.1 }}
								>
									<Card
										className={`backdrop-blur-lg bg-white/5 border-t-4 ${category.color} border-x border-b border-white/10 p-6 h-full`}
									>
										<div className="flex items-center mb-4">
											<category.icon className="h-8 w-8 text-[#76ABAE] mr-3" />
											<h3 className="text-xl font-bold text-[#EEEEEE]">
												{category.category}
											</h3>
										</div>
										<ul className="space-y-3">
											{category.technologies.map((tech, techIndex) => (
												<li key={techIndex} className="text-[#EEEEEE]/70">
													<strong className="text-[#EEEEEE]">
														{tech.name}:
													</strong>{" "}
													{tech.description}
												</li>
											))}
										</ul>
									</Card>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="py-16 px-4">
					<div className="container mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-center mb-12"
						>
							<h2 className="text-3xl font-bold text-[#EEEEEE] mb-4">
								A Dual-Sided Value Proposition
							</h2>
							<p className="text-lg text-[#EEEEEE]/70 max-w-3xl mx-auto">
								We've built a powerful ecosystem that delivers unique, tangible
								benefits to both job seekers and employers, creating a virtuous
								cycle of high-quality talent and opportunity.
							</p>
						</motion.div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{/* Job Seekers */}
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8 }}
							>
								<Card className="backdrop-blur-lg bg-white/5 border border-white/10 p-8 h-full">
									<h3 className="text-2xl font-bold text-[#76ABAE] mb-6">
										For Job Seekers: Empowering Your Search
									</h3>
									<ul className="space-y-6">
										{features.jobSeekers.map((feature, index) => (
											<li key={index} className="flex items-start">
												<CheckCircle className="h-6 w-6 text-[#76ABAE] mr-4 mt-1 flex-shrink-0" />
												<div>
													<div className="font-semibold text-[#EEEEEE] mb-1">
														{feature.title}
													</div>
													<div className="text-[#EEEEEE]/70">
														{feature.description}
													</div>
												</div>
											</li>
										))}
									</ul>
								</Card>
							</motion.div>

							{/* Employers */}
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8 }}
							>
								<Card className="backdrop-blur-lg bg-white/5 border border-white/10 p-8 h-full">
									<h3 className="text-2xl font-bold text-[#76ABAE] mb-6">
										For Employers: Streamlining Your Hiring
									</h3>
									<ul className="space-y-6">
										{features.employers.map((feature, index) => (
											<li key={index} className="flex items-start">
												<CheckCircle className="h-6 w-6 text-[#76ABAE] mr-4 mt-1 flex-shrink-0" />
												<div>
													<div className="font-semibold text-[#EEEEEE] mb-1">
														{feature.title}
													</div>
													<div className="text-[#EEEEEE]/70">
														{feature.description}
													</div>
												</div>
											</li>
										))}
									</ul>
								</Card>
							</motion.div>
						</div>
					</div>
				</section>

				{/* Competitive Edge */}
				<section className="py-16 px-4">
					<div className="container mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-center mb-12"
						>
							<h2 className="text-3xl font-bold text-[#EEEEEE] mb-4">
								The Competitive Edge
							</h2>
							<p className="text-lg text-[#EEEEEE]/70 max-w-3xl mx-auto">
								While the market has many players, our platform's unique,
								integrated approach creates a distinct and defensible advantage.
								We bridge the gap between B2B efficiency tools and B2C career
								services.
							</p>
						</motion.div>

						<Card className="backdrop-blur-lg bg-white/5 border border-white/10 p-6 overflow-x-auto">
							<table className="w-full text-left">
								<thead>
									<tr className="border-b-2 border-white/20">
										<th className="p-4 font-bold text-lg text-[#EEEEEE]">
											Feature
										</th>
										<th className="p-4 font-bold text-lg text-center text-[#76ABAE]">
											Our Platform
										</th>
										<th className="p-4 font-bold text-lg text-center text-[#EEEEEE]">
											Typical B2B Parsers
										</th>
										<th className="p-4 font-bold text-lg text-center text-[#EEEEEE]">
											Typical B2C Builders
										</th>
									</tr>
								</thead>
								<tbody>
									{competitiveEdge.map((row, index) => (
										<tr
											key={index}
											className={`border-b border-white/10 ${
												index % 2 === 1 ? "bg-white/5" : ""
											}`}
										>
											<td className="p-4 font-semibold text-[#EEEEEE]">
												{row.feature}
											</td>
											<td className="p-4 text-3xl text-center text-green-400 font-bold">
												{row.us ? "✓" : "✗"}
											</td>
											<td className="p-4 text-3xl text-center font-bold">
												{row.b2bParsers === true ? (
													<span className="text-green-400">✓</span>
												) : row.b2bParsers === "limited" ? (
													<span className="text-yellow-400">△</span>
												) : (
													<span className="text-red-400">✗</span>
												)}
											</td>
											<td className="p-4 text-3xl text-center font-bold">
												{row.b2cBuilders === true ? (
													<span className="text-green-400">✓</span>
												) : row.b2cBuilders === "limited" ? (
													<span className="text-yellow-400">△</span>
												) : (
													<span className="text-red-400">✗</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
							<p className="text-xs text-center text-[#EEEEEE]/50 mt-4">
								✓ = Full Support | △ = Limited/Paid Support | ✗ = No Support
							</p>
						</Card>
					</div>
				</section>

				{/* Target Market Section */}
				<section className="py-16 px-4">
					<div className="container mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-center mb-12"
						>
							<h2 className="text-3xl font-bold text-[#EEEEEE] mb-4">
								Who We Serve: Target Industries
							</h2>
							<p className="text-lg text-[#EEEEEE]/70 max-w-3xl mx-auto">
								Our platform is sector-agnostic, but we see immediate traction
								in industries with high-volume recruitment and a strong reliance
								on technology for talent acquisition.
							</p>
						</motion.div>

						<Card className="backdrop-blur-lg bg-white/5 border border-white/10 p-6">
							<h3 className="text-xl font-bold text-center mb-4 text-[#EEEEEE]">
								HR Software Adoption by Industry Sector
							</h3>
							<p className="text-sm text-center text-[#EEEEEE]/60 mb-8">
								The IT & Telecommunications and BFSI sectors represent nearly
								half of the HR software market, making them prime targets for
								initial market penetration due to their high adoption rates and
								significant recruitment needs.
							</p>

							{/* CSS Pie Chart */}
							<div className="flex flex-col lg:flex-row items-center justify-center gap-12">
								{/* Pie Chart */}
								<motion.div
									initial={{ opacity: 0, scale: 0.8 }}
									whileInView={{ opacity: 1, scale: 1 }}
									transition={{ duration: 1.2 }}
									className="relative"
								>
									<div
										className="w-80 h-80 rounded-full relative overflow-hidden shadow-2xl"
										style={{
											background: `conic-gradient(
											from 0deg,
											#3b82f6 0deg ${25 * 3.6}deg,
											#10b981 ${25 * 3.6}deg ${(25 + 20) * 3.6}deg,
											#8b5cf6 ${(25 + 20) * 3.6}deg ${(25 + 20 + 15) * 3.6}deg,
											#f97316 ${(25 + 20 + 15) * 3.6}deg ${(25 + 20 + 15 + 12) * 3.6}deg,
											#ef4444 ${(25 + 20 + 15 + 12) * 3.6}deg ${(25 + 20 + 15 + 12 + 10) * 3.6}deg,
											#6b7280 ${(25 + 20 + 15 + 12 + 10) * 3.6}deg 360deg
										)`,
										}}
									>
										{/* Inner circle to create donut effect */}
										<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] rounded-full border-4 border-white/10 flex items-center justify-center">
											<div className="text-center">
												<div className="text-2xl font-bold text-[#EEEEEE]">
													100%
												</div>
												<div className="text-xs text-[#EEEEEE]/60">Market</div>
											</div>
										</div>
									</div>
								</motion.div>

								{/* Legend */}
								<div className="space-y-4">
									{[
										{ name: "IT & Telecom", percentage: 25, color: "#3b82f6" },
										{
											name: "Banking & Financial Services",
											percentage: 20,
											color: "#10b981",
										},
										{ name: "Healthcare", percentage: 15, color: "#8b5cf6" },
										{ name: "Retail", percentage: 12, color: "#f97316" },
										{ name: "Manufacturing", percentage: 10, color: "#ef4444" },
										{ name: "Other", percentage: 18, color: "#6b7280" },
									].map((industry, index) => (
										<motion.div
											key={index}
											initial={{ opacity: 0, x: 20 }}
											whileInView={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.8, delay: index * 0.1 }}
											className="flex items-center space-x-3 group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all duration-300"
										>
											<div
												className="w-4 h-4 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
												style={{ backgroundColor: industry.color }}
											></div>
											<div className="flex-1">
												<div className="font-semibold text-[#EEEEEE] group-hover:text-[#76ABAE] transition-colors duration-300">
													{industry.name}
												</div>
												<div className="text-sm text-[#EEEEEE]/60">
													{industry.percentage}% market share
												</div>
											</div>
											<div className="text-xl font-bold text-[#76ABAE] group-hover:scale-110 transition-transform duration-300">
												{industry.percentage}%
											</div>
										</motion.div>
									))}
								</div>
							</div>

							{/* Interactive Data Points */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.6 }}
								className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4"
							>
								{[
									{
										name: "IT & Telecom",
										percentage: 25,
										color: "#3b82f6",
										description: "Technology sector leads adoption",
									},
									{
										name: "BFSI",
										percentage: 20,
										color: "#10b981",
										description: "Banking & Financial Services",
									},
									{
										name: "Healthcare",
										percentage: 15,
										color: "#8b5cf6",
										description: "Growing digital transformation",
									},
									{
										name: "Retail",
										percentage: 12,
										color: "#f97316",
										description: "E-commerce driven growth",
									},
									{
										name: "Manufacturing",
										percentage: 10,
										color: "#ef4444",
										description: "Industrial automation focus",
									},
									{
										name: "Other",
										percentage: 18,
										color: "#6b7280",
										description: "Emerging sectors",
									},
								].map((industry, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, scale: 0.9 }}
										whileInView={{ opacity: 1, scale: 1 }}
										whileHover={{ scale: 1.05, y: -5 }}
										transition={{ duration: 0.3 }}
										className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 cursor-pointer group"
									>
										<div className="flex items-center space-x-3 mb-2">
											<div
												className="w-3 h-3 rounded-full group-hover:w-4 group-hover:h-4 transition-all duration-300"
												style={{ backgroundColor: industry.color }}
											></div>
											<div className="font-bold text-[#EEEEEE] text-lg group-hover:text-[#76ABAE] transition-colors duration-300">
												{industry.percentage}%
											</div>
										</div>
										<div className="font-semibold text-[#EEEEEE] text-sm mb-1">
											{industry.name}
										</div>
										<div className="text-xs text-[#EEEEEE]/60">
											{industry.description}
										</div>
									</motion.div>
								))}
							</motion.div>
						</Card>
					</div>
				</section>

				{/* Footer */}
				<footer className="py-8 px-4 border-t border-white/10">
					<div className="container mx-auto text-center">
						<p className="font-bold text-[#EEEEEE] mb-2">
							The Future of Hiring is Intelligent, Efficient, and Equitable.
						</p>
						<p className="text-sm text-[#EEEEEE]/50">
							&copy; {new Date().getFullYear()} TalentSync AI. All rights
							reserved.
						</p>
					</div>
				</footer>
			</div>
		</div>
	);
}
