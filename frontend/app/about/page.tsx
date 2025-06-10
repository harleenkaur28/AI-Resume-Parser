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

const workflowSteps = [
	{ step: "FILE UPLOAD", description: "ZIP, PDF, TXT", type: "process" },
	{
		step: "VALIDATION",
		description: "Check file format and content",
		type: "decision",
	},
	{
		step: "TEXT EXTRACTION",
		description: "Extract content from documents",
		type: "process",
	},
	{
		step: "RESUME VALIDATION",
		description: "Verify if valid resume content",
		type: "decision",
	},
	{
		step: "INFO EXTRACTION",
		description: "Parse skills, experience, education",
		type: "process",
	},
	{
		step: "TEXT CLEANING",
		description: "Normalize and clean extracted data",
		type: "process",
	},
	{
		step: "AI ANALYSIS",
		description: "NLP, ML, GenAI, LangChain processing",
		type: "ai",
	},
	{
		step: "RESULTS",
		description: "Display predictions and store in database",
		type: "output",
	},
];

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
			{/* Hero Section */}
			<section className="relative overflow-hidden px-4 py-20 sm:py-32">
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-[#76ABAE] opacity-20 blur-3xl" />
					<div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-[#76ABAE] opacity-20 blur-3xl" />
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
							just a trend; it's the primary engine of growth in HR Technology.
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
									The market for specialized resume parsing is set to more than
									double by 2029, driven by the critical need to automate and
									streamline the top of the hiring funnel.
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
							transforming raw resumes into actionable intelligence for both job
							seekers and employers.
						</p>
					</motion.div>

					<Card className="backdrop-blur-lg bg-white/5 border border-white/10 p-8">
						<div className="flex flex-col items-center space-y-6">
							{workflowSteps.map((step, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, x: -20 }}
									whileInView={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.8, delay: index * 0.1 }}
									className="flex flex-col items-center"
								>
									<div
										className={`
                    rounded-lg p-4 text-center font-semibold border-2 min-w-[200px]
                    ${
											step.type === "process"
												? "bg-blue-500/20 border-blue-400 text-blue-300"
												: ""
										}
                    ${
											step.type === "decision"
												? "bg-orange-500/20 border-orange-400 text-orange-300 transform rotate-45"
												: ""
										}
                    ${
											step.type === "ai"
												? "bg-purple-500/20 border-purple-400 text-purple-300"
												: ""
										}
                    ${
											step.type === "output"
												? "bg-green-500/20 border-green-400 text-green-300 rounded-full"
												: ""
										}
                  `}
									>
										<div
											className={
												step.type === "decision" ? "transform -rotate-45" : ""
											}
										>
											<div className="font-bold">{step.step}</div>
											<div className="text-xs">{step.description}</div>
										</div>
									</div>
									{index < workflowSteps.length - 1 && (
										<div className="text-[#76ABAE] text-2xl font-bold">↓</div>
									)}
								</motion.div>
							))}
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
							Our robust and scalable architecture is built on modern, efficient
							technologies to deliver high performance and seamless user
							experiences.
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
												<strong className="text-[#EEEEEE]">{tech.name}:</strong>{" "}
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
							Our platform is sector-agnostic, but we see immediate traction in
							industries with high-volume recruitment and a strong reliance on
							technology for talent acquisition.
						</p>
					</motion.div>

					<Card className="backdrop-blur-lg bg-white/5 border border-white/10 p-6">
						<h3 className="text-xl font-bold text-center mb-4 text-[#EEEEEE]">
							HR Software Adoption by Industry Sector
						</h3>
						<p className="text-sm text-center text-[#EEEEEE]/60 mb-8">
							The IT & Telecommunications and BFSI sectors represent nearly half
							of the HR software market, making them prime targets for initial
							market penetration due to their high adoption rates and
							significant recruitment needs.
						</p>

						<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
							{[
								{ name: "IT & Telecom", percentage: 25, color: "bg-blue-500" },
								{
									name: "Banking & Financial Services",
									percentage: 20,
									color: "bg-green-500",
								},
								{ name: "Healthcare", percentage: 15, color: "bg-purple-500" },
								{ name: "Retail", percentage: 12, color: "bg-orange-500" },
								{ name: "Manufacturing", percentage: 10, color: "bg-red-500" },
								{ name: "Other", percentage: 18, color: "bg-gray-500" },
							].map((industry, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, scale: 0.9 }}
									whileInView={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.8, delay: index * 0.1 }}
									className="text-center"
								>
									<div
										className={`w-20 h-20 mx-auto mb-3 rounded-full ${industry.color} flex items-center justify-center`}
									>
										<span className="text-white font-bold text-lg">
											{industry.percentage}%
										</span>
									</div>
									<h4 className="font-semibold text-[#EEEEEE] text-sm">
										{industry.name}
									</h4>
								</motion.div>
							))}
						</div>
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
						&copy; 2025 AI Resume Analyzer Platform. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
