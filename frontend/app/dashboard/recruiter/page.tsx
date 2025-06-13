"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	Search,
	Eye,
	Download,
	User,
	Calendar,
	Briefcase,
	Mail,
	Phone,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { KnowButton } from "@/components/know-more-button";
import { Loader } from "@/components/ui/loader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	X,
	Star,
	GraduationCap,
	Code,
	Languages,
	FolderOpen,
} from "lucide-react";

interface SkillAnalysis {
	skill_name: string;
	percentage: number;
}

interface WorkExperience {
	role: string;
	company_and_duration: string;
	bullet_points: string[];
}

interface Project {
	title: string;
	technologies_used: string[];
	description: string;
}

interface Analysis {
	id: string;
	name: string;
	email: string;
	contact?: string;
	predictedField: string;
	skillsAnalysis: SkillAnalysis[];
	recommendedRoles: string[];
	languages: any[];
	education: any[];
	workExperience: WorkExperience[];
	projects: Project[];
	uploadedAt: string;
}

interface Resume {
	id: string;
	customName: string;
	uploadDate: string;
	showInCentral: boolean;
	rawText: string;
	user: {
		id: string;
		name: string;
		email: string;
		role: string;
	};
	analysis: Analysis | null;
}

interface ApiResponse {
	success: boolean;
	message: string;
	data: {
		resumes: Resume[];
		total: number;
	};
}

export default function RecruiterDashboard() {
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [resumes, setResumes] = useState<Resume[]>([]);
	const [filteredResumes, setFilteredResumes] = useState<Resume[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

	// Fetch resumes from API
	const fetchResumes = async (search?: string) => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams();
			if (search) params.append("search", search);
			params.append("centralOnly", "true"); // Only show resumes marked for central repository

			const response = await fetch(
				`/api/recruter/show-all?${params.toString()}`
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data: ApiResponse = await response.json();

			if (data.success) {
				setResumes(data.data.resumes);
				setFilteredResumes(data.data.resumes);
			} else {
				throw new Error(data.message || "Failed to fetch resumes");
			}
		} catch (err) {
			console.error("Error fetching resumes:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch resumes");
		} finally {
			setIsLoading(false);
		}
	};

	// Handle search
	const handleSearch = (query: string) => {
		setSearchQuery(query);
		if (query.trim()) {
			fetchResumes(query);
		} else {
			fetchResumes();
		}
	};

	// Simulate page load and fetch data
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsPageLoading(false);
			fetchResumes();
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	return (
		<>
			<AnimatePresence>
				{isPageLoading && (
					<motion.div
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] flex items-center justify-center z-50"
					>
						<Loader
							variant="pulse"
							size="xl"
							text="Loading recruiter dashboard..."
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{!isPageLoading && (
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
					<div className="container mx-auto px-4 py-8">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
						>
							<Link href="/">
								<Button
									variant="ghost"
									className="text-[#EEEEEE] hover:text-[#76ABAE]"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Home
								</Button>
							</Link>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="max-w-6xl mx-auto mt-12"
						>
							<h1 className="text-4xl font-bold text-[#EEEEEE] mb-8">
								Candidate Database
							</h1>

							<div className="relative mb-8">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#76ABAE]" />
								<Input
									placeholder="Search candidates by skills, experience, or role..."
									value={searchQuery}
									onChange={(e) => handleSearch(e.target.value)}
									className="pl-10 bg-white/5 border-white/10 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
								/>
							</div>

							{/* Loading State */}
							{isLoading && (
								<div className="backdrop-blur-lg bg-white/5 rounded-xl p-8 border border-white/10">
									<div className="flex items-center justify-center">
										<Loader
											variant="spinner"
											size="lg"
											className="text-[#76ABAE]"
										/>
										<span className="ml-3 text-[#EEEEEE]/80">
											Loading candidates...
										</span>
									</div>
								</div>
							)}

							{/* Error State */}
							{error && (
								<div className="backdrop-blur-lg bg-red-500/10 rounded-xl p-8 border border-red-500/30">
									<p className="text-red-400 text-center">{error}</p>
									<Button
										onClick={() => fetchResumes()}
										className="mt-4 mx-auto block bg-red-500/20 hover:bg-red-500/30 text-red-400"
									>
										Try Again
									</Button>
								</div>
							)}

							{/* Resumes Grid */}
							{!isLoading && !error && (
								<>
									{filteredResumes.length > 0 ? (
										<div className="space-y-6">
											<div className="flex justify-between items-center">
												<p className="text-[#EEEEEE]/80">
													Found {filteredResumes.length} candidate
													{filteredResumes.length !== 1 ? "s" : ""}
												</p>
											</div>

											<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
												{filteredResumes.map((resume) => (
													<Card
														key={resume.id}
														className="backdrop-blur-lg bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
													>
														<CardContent className="p-6">
															{/* Header */}
															<div className="flex justify-between items-start mb-4">
																<div>
																	<h3 className="text-lg font-semibold text-[#EEEEEE] mb-1">
																		{resume.analysis?.name || resume.customName}
																	</h3>
																	<p className="text-[#EEEEEE]/60 text-sm">
																		Uploaded:{" "}
																		{new Date(
																			resume.uploadDate
																		).toLocaleDateString()}
																	</p>
																</div>
																<Button
																	onClick={() => setSelectedResume(resume)}
																	size="sm"
																	className="bg-[#76ABAE]/20 hover:bg-[#76ABAE]/30 text-[#76ABAE]"
																>
																	<Eye className="w-4 h-4 mr-1" />
																	View
																</Button>
															</div>

															{/* Basic Info */}
															{resume.analysis && (
																<div className="space-y-3">
																	<div className="flex items-center space-x-4">
																		{resume.analysis.email && (
																			<div className="flex items-center text-[#EEEEEE]/80 text-sm">
																				<Mail className="w-4 h-4 mr-1 text-[#76ABAE]" />
																				{resume.analysis.email}
																			</div>
																		)}
																		{resume.analysis.contact && (
																			<div className="flex items-center text-[#EEEEEE]/80 text-sm">
																				<Phone className="w-4 h-4 mr-1 text-[#76ABAE]" />
																				{resume.analysis.contact}
																			</div>
																		)}
																	</div>

																	{resume.analysis.predictedField && (
																		<div className="flex items-center">
																			<Briefcase className="w-4 h-4 mr-2 text-[#76ABAE]" />
																			<Badge className="bg-[#76ABAE]/20 text-[#76ABAE]">
																				{resume.analysis.predictedField}
																			</Badge>
																		</div>
																	)}

																	{/* Skills Preview */}
																	{resume.analysis.skillsAnalysis &&
																		resume.analysis.skillsAnalysis.length >
																			0 && (
																			<div>
																				<p className="text-[#EEEEEE]/60 text-sm mb-2">
																					Top Skills:
																				</p>
																				<div className="flex flex-wrap gap-1">
																					{resume.analysis.skillsAnalysis
																						.slice(0, 4)
																						.map((skill, index) => (
																							<Badge
																								key={index}
																								className="bg-[#76ABAE]/10 text-[#76ABAE] border border-[#76ABAE]/30 text-xs"
																							>
																								{skill.skill_name} (
																								{skill.percentage}%)
																							</Badge>
																						))}
																					{resume.analysis.skillsAnalysis
																						.length > 4 && (
																						<Badge className="bg-white/10 text-[#EEEEEE]/60 text-xs">
																							+
																							{resume.analysis.skillsAnalysis
																								.length - 4}{" "}
																							more
																						</Badge>
																					)}
																				</div>
																			</div>
																		)}

																	{/* Recommended Roles */}
																	{resume.analysis.recommendedRoles &&
																		resume.analysis.recommendedRoles.length >
																			0 && (
																			<div>
																				<p className="text-[#EEEEEE]/60 text-sm mb-2">
																					Recommended Roles:
																				</p>
																				<div className="flex flex-wrap gap-1">
																					{resume.analysis.recommendedRoles
																						.slice(0, 3)
																						.map((role, index) => (
																							<Badge
																								key={index}
																								className="bg-blue-500/20 text-blue-300 text-xs"
																							>
																								{role}
																							</Badge>
																						))}
																					{resume.analysis.recommendedRoles
																						.length > 3 && (
																						<Badge className="bg-white/10 text-[#EEEEEE]/60 text-xs">
																							+
																							{resume.analysis.recommendedRoles
																								.length - 3}{" "}
																							more
																						</Badge>
																					)}
																				</div>
																			</div>
																		)}
																</div>
															)}

															{!resume.analysis && (
																<p className="text-[#EEEEEE]/60 text-sm">
																	Analysis data not available
																</p>
															)}
														</CardContent>
													</Card>
												))}
											</div>
										</div>
									) : (
										<div className="backdrop-blur-lg bg-white/5 rounded-xl p-8 border border-white/10">
											<p className="text-[#EEEEEE]/60 text-center">
												{searchQuery
													? "No candidates found matching your search criteria."
													: "No candidates in the database yet. They will appear here once job seekers upload their resumes."}
											</p>
										</div>
									)}
								</>
							)}
						</motion.div>
						<KnowButton />
					</div>
				</div>
			)}

			{/* Detailed View Modal */}
			{selectedResume && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
					onClick={() => setSelectedResume(null)}
				>
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.95, opacity: 0 }}
						className="backdrop-blur-lg bg-[#222831]/95 border border-white/10 text-[#EEEEEE] max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg relative"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Close Button */}
						<button
							onClick={() => setSelectedResume(null)}
							className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
						>
							<X className="h-4 w-4 text-[#EEEEEE]" />
						</button>

						<div className="p-6">
							{/* Header */}
							<div className="mb-6">
								<h2 className="text-2xl font-bold text-[#EEEEEE] mb-2">
									{selectedResume.analysis?.name ||
										selectedResume.customName ||
										"Resume Details"}
								</h2>
								<p className="text-[#EEEEEE]/60">
									Comprehensive analysis of candidate profile
								</p>
							</div>

							<div className="space-y-6">
								{/* Personal Information */}
								{(selectedResume.analysis?.name ||
									selectedResume.analysis?.email ||
									selectedResume.analysis?.contact) && (
									<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
										<h3 className="text-lg font-semibold text-[#EEEEEE] mb-4 flex items-center">
											<User className="mr-2 h-5 w-5 text-[#76ABAE]" />
											Personal Information
										</h3>
										<div className="space-y-3">
											{selectedResume.analysis?.name && (
												<div className="flex items-center space-x-3">
													<User className="h-4 w-4 text-[#76ABAE]" />
													<span className="text-[#EEEEEE]">
														{selectedResume.analysis.name}
													</span>
												</div>
											)}
											{selectedResume.analysis?.email && (
												<div className="flex items-center space-x-3">
													<Mail className="h-4 w-4 text-[#76ABAE]" />
													<span className="text-[#EEEEEE]">
														{selectedResume.analysis.email}
													</span>
												</div>
											)}
											{selectedResume.analysis?.contact && (
												<div className="flex items-center space-x-3">
													<Phone className="h-4 w-4 text-[#76ABAE]" />
													<span className="text-[#EEEEEE]">
														{selectedResume.analysis.contact}
													</span>
												</div>
											)}
										</div>
									</div>
								)}

								<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
									{/* Main Content */}
									<div className="lg:col-span-2 space-y-6">
										{/* Skills Analysis */}
										{selectedResume.analysis?.skillsAnalysis &&
											selectedResume.analysis.skillsAnalysis.length > 0 && (
												<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
													<h3 className="text-lg font-semibold text-[#EEEEEE] mb-4 flex items-center">
														<Star className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Skills Analysis
													</h3>
													<div className="space-y-4">
														{selectedResume.analysis.skillsAnalysis.map(
															(skill, index) => (
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
															)
														)}
													</div>
												</div>
											)}

										{/* Work Experience */}
										{selectedResume.analysis?.workExperience &&
											selectedResume.analysis.workExperience.length > 0 && (
												<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
													<h3 className="text-lg font-semibold text-[#EEEEEE] mb-4 flex items-center">
														<Briefcase className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Work Experience
													</h3>
													<div className="space-y-6">
														{selectedResume.analysis.workExperience
															.filter(
																(work) => work.role || work.company_and_duration
															)
															.map((work, index) => (
																<div
																	key={index}
																	className="border-l-2 border-[#76ABAE] pl-4"
																>
																	{work.role && (
																		<h4 className="text-[#EEEEEE] font-semibold">
																			{work.role}
																		</h4>
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
													</div>
												</div>
											)}

										{/* Projects */}
										{selectedResume.analysis?.projects &&
											selectedResume.analysis.projects.length > 0 && (
												<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
													<h3 className="text-lg font-semibold text-[#EEEEEE] mb-4 flex items-center">
														<FolderOpen className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Projects
													</h3>
													<div className="space-y-6">
														{selectedResume.analysis.projects
															.filter(
																(project) =>
																	project.title && project.description
															)
															.map((project, index) => (
																<div
																	key={index}
																	className="border-l-2 border-[#76ABAE] pl-4"
																>
																	<h4 className="text-[#EEEEEE] font-semibold mb-2">
																		{project.title}
																	</h4>
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
													</div>
												</div>
											)}
									</div>

									{/* Sidebar */}
									<div className="space-y-6">
										{/* Recommended Roles */}
										{selectedResume.analysis?.recommendedRoles &&
											selectedResume.analysis.recommendedRoles.length > 0 && (
												<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
													<h3 className="text-lg font-semibold text-[#EEEEEE] mb-4 flex items-center">
														<Code className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Recommended Roles
													</h3>
													<div className="space-y-2">
														{selectedResume.analysis.recommendedRoles.map(
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
												</div>
											)}

										{/* Languages */}
										{selectedResume.analysis?.languages &&
											selectedResume.analysis.languages.length > 0 && (
												<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
													<h3 className="text-lg font-semibold text-[#EEEEEE] mb-4 flex items-center">
														<Languages className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Languages
													</h3>
													<div className="space-y-2">
														{selectedResume.analysis.languages
															.filter(
																(lang) =>
																	lang &&
																	typeof lang === "object" &&
																	lang.language
															)
															.map((lang, index) => (
																<div key={index} className="text-[#EEEEEE]/80">
																	{lang.language}
																</div>
															))}
													</div>
												</div>
											)}

										{/* Education */}
										{selectedResume.analysis?.education &&
											selectedResume.analysis.education.length > 0 && (
												<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
													<h3 className="text-lg font-semibold text-[#EEEEEE] mb-4 flex items-center">
														<GraduationCap className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Education
													</h3>
													<div className="space-y-2">
														{selectedResume.analysis.education
															.filter(
																(edu) =>
																	edu &&
																	typeof edu === "object" &&
																	edu.education_detail
															)
															.map((edu, index) => (
																<p key={index} className="text-[#EEEEEE]/80">
																	{edu.education_detail}
																</p>
															))}
													</div>
												</div>
											)}

										{/* Predicted Field */}
										{selectedResume.analysis?.predictedField && (
											<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
												<h3 className="text-lg font-semibold text-[#EEEEEE] mb-4 flex items-center">
													<Star className="mr-2 h-5 w-5 text-[#76ABAE]" />
													Predicted Field
												</h3>
												<Badge className="bg-[#76ABAE]/20 text-[#76ABAE] hover:bg-[#76ABAE]/30">
													{selectedResume.analysis.predictedField}
												</Badge>
											</div>
										)}

										{/* Upload Info */}
										<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
											<h3 className="text-lg font-semibold text-[#EEEEEE] mb-4 flex items-center">
												<Calendar className="mr-2 h-5 w-5 text-[#76ABAE]" />
												Upload Information
											</h3>
											<div className="space-y-2 text-sm">
												<p className="text-[#EEEEEE]/80">
													<span className="font-medium">Custom Name:</span>{" "}
													{selectedResume.customName}
												</p>
												<p className="text-[#EEEEEE]/80">
													<span className="font-medium">Uploaded:</span>{" "}
													{new Date(
														selectedResume.uploadDate
													).toLocaleDateString()}
												</p>
												<p className="text-[#EEEEEE]/80">
													<span className="font-medium">Uploader:</span>{" "}
													{selectedResume.user.name ||
														selectedResume.user.email}
												</p>
												<p className="text-[#EEEEEE]/80">
													<span className="font-medium">Role:</span>{" "}
													{selectedResume.user.role}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</>
	);
}
