"use client";

import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import {
	BarChart3,
	FileText,
	Mail,
	Users,
	Star,
	MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface Activity {
	id: string;
	type: "resume" | "cold_mail" | "interview";
	title: string;
	description: string;
	date: string;
}

interface ActivityCenterProps {
	activities: Activity[];
	isLoading: boolean;
}

export default function ActivityCenter({
	activities,
	isLoading,
}: ActivityCenterProps) {
	// Get activity icon
	const getActivityIcon = (type: string) => {
		switch (type) {
			case "resume":
				return <FileText className="h-4 w-4 text-[#76ABAE]" />;
			case "cold_mail":
				return <Mail className="h-4 w-4 text-blue-400" />;
			case "interview":
				return <Users className="h-4 w-4 text-green-400" />;
			default:
				return <Star className="h-4 w-4 text-gray-400" />;
		}
	};

	return (
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
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader variant="spinner" size="lg" className="text-[#76ABAE]" />
						</div>
					) : activities && activities.length > 0 ? (
						<div className="space-y-4">
							{activities.map((activity, index) => (
								<motion.div
									key={activity.id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.3, delay: index * 0.1 }}
									className="flex items-center space-x-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
								>
									<div className="flex-shrink-0">
										{getActivityIcon(activity.type)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-white font-medium text-sm">
											{activity.title}
										</p>
										<p className="text-slate-400 text-xs truncate">
											{activity.description}
										</p>
									</div>
									<div className="flex-shrink-0">
										<p className="text-slate-500 text-xs">
											{new Date(activity.date).toLocaleDateString()}
										</p>
									</div>
								</motion.div>
							))}
						</div>
					) : (
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
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}
