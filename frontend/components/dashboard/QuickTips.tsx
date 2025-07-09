"use client";

import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Zap, Target, Calendar, MessageSquare } from "lucide-react";

interface QuickTip {
	icon: any;
	title: string;
	description: string;
	bgColor: string;
	borderColor: string;
	iconColor: string;
}

export default function QuickTips() {
	const tips: QuickTip[] = [
		{
			icon: Target,
			title: "Optimize Keywords",
			description:
				"Add industry-specific keywords to improve ATS compatibility",
			bgColor: "from-[#76ABAE]/20 to-[#76ABAE]/10",
			borderColor: "border-[#76ABAE]/30",
			iconColor: "text-[#76ABAE]",
		},
		{
			icon: Calendar,
			title: "Update Profile",
			description: "Keep your profile fresh with recent achievements",
			bgColor: "from-slate-500/20 to-slate-500/10",
			borderColor: "border-slate-500/30",
			iconColor: "text-slate-300",
		},
		{
			icon: MessageSquare,
			title: "Network Smart",
			description: "Use AI-generated cold emails to expand your network",
			bgColor: "from-[#76ABAE]/20 to-[#76ABAE]/10",
			borderColor: "border-[#76ABAE]/30",
			iconColor: "text-[#76ABAE]",
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.7 }}
			className="mb-12"
		>
			<Card className="backdrop-blur-sm bg-gradient-to-br from-[#31363F]/95 to-[#222831]/95 border-slate-600/30 shadow-2xl">
				<CardHeader>
					<CardTitle className="text-white flex items-center gap-2">
						<Zap className="h-5 w-5 text-[#76ABAE]" />
						Quick Tips for Today
					</CardTitle>
					<CardDescription className="text-slate-300">
						Personalized recommendations to boost your career
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{tips.map((tip, index) => (
							<div
								key={index}
								className={`p-4 rounded-lg bg-gradient-to-br ${tip.bgColor} border ${tip.borderColor}`}
							>
								<div className="flex items-center mb-2">
									<tip.icon className={`h-4 w-4 ${tip.iconColor} mr-2`} />
									<span className="text-sm font-medium text-white">
										{tip.title}
									</span>
								</div>
								<p className="text-xs text-slate-300">{tip.description}</p>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
