"use client";

import { motion } from "framer-motion";
import { FileSearch, Brain, Zap, Users } from "lucide-react";
import { useEffect, useState } from "react";

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

function Features() {
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
							className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group"
						>
							<div className="mb-4">
								<div className="w-12 h-12 rounded-lg bg-[#76ABAE]/20 flex items-center justify-center mb-4 group-hover:bg-[#76ABAE]/30 transition-colors">
									<feature.icon className="h-6 w-6 text-[#76ABAE]" />
								</div>
								<h3 className="text-lg font-semibold text-[#EEEEEE] mb-2">
									{feature.title}
								</h3>
								<p className="text-[#EEEEEE]/60 text-sm leading-relaxed">
									{feature.description}
								</p>
							</div>
						</div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

function MobileFeatures() {
	const [isMobile, setIsMobile] = useState(false);
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 640);
		};
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);
	return isMobile ? <Features /> : <div className="hidden md:block"></div>;
}

export { Features, MobileFeatures };
