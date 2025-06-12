"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LoaderOverlay } from "@/components/ui/loader";
import {
	ArrowLeft,
	Star,
	Briefcase,
	GraduationCap,
	Code,
	Languages,
	User,
	Mail,
	Phone,
	FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SkillProficiency {
	skill_name: string;
	percentage: number;
}

interface WorkExperience {
	role: string;
	company_and_duration: string;
	bullet_points: string[];
}

interface ProjectEntry {
	title: string;
	technologies_used: string[];
	description: string;
}

interface LanguageEntry {
	language: string;
}

interface EducationEntry {
	education_detail: string;
}

interface AnalysisData {
	name?: string;
	email?: string;
	contact?: string;
	predicted_field?: string;
	skills_analysis: SkillProficiency[];
	recommended_roles: string[];
	languages: LanguageEntry[];
	education: EducationEntry[];
	work_experience: WorkExperience[];
	projects: ProjectEntry[];
}

export default function DetailedAnalysisPage() {
	const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const loadAnalysisData = async () => {
			// Add artificial delay for better UX
			await new Promise((resolve) => setTimeout(resolve, 1500));

			const storedData = localStorage.getItem("analysisData");
			if (storedData) {
				try {
					const data = JSON.parse(storedData);
					setAnalysisData(data);
				} catch (error) {
					console.error("Error parsing stored analysis data:", error);
					router.push("/dashboard/seeker");
				}
			} else {
				router.push("/dashboard/seeker");
			}
			setLoading(false);
		};

		loadAnalysisData();
	}, [router]);

	// Helper function to check if personal info section should be rendered
	const shouldRenderPersonalInfo = () => {
		if (!analysisData) return false;
		return analysisData.name || analysisData.email || analysisData.contact;
	};

	// Helper function to check if skills analysis should be rendered
	const shouldRenderSkillsAnalysis = () => {
		return (
			analysisData?.skills_analysis && analysisData.skills_analysis.length > 0
		);
	};

	// Helper function to check if work experience should be rendered
	const shouldRenderWorkExperience = () => {
		return (
			analysisData?.work_experience &&
			analysisData.work_experience.length > 0 &&
			analysisData.work_experience.some(
				(exp) => exp.role || exp.company_and_duration
			)
		);
	};

	// Helper function to check if projects should be rendered
	const shouldRenderProjects = () => {
		return (
			analysisData?.projects &&
			analysisData.projects.length > 0 &&
			analysisData.projects.some((proj) => proj.title && proj.description)
		);
	};

	// Helper function to check if recommended roles should be rendered
	const shouldRenderRecommendedRoles = () => {
		return (
			analysisData?.recommended_roles &&
			analysisData.recommended_roles.length > 0
		);
	};

	// Helper function to check if languages should be rendered
	const shouldRenderLanguages = () => {
		return (
			analysisData?.languages &&
			analysisData.languages.length > 0 &&
			analysisData.languages.some(
				(lang) => lang.language && lang.language.trim() !== ""
			)
		);
	};

	// Helper function to check if education should be rendered
	const shouldRenderEducation = () => {
		return (
			analysisData?.education &&
			analysisData.education.length > 0 &&
			analysisData.education.some(
				(edu) => edu.education_detail && edu.education_detail.trim() !== ""
			)
		);
	};

	return (
		<>
			<AnimatePresence>
				{loading && (
					<LoaderOverlay
						text="Preparing your detailed analysis..."
						variant="default"
						size="xl"
					/>
				)}
			</AnimatePresence>

			{!loading && (
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
					<div className="container mx-auto px-4 py-8 max-w-7xl">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
							className="sticky top-4 z-10 mb-8"
						>
							<div className="backdrop-blur-sm bg-[#222831]/80 rounded-lg p-4">
								<Link href="/dashboard/seeker">
									<Button
										variant="ghost"
										className="text-[#EEEEEE] hover:text-[#76ABAE]"
									>
										<ArrowLeft className="mr-2 h-4 w-4" />
										Back to Dashboard
									</Button>
								</Link>
							</div>
						</motion.div>

						{!analysisData ? (
							<div className="min-h-[60vh] flex items-center justify-center">
								<div className="text-center">
									<div className="text-[#EEEEEE] text-xl mb-4">
										No analysis data found
									</div>
									<Link href="/dashboard/seeker">
										<Button className="bg-[#76ABAE] hover:bg-[#76ABAE]/90">
											Back to Upload
										</Button>
									</Link>
								</div>
							</div>
						) : (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.2 }}
								className="space-y-8"
							>
								<div className="text-center mb-8">
									<h1 className="text-4xl font-bold text-[#EEEEEE] mb-2">
										Detailed Resume Analysis
									</h1>
									<p className="text-[#EEEEEE]/60">
										Comprehensive insights into your professional profile
									</p>
								</div>

								<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
									{/* Main Content - Left/Center Column */}
									<div className="xl:col-span-2 space-y-8">
										{/* Personal Info */}
										{shouldRenderPersonalInfo() && (
											<Card className="backdrop-blur-lg bg-white/5 border-white/10">
												<CardHeader>
													<CardTitle className="text-[#EEEEEE] flex items-center">
														<User className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Personal Information
													</CardTitle>
												</CardHeader>
												<CardContent className="space-y-4">
													{analysisData.name && (
														<div className="flex items-center space-x-3">
															<User className="h-4 w-4 text-[#76ABAE]" />
															<span className="text-[#EEEEEE]">
																{analysisData.name}
															</span>
														</div>
													)}
													{analysisData.email && (
														<div className="flex items-center space-x-3">
															<Mail className="h-4 w-4 text-[#76ABAE]" />
															<span className="text-[#EEEEEE]">
																{analysisData.email}
															</span>
														</div>
													)}
													{analysisData.contact && (
														<div className="flex items-center space-x-3">
															<Phone className="h-4 w-4 text-[#76ABAE]" />
															<span className="text-[#EEEEEE]">
																{analysisData.contact}
															</span>
														</div>
													)}
												</CardContent>
											</Card>
										)}

										{/* Skills Analysis */}
										{shouldRenderSkillsAnalysis() && (
											<Card className="backdrop-blur-lg bg-white/5 border-white/10">
												<CardHeader>
													<CardTitle className="text-[#EEEEEE] flex items-center">
														<Star className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Skills Analysis
													</CardTitle>
												</CardHeader>
												<CardContent className="space-y-4">
													{analysisData.skills_analysis.map((skill, index) => (
														<div key={index}>
															<div className="flex justify-between mb-1">
																<span className="text-[#EEEEEE]">
																	{skill.skill_name}
																</span>
																<span className="text-[#76ABAE]">
																	{skill.percentage}%
																</span>
															</div>
															<Progress
																value={skill.percentage}
																className="h-2"
															/>
														</div>
													))}
												</CardContent>
											</Card>
										)}

										{/* Work Experience */}
										{shouldRenderWorkExperience() && (
											<Card className="backdrop-blur-lg bg-white/5 border-white/10">
												<CardHeader>
													<CardTitle className="text-[#EEEEEE] flex items-center">
														<Briefcase className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Work Experience
													</CardTitle>
												</CardHeader>
												<CardContent className="space-y-6">
													{analysisData.work_experience
														.filter(
															(work) => work.role || work.company_and_duration
														)
														.map((work, index) => (
															<div
																key={index}
																className="border-l-2 border-[#76ABAE] pl-4"
															>
																{work.role && (
																	<h3 className="text-[#EEEEEE] font-semibold">
																		{work.role}
																	</h3>
																)}
																{work.company_and_duration && (
																	<p className="text-[#76ABAE] text-sm">
																		{work.company_and_duration}
																	</p>
																)}
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
														))}
												</CardContent>
											</Card>
										)}

										{/* Projects Section */}
										{shouldRenderProjects() && (
											<Card className="backdrop-blur-lg bg-white/5 border-white/10">
												<CardHeader>
													<CardTitle className="text-[#EEEEEE] flex items-center">
														<FolderOpen className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Projects
													</CardTitle>
												</CardHeader>
												<CardContent className="space-y-6">
													{analysisData.projects
														.filter(
															(project) => project.title && project.description
														)
														.map((project, index) => (
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
																				{project.technologies_used.map(
																					(tech, i) => (
																						<Badge
																							key={i}
																							className="bg-[#76ABAE]/10 text-[#76ABAE] border border-[#76ABAE]/30 text-xs"
																						>
																							{tech}
																						</Badge>
																					)
																				)}
																			</div>
																		</div>
																	)}
																<p className="text-[#EEEEEE]/60 text-sm leading-relaxed">
																	{project.description}
																</p>
															</div>
														))}
												</CardContent>
											</Card>
										)}
									</div>

									{/* Sidebar - Right Column */}
									<div className="space-y-8">
										{/* Recommended Roles */}
										{shouldRenderRecommendedRoles() && (
											<Card className="backdrop-blur-lg bg-white/5 border-white/10">
												<CardHeader>
													<CardTitle className="text-[#EEEEEE] flex items-center">
														<Code className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Recommended Roles
													</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="space-y-2">
														{analysisData.recommended_roles.map(
															(role, index) => (
																<Badge
																	key={index}
																	className="mr-2 mb-2 bg-[#76ABAE]/20 text-[#76ABAE] hover:bg-[#76ABAE]/30 block w-fit"
																>
																	{role}
																</Badge>
															)
														)}
													</div>
												</CardContent>
											</Card>
										)}

										{/* Languages */}
										{shouldRenderLanguages() && (
											<Card className="backdrop-blur-lg bg-white/5 border-white/10">
												<CardHeader>
													<CardTitle className="text-[#EEEEEE] flex items-center">
														<Languages className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Languages
													</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="space-y-2">
														{analysisData.languages
															.filter(
																(lang) =>
																	lang.language && lang.language.trim() !== ""
															)
															.map((lang, index) => (
																<div key={index} className="text-[#EEEEEE]/80">
																	{lang.language}
																</div>
															))}
													</div>
												</CardContent>
											</Card>
										)}

										{/* Education */}
										{shouldRenderEducation() && (
											<Card className="backdrop-blur-lg bg-white/5 border-white/10">
												<CardHeader>
													<CardTitle className="text-[#EEEEEE] flex items-center">
														<GraduationCap className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Education
													</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="space-y-2">
														{analysisData.education
															.filter(
																(edu) =>
																	edu.education_detail &&
																	edu.education_detail.trim() !== ""
															)
															.map((edu, index) => (
																<p key={index} className="text-[#EEEEEE]/80">
																	{edu.education_detail}
																</p>
															))}
													</div>
												</CardContent>
											</Card>
										)}

										{/* Predicted Field */}
										{analysisData.predicted_field && (
											<Card className="backdrop-blur-lg bg-white/5 border-white/10">
												<CardHeader>
													<CardTitle className="text-[#EEEEEE] flex items-center">
														<Star className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Predicted Field
													</CardTitle>
												</CardHeader>
												<CardContent>
													<Badge className="bg-[#76ABAE]/20 text-[#76ABAE] hover:bg-[#76ABAE]/30">
														{analysisData.predicted_field}
													</Badge>
												</CardContent>
											</Card>
										)}
									</div>
								</div>

								{/* Action Buttons at Bottom */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.8 }}
									className="flex justify-center pt-8"
								>
									<Link href="/dashboard/seeker">
										<Button className="bg-[#76ABAE] hover:bg-[#76ABAE]/90 px-8 py-3">
											Upload Another Resume
										</Button>
									</Link>
								</motion.div>
							</motion.div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
