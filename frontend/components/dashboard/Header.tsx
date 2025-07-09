"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface HeaderProps {
	currentTime: string;
	userName: string;
}

export default function Header({ currentTime, userName }: HeaderProps) {
	// Get greeting based on time
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 17) return "Good afternoon";
		return "Good evening";
	};

	return (
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
				{getGreeting()}, {userName}!
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
	);
}
