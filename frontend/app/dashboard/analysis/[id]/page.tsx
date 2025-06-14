"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
	ArrowLeft,
	Download,
	Star,
	Briefcase,
	GraduationCap,
	Code,
	Languages,
	FolderOpen,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface AnalysisData {
	resume: {
		id: string;
		customName: string;
		rawText: string;
		uploadDate: string;
		showInCentral: boolean;
		user: {
			id: string;
			name: string | null;
			email: string | null;
		};
	};
	analysis: {
		id: string;
		name: string | null;
		email: string | null;
		contact: string | null;
		predictedField: string | null;
		skillsAnalysis: Array<{
			skill_name: string;
			percentage: number;
		}>;
		recommendedRoles: string[];
		languages: Array<{
			language: string;
		}>;
		education: Array<{
			education_detail: string;
		}>;
		workExperience: Array<{
			role: string;
			company_and_duration: string;
			bullet_points: string[];
		}>;
		projects: Array<{
			title: string;
			technologies_used: string[];
			description: string;
		}>;
		uploadedAt: string;
	};
}

export default function AnalysisPage() {
	const params = useParams();
	const router = useRouter();
	const { data: session, status } = useSession();
	const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (status === "loading") return;
		if (!session) {
			router.push("/auth/signin");
			return;
		}

		const fetchAnalysis = async () => {
			try {
				const response = await fetch(`/api/resumes/${params.id}`);
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || "Failed to fetch analysis");
				}
				const result = await response.json();
				setAnalysisData(result.data);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to fetch analysis"
				);
			} finally {
				setLoading(false);
			}
		};

		if (params.id) {
			fetchAnalysis();
		}
	}, [params.id, session, status, router]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin text-[#76ABAE] mx-auto mb-4" />
					<p className="text-[#EEEEEE]">Loading analysis...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-400 mb-4">{error}</p>
					<Button
						onClick={() => router.back()}
						className="bg-[#76ABAE] hover:bg-[#76ABAE]/90"
					>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	if (!analysisData) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] flex items-center justify-center">
				<div className="text-center">
					<p className="text-[#EEEEEE] mb-4">No analysis data found</p>
					<Button
						onClick={() => router.back()}
						className="bg-[#76ABAE] hover:bg-[#76ABAE]/90"
					>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	const { resume, analysis } = analysisData;
	return (
		<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
					className="sticky top-4 z-10 mb-8"
				>
					<div className="backdrop-blur-sm bg-[#222831]/80 rounded-lg p-4 flex justify-between items-center">
						<Button
							onClick={() => router.back()}
							variant="ghost"
							className="text-[#EEEEEE] hover:text-[#76ABAE]"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
						<Button
							onClick={() => {
								window.open(`/api/resumes/${params.id}/download`, "_blank");
							}}
							className="bg-[#76ABAE] hover:bg-[#76ABAE]/90"
						>
							<Download className="mr-2 h-4 w-4" />
							Download Resume
						</Button>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="space-y-8"
				>
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold text-[#EEEEEE] mb-2">
							Resume Analysis
						</h1>
						<p className="text-[#EEEEEE]/60">
							{analysis.name || "Candidate"} - {resume.customName}
						</p>
					</div>

					<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
						{/* Main Content */}
						<div className="xl:col-span-2 space-y-8">
							{/* Skills Analysis */}
							<Card className="backdrop-blur-lg bg-white/5 border-white/10">
								<CardHeader>
									<CardTitle className="text-[#EEEEEE] flex items-center">
										<Star className="mr-2 h-5 w-5 text-[#76ABAE]" />
										Skills Analysis
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{analysis.skillsAnalysis &&
									analysis.skillsAnalysis.length > 0 ? (
										analysis.skillsAnalysis.map((skill, index) => (
											<div key={index}>
												<div className="flex justify-between mb-1">
													<span className="text-[#EEEEEE]">
														{skill.skill_name}
													</span>
													<span className="text-[#76ABAE]">
														{skill.percentage}%
													</span>
												</div>
												<Progress value={skill.percentage} className="h-2" />
											</div>
										))
									) : (
										<p className="text-[#EEEEEE]/60">
											No skills analysis available
										</p>
									)}
								</CardContent>
							</Card>

							{/* Work Experience */}
							<Card className="backdrop-blur-lg bg-white/5 border-white/10">
								<CardHeader>
									<CardTitle className="text-[#EEEEEE] flex items-center">
										<Briefcase className="mr-2 h-5 w-5 text-[#76ABAE]" />
										Work Experience
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									{analysis.workExperience &&
									analysis.workExperience.length > 0 ? (
										analysis.workExperience.map((work, index) => (
											<div
												key={index}
												className="border-l-2 border-[#76ABAE] pl-4"
											>
												<h3 className="text-[#EEEEEE] font-semibold">
													{work.role}
												</h3>
												<p className="text-[#76ABAE] text-sm">
													{work.company_and_duration}
												</p>
												{work.bullet_points &&
													work.bullet_points.length > 0 && (
														<ul className="mt-2 space-y-1">
															{work.bullet_points.map((point, i) => (
																<li
																	key={i}
																	className="text-[#EEEEEE]/60 text-sm"
																>
																	• {point}
																</li>
															))}
														</ul>
													)}
											</div>
										))
									) : (
										<p className="text-[#EEEEEE]/60">
											No work experience data available
										</p>
									)}
								</CardContent>
							</Card>

							{/* Projects Section */}
							<Card className="backdrop-blur-lg bg-white/5 border-white/10">
								<CardHeader>
									<CardTitle className="text-[#EEEEEE] flex items-center">
										<FolderOpen className="mr-2 h-5 w-5 text-[#76ABAE]" />
										Projects
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									{analysis.projects && analysis.projects.length > 0 ? (
										analysis.projects.map((project, index) => (
											<div
												key={index}
												className="border-l-2 border-[#76ABAE] pl-4"
											>
												<h3 className="text-[#EEEEEE] font-semibold mb-2">
													{project.title}
												</h3>
												{project.technologies_used &&
													project.technologies_used.length > 0 && (
														<div className="mb-3">
															<div className="flex flex-wrap gap-1">
																{project.technologies_used.map((tech, i) => (
																	<Badge
																		key={i}
																		className="bg-[#76ABAE]/10 text-[#76ABAE] border border-[#76ABAE]/30 text-xs"
																	>
																		{tech}
																	</Badge>
																))}
															</div>
														</div>
													)}
												<p className="text-[#EEEEEE]/60 text-sm leading-relaxed">
													{project.description}
												</p>
											</div>
										))
									) : (
										<p className="text-[#EEEEEE]/60">
											No projects data available
										</p>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Sidebar */}
						<div className="space-y-8">
							{/* Candidate Info */}
							<Card className="backdrop-blur-lg bg-white/5 border-white/10">
								<CardHeader>
									<CardTitle className="text-[#EEEEEE] flex items-center">
										<Code className="mr-2 h-5 w-5 text-[#76ABAE]" />
										Candidate Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									{analysis.name && (
										<div>
											<span className="text-[#76ABAE] text-sm">Name:</span>
											<p className="text-[#EEEEEE]">{analysis.name}</p>
										</div>
									)}
									{analysis.email && (
										<div>
											<span className="text-[#76ABAE] text-sm">Email:</span>
											<p className="text-[#EEEEEE]">{analysis.email}</p>
										</div>
									)}
									{analysis.contact && (
										<div>
											<span className="text-[#76ABAE] text-sm">Contact:</span>
											<p className="text-[#EEEEEE]">{analysis.contact}</p>
										</div>
									)}
									{analysis.predictedField && (
										<div>
											<span className="text-[#76ABAE] text-sm">
												Predicted Field:
											</span>
											<p className="text-[#EEEEEE]">
												{analysis.predictedField}
											</p>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Recommended Roles */}
							<Card className="backdrop-blur-lg bg-white/5 border-white/10">
								<CardHeader>
									<CardTitle className="text-[#EEEEEE] flex items-center">
										<Code className="mr-2 h-5 w-5 text-[#76ABAE]" />
										Recommended Roles
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{analysis.recommendedRoles &&
										analysis.recommendedRoles.length > 0 ? (
											analysis.recommendedRoles.map((role, index) => (
												<Badge
													key={index}
													className="mr-2 mb-2 bg-[#76ABAE]/20 text-[#76ABAE] hover:bg-[#76ABAE]/30 block w-fit"
												>
													{role}
												</Badge>
											))
										) : (
											<p className="text-[#EEEEEE]/60">
												No role recommendations available
											</p>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Languages */}
							<Card className="backdrop-blur-lg bg-white/5 border-white/10">
								<CardHeader>
									<CardTitle className="text-[#EEEEEE] flex items-center">
										<Languages className="mr-2 h-5 w-5 text-[#76ABAE]" />
										Languages
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{analysis.languages && analysis.languages.length > 0 ? (
											analysis.languages.map((lang, index) => (
												<div key={index} className="text-[#EEEEEE]/80">
													{lang.language}
												</div>
											))
										) : (
											<p className="text-[#EEEEEE]/60">
												No language information available
											</p>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Education */}
							<Card className="backdrop-blur-lg bg-white/5 border-white/10">
								<CardHeader>
									<CardTitle className="text-[#EEEEEE] flex items-center">
										<GraduationCap className="mr-2 h-5 w-5 text-[#76ABAE]" />
										Education
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										{analysis.education && analysis.education.length > 0 ? (
											analysis.education.map((edu, index) => (
												<p key={index} className="text-[#EEEEEE]/80">
													{edu.education_detail}
												</p>
											))
										) : (
											<p className="text-[#EEEEEE]/60">
												No education information available
											</p>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
