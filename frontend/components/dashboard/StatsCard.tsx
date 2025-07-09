"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LucideIcon, Eye, Target } from "lucide-react";

interface StatsCardProps {
	icon: LucideIcon;
	title: string;
	value: number | string;
	progressValue: number;
	badgeText: string;
	badgeIcon: LucideIcon;
	iconColor: string;
	badgeColor: string;
	onClick?: () => void;
	delay?: number;
}

export default function StatsCard({
	icon: Icon,
	title,
	value,
	progressValue,
	badgeText,
	badgeIcon: BadgeIcon,
	iconColor,
	badgeColor,
	onClick,
	delay = 0,
}: StatsCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
		>
			<Card
				className="backdrop-blur-sm bg-gradient-to-br from-[#31363F]/90 to-[#222831]/90 border-slate-600/30 shadow-2xl hover:shadow-3xl transition-all duration-300 card-hover group cursor-pointer"
				onClick={onClick}
			>
				<CardContent className="p-6">
					<div className="flex items-center justify-between mb-4">
						<div
							className={`p-3 ${iconColor} rounded-xl group-hover:opacity-80 transition-colors`}
						>
							<Icon className="h-6 w-6" />
						</div>
						<Badge variant="secondary" className={badgeColor}>
							<BadgeIcon className="w-3 h-3 mr-1" />
							{badgeText}
						</Badge>
					</div>
					<div>
						<p className="text-slate-300 text-sm font-medium mb-1">{title}</p>
						<p className="text-3xl font-bold text-white mb-2">{value}</p>
						<Progress value={progressValue} className="h-2 bg-slate-600/50" />
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
