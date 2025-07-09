"use client";

import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	LucideIcon,
	CheckCircle,
	ArrowRight,
	PlusCircle,
	BarChart3,
} from "lucide-react";
import Link from "next/link";

interface FeatureCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
	badgeText: string;
	features: string[];
	buttonText: string;
	buttonIcon: LucideIcon;
	buttonHref: string;
	buttonVariant?: "default" | "outline";
	delay?: number;
	direction?: "left" | "right";
}

export default function FeatureCard({
	icon: Icon,
	title,
	description,
	badgeText,
	features,
	buttonText,
	buttonIcon: ButtonIcon,
	buttonHref,
	buttonVariant = "default",
	delay = 0,
	direction = "left",
}: FeatureCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, x: direction === "left" ? -20 : 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5, delay }}
		>
			<Card className="backdrop-blur-sm bg-gradient-to-br from-[#31363F]/95 to-[#222831]/95 border-slate-600/30 shadow-2xl hover:shadow-3xl transition-all duration-300 card-hover group h-full">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between mb-2">
						<CardTitle className="text-white flex items-center gap-3 text-xl">
							<div className="p-2 bg-[#76ABAE]/30 rounded-lg group-hover:bg-[#76ABAE]/40 transition-colors">
								<Icon className="h-6 w-6 text-[#76ABAE]" />
							</div>
							{title}
						</CardTitle>
						<Badge className="bg-[#76ABAE]/30 text-[#76ABAE] border-[#76ABAE]/40">
							{badgeText}
						</Badge>
					</div>
					<CardDescription className="text-slate-300 text-base">
						{description}
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="mb-6 space-y-2">
						{features.map((feature, index) => (
							<div
								key={index}
								className="flex items-center text-sm text-slate-300"
							>
								<CheckCircle className="h-4 w-4 mr-2 text-green-400" />
								{feature}
							</div>
						))}
					</div>
					<Link href={buttonHref}>
						<Button
							className={`w-full group text-lg py-3 shadow-lg hover:shadow-xl transition-all duration-300 button-hover ${
								buttonVariant === "default"
									? "bg-gradient-to-r from-[#76ABAE] to-[#5A8B8F] hover:from-[#5A8B8F] hover:to-[#76ABAE]"
									: "border-slate-500/30 text-slate-900 hover:bg-slate-500/10 hover:text-white"
							}`}
						>
							<ButtonIcon className="mr-2 h-5 w-5" />
							{buttonText}
							<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
						</Button>
					</Link>
				</CardContent>
			</Card>
		</motion.div>
	);
}
