"use client";

import { motion } from "framer-motion";
import { FileSearch, Brain, Zap, Users } from "lucide-react";

const features = [
	{
		icon: FileSearch,
		title: "Smart Resume Parsing",
		description: "Upload your resume in any format and get instant insights",
	},
	{
		icon: Brain,
		title: "AI-Powered Matching",
		description: "Get matched with roles that fit your skills and experience",
	},
	{
		icon: Zap,
		title: "Instant Analysis",
		description: "Detailed breakdown of your skills and experience",
	},
	{
		icon: Users,
		title: "Recruiter Tools",
		description: "Powerful tools for HR to find the perfect candidates",
	},
];

export function Features() {
	return (
		<section className="py-20 relative">
			<div className="container mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
				>
					{features.map((feature, index) => (
						<div
							key={index}
							className="relative backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-white/10 hover:border-[#76ABAE]/50 transition-all duration-300"
						>
							<feature.icon className="h-6 w-6 mr-2 text-[#76ABAE] mb-2 inline" />
							<h3 className="text-[#EEEEEE] text-xl font-semibold mb-2 inline-block">
								{feature.title}
							</h3>
							<p className="text-[#EEEEEE]/60">{feature.description}</p>
						</div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
