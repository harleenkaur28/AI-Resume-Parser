"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, PlusCircle, Eye, Calendar } from "lucide-react";
import Link from "next/link";

interface Resume {
	id: string;
	customName: string;
	uploadDate: string;
	predictedField?: string;
	candidateName?: string;
}

interface ResumesSectionProps {
	resumes: Resume[];
	onViewAll: () => void;
}

export default function ResumesSection({
	resumes,
	onViewAll,
}: ResumesSectionProps) {
	if (!resumes || resumes.length === 0) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.4 }}
			className="mb-12"
		>
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold text-white flex items-center gap-3">
					<FileText className="h-6 w-6 text-[#76ABAE]" />
					Your Resumes
				</h2>
				<Link href="/dashboard/seeker">
					<Button
						variant="outline"
						className="border-[#76ABAE]/30 text-[#76ABAE] hover:text-slate-300 hover:bg-[#76ABAE]/10"
					>
						<PlusCircle className="h-4 w-4 mr-2" />
						Upload New
					</Button>
				</Link>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{resumes.slice(0, 6).map((resume) => (
					<Card
						key={resume.id}
						className="backdrop-blur-sm bg-gradient-to-br from-[#31363F]/95 to-[#222831]/95 border-slate-600/30 shadow-lg hover:shadow-xl transition-all duration-300 group"
					>
						<CardHeader className="pb-3">
							<CardTitle className="text-white flex items-center justify-between">
								<div className="flex items-center">
									<FileText className="mr-2 h-5 w-5 text-[#76ABAE]" />
									<span className="truncate text-sm">{resume.customName}</span>
								</div>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="space-y-2">
								<div className="flex items-center text-xs text-slate-400">
									<Calendar className="mr-2 h-3 w-3" />
									{new Date(resume.uploadDate).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</div>
								{resume.predictedField && (
									<div className="text-xs">
										<Badge className="bg-[#76ABAE]/20 text-[#76ABAE] text-xs">
											{resume.predictedField}
										</Badge>
									</div>
								)}
								{resume.candidateName && (
									<div className="text-xs text-slate-300">
										{resume.candidateName}
									</div>
								)}
							</div>

							<Link href={`/dashboard/analysis/${resume.id}`} className="block">
								<Button
									size="sm"
									className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/80 text-white text-xs"
								>
									<Eye className="mr-2 h-3 w-3" />
									View Analysis
								</Button>
							</Link>
						</CardContent>
					</Card>
				))}
			</div>

			{resumes.length > 6 && (
				<div className="text-center mt-6">
					<Button
						onClick={onViewAll}
						variant="outline"
						className="border-[#76ABAE]/30 text-[#76ABAE] hover:bg-[#76ABAE]/10"
					>
						View All Resumes ({resumes.length})
					</Button>
				</div>
			)}
		</motion.div>
	);
}
