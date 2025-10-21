"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";

interface ATSEvaluationResponse {
	success: boolean;
	message: string;
	score: number;
	reasons_for_the_score: string[];
	suggestions: string[];
}

interface UserResume {
	id: string;
	customName: string;
	uploadDate: string;
	candidateName?: string;
	predictedField?: string;
}

export default function ATSEvaluationPage() {
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [isEvaluating, setIsEvaluating] = useState(false);
	const [evaluationResult, setEvaluationResult] = useState<{
		score: number;
		reasons_for_the_score: string[];
		suggestions: string[];
	} | null>(null);

	const [resumeFile, setResumeFile] = useState<File | null>(null);
	const [resumeText, setResumeText] = useState("");

	// Resume selection states
	const [userResumes, setUserResumes] = useState<UserResume[]>([]);
	const [selectedResumeId, setSelectedResumeId] = useState<string>("");
	const [isLoadingResumes, setIsLoadingResumes] = useState(false);
	const [showResumeDropdown, setShowResumeDropdown] = useState(false);
	const [resumeSelectionMode, setResumeSelectionMode] = useState<
		"existing" | "upload"
	>("existing");

	const { toast } = useToast();

	const [formData, setFormData] = useState({
		jd_text: "",
		jd_link: "",
		company_name: "",
		company_website: "",
	});

	// Fetch user's resumes
	const fetchUserResumes = async () => {
		setIsLoadingResumes(true);
		try {
			const response = await fetch("/api/ats", {
				method: "GET",
			});

			if (response.ok) {
				const result = await response.json();
				if (result.success && result.data?.resumes) {
					setUserResumes(result.data.resumes);
				}
			}
		} catch (error) {
			console.error("Failed to fetch resumes:", error);
		} finally {
			setIsLoadingResumes(false);
		}
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (showResumeDropdown) {
				setShowResumeDropdown(false);
			}
		};

		if (showResumeDropdown) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showResumeDropdown]);

	// Initialize page
	useEffect(() => {
		const timer = setTimeout(() => setIsPageLoading(false), 100);
		fetchUserResumes();
		return () => clearTimeout(timer);
	}, []);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setResumeFile(file);
			const fileExtension = file.name.toLowerCase().split(".").pop();
			if (fileExtension === "txt" || fileExtension === "md") {
				const reader = new FileReader();
				reader.onload = (e) => {
					const text = e.target?.result as string;
					setResumeText(text.substring(0, 500) + "...");
				};
				reader.readAsText(file);
			} else {
				setResumeText(
					`${file.name} (${(file.size / 1024).toFixed(
						1
					)} KB) - ${fileExtension?.toUpperCase()} file selected`
				);
			}
		}
	};

	const evaluateATS = async () => {
		// Validate resume source
		if (resumeSelectionMode === "existing") {
			if (!selectedResumeId) {
				toast({
					title: "Resume Required",
					description: "Please select a resume from your saved resumes.",
					variant: "destructive",
				});
				return;
			}
		} else if (resumeSelectionMode === "upload") {
			if (!resumeFile) {
				toast({
					title: "Resume Required",
					description: "Please upload your resume first.",
					variant: "destructive",
				});
				return;
			}
		}

		// Validate job description
		if (!formData.jd_text && !formData.jd_link) {
			toast({
				title: "Job Description Required",
				description: "Please provide either job description text or a link.",
				variant: "destructive",
			});
			return;
		}

		setIsEvaluating(true);

		try {
			const formDataToSend = new FormData();

			// Add resume data based on selection mode
			if (resumeSelectionMode === "existing") {
				formDataToSend.append("resumeId", selectedResumeId);
			} else if (resumeSelectionMode === "upload") {
				formDataToSend.append("file", resumeFile!);
			}

			if (formData.jd_text) {
				formDataToSend.append("jd_text", formData.jd_text);
			}
			if (formData.jd_link) {
				formDataToSend.append("jd_link", formData.jd_link);
			}
			if (formData.company_name) {
				formDataToSend.append("company_name", formData.company_name);
			}
			if (formData.company_website) {
				formDataToSend.append("company_website", formData.company_website);
			}

			const response = await fetch("/api/ats", {
				method: "POST",
				body: formDataToSend,
			});

			const result: ATSEvaluationResponse = await response.json();

			if (result.success) {
				setEvaluationResult({
					score: result.score,
					reasons_for_the_score: result.reasons_for_the_score,
					suggestions: result.suggestions,
				});
				toast({
					title: "Evaluation Complete!",
					description: `Your resume scored ${result.score}/100 for this position.`,
				});
			} else {
				throw new Error(result.message || "Failed to evaluate resume");
			}
		} catch (error) {
			toast({
				title: "Evaluation Failed",
				description:
					error instanceof Error
						? error.message
						: "An error occurred while evaluating your resume.",
				variant: "destructive",
			});
		} finally {
			setIsEvaluating(false);
		}
	};

	const getScoreColor = (score: number) => {
		if (score >= 80) return "text-green-400";
		if (score >= 60) return "text-yellow-400";
		return "text-red-400";
	};

	const getScoreGradient = (score: number) => {
		if (score >= 80) return "from-green-500 to-green-600";
		if (score >= 60) return "from-yellow-500 to-yellow-600";
		return "from-red-500 to-red-600";
	};

	if (isPageLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
				<Loader variant="spinner" size="lg" className="text-[#76ABAE]" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
			{/* Loading Overlay */}
			{isEvaluating && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
					<div className="bg-[#31363F] rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
						<div className="flex flex-col items-center space-y-4">
							<Loader variant="spinner" size="lg" className="text-[#76ABAE]" />
							<h3 className="text-xl font-semibold text-[#EEEEEE]">
								Evaluating Your Resume
							</h3>
							<p className="text-[#EEEEEE]/70 text-center">
								Analyzing your resume against the job description...
							</p>
						</div>
					</div>
				</div>
			)}

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
				{/* Back button */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-6 sm:mb-8"
				>
					<Link href="/dashboard/seeker">
						<Button
							variant="ghost"
							size="sm"
							className="text-[#EEEEEE] hover:text-[#76ABAE] hover:bg-white/5 transition-all duration-300 p-2 sm:p-3"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							<span className="hidden sm:inline">Back to Dashboard</span>
							<span className="sm:hidden">Back</span>
						</Button>
					</Link>
				</motion.div>

				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="text-center mb-8 sm:mb-12"
					>
						<div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#76ABAE]/10 rounded-2xl mb-4 sm:mb-6">
							<Target className="h-8 w-8 sm:h-10 sm:w-10 text-[#76ABAE]" />
						</div>
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#EEEEEE] mb-3 sm:mb-4 leading-tight">
							ATS Resume Evaluator
						</h1>
						<p className="text-[#EEEEEE]/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">
							Analyze how well your resume matches a job description and get
							actionable suggestions to improve your ATS score.
						</p>
					</motion.div>

					{/* Main Grid */}
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
						{/* Input Form */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.4 }}
							className="order-1"
						>
							<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden">
								<CardHeader className="pb-4">
									<CardTitle className="text-[#EEEEEE] text-xl sm:text-2xl font-semibold">
										Evaluation Details
									</CardTitle>
									<p className="text-[#EEEEEE]/60 text-sm">
										Provide your resume and job description for ATS analysis
									</p>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Resume Selection */}
									<div className="space-y-3">
										<label className="text-[#EEEEEE] font-medium text-sm">
											Resume Source
										</label>
										<div className="flex gap-2">
											<Button
												type="button"
												onClick={() => setResumeSelectionMode("existing")}
												className={`flex-1 ${
													resumeSelectionMode === "existing"
														? "bg-[#76ABAE] text-white"
														: "bg-white/5 text-[#EEEEEE] hover:bg-white/10"
												}`}
											>
												Saved Resumes
											</Button>
											<Button
												type="button"
												onClick={() => setResumeSelectionMode("upload")}
												className={`flex-1 ${
													resumeSelectionMode === "upload"
														? "bg-[#76ABAE] text-white"
														: "bg-white/5 text-[#EEEEEE] hover:bg-white/10"
												}`}
											>
												Upload New
											</Button>
										</div>
									</div>

									{/* Existing Resume Selector */}
									{resumeSelectionMode === "existing" && (
										<div className="space-y-2">
											<label className="text-[#EEEEEE] font-medium text-sm">
												Select Resume
											</label>
											<select
												value={selectedResumeId}
												onChange={(e) => setSelectedResumeId(e.target.value)}
												className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-[#EEEEEE] focus:outline-none focus:ring-2 focus:ring-[#76ABAE]"
											>
												<option value="">Choose a resume...</option>
												{userResumes.map((resume) => (
													<option key={resume.id} value={resume.id}>
														{resume.customName} -{" "}
														{resume.candidateName || "Unknown"} (
														{new Date(resume.uploadDate).toLocaleDateString()})
													</option>
												))}
											</select>
										</div>
									)}

									{/* File Upload */}
									{resumeSelectionMode === "upload" && (
										<div className="space-y-2">
											<label className="text-[#EEEEEE] font-medium text-sm">
												Upload Resume
											</label>
											<div className="relative">
												<input
													type="file"
													accept=".pdf,.doc,.docx,.txt"
													onChange={handleFileUpload}
													className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-[#EEEEEE] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#76ABAE] file:text-white file:cursor-pointer hover:file:bg-[#76ABAE]/80"
												/>
											</div>
											{resumeText && (
												<p className="text-[#EEEEEE]/60 text-xs mt-2">
													{resumeText}
												</p>
											)}
										</div>
									)}

									{/* Job Description Text */}
									<div className="space-y-2">
										<label className="text-[#EEEEEE] font-medium text-sm">
											Job Description (Text)
										</label>
										<textarea
											value={formData.jd_text}
											onChange={(e) =>
												handleInputChange("jd_text", e.target.value)
											}
											placeholder="Paste the job description here..."
											rows={6}
											className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-[#EEEEEE] placeholder-[#EEEEEE]/30 focus:outline-none focus:ring-2 focus:ring-[#76ABAE] resize-none"
										/>
									</div>

									{/* OR Divider */}
									<div className="relative">
										<div className="absolute inset-0 flex items-center">
											<div className="w-full border-t border-white/10"></div>
										</div>
										<div className="relative flex justify-center text-xs">
											<span className="px-2 bg-[#31363F] text-[#EEEEEE]/60">
												OR
											</span>
										</div>
									</div>

									{/* Job Description Link */}
									<div className="space-y-2">
										<label className="text-[#EEEEEE] font-medium text-sm">
											Job Description (Link)
										</label>
										<input
											type="url"
											value={formData.jd_link}
											onChange={(e) =>
												handleInputChange("jd_link", e.target.value)
											}
											placeholder="https://example.com/job-posting"
											className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-[#EEEEEE] placeholder-[#EEEEEE]/30 focus:outline-none focus:ring-2 focus:ring-[#76ABAE]"
										/>
									</div>

									{/* Company Name (Optional) */}
									<div className="space-y-2">
										<label className="text-[#EEEEEE] font-medium text-sm">
											Company Name{" "}
											<span className="text-[#EEEEEE]/40">(Optional)</span>
										</label>
										<input
											type="text"
											value={formData.company_name}
											onChange={(e) =>
												handleInputChange("company_name", e.target.value)
											}
											placeholder="e.g., Google"
											className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-[#EEEEEE] placeholder-[#EEEEEE]/30 focus:outline-none focus:ring-2 focus:ring-[#76ABAE]"
										/>
									</div>

									{/* Company Website (Optional) */}
									<div className="space-y-2">
										<label className="text-[#EEEEEE] font-medium text-sm">
											Company Website{" "}
											<span className="text-[#EEEEEE]/40">(Optional)</span>
										</label>
										<input
											type="url"
											value={formData.company_website}
											onChange={(e) =>
												handleInputChange("company_website", e.target.value)
											}
											placeholder="https://company.com"
											className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-[#EEEEEE] placeholder-[#EEEEEE]/30 focus:outline-none focus:ring-2 focus:ring-[#76ABAE]"
										/>
									</div>

									{/* Evaluate Button */}
									<motion.div
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.99 }}
									>
										<Button
											onClick={evaluateATS}
											disabled={
												isEvaluating ||
												(resumeSelectionMode === "existing"
													? !selectedResumeId
													: !resumeFile) ||
												(!formData.jd_text && !formData.jd_link)
											}
											className="relative w-full h-14 bg-gradient-to-r from-[#76ABAE] to-[#76ABAE]/80 hover:from-[#76ABAE]/90 hover:to-[#76ABAE]/70 text-white font-semibold rounded-xl transition-all duration-300 overflow-hidden group disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
										>
											<div className="relative z-10 flex items-center justify-center">
												{isEvaluating ? (
													<>
														<Loader
															variant="spinner"
															size="sm"
															className="mr-2 text-white"
														/>
														<span>Evaluating Resume...</span>
													</>
												) : (
													<>
														<CheckCircle className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
														<span className="text-base">Evaluate Resume</span>
													</>
												)}
											</div>
										</Button>
									</motion.div>
								</CardContent>
							</Card>
						</motion.div>

						{/* Results Panel */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.6 }}
							className="order-2"
						>
							<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden h-full">
								<CardHeader className="pb-4">
									<CardTitle className="text-[#EEEEEE] text-xl sm:text-2xl font-semibold">
										Evaluation Results
									</CardTitle>
								</CardHeader>
								<CardContent>
									{!evaluationResult ? (
										<div className="flex flex-col items-center justify-center py-16 text-center">
											<div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
												<Target className="h-12 w-12 text-[#76ABAE]/40" />
											</div>
											<h3 className="text-[#EEEEEE] text-lg font-medium mb-2">
												No Evaluation Yet
											</h3>
											<p className="text-[#EEEEEE]/60 max-w-md">
												Fill in the form and click "Evaluate Resume" to see how
												well your resume matches the job description.
											</p>
										</div>
									) : (
										<div className="space-y-6">
											{/* Score Display */}
											<div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10">
												<div className="text-center">
													<p className="text-[#EEEEEE]/70 text-sm mb-2">
														ATS Match Score
													</p>
													<div
														className={`text-6xl font-bold ${getScoreColor(
															evaluationResult.score
														)}`}
													>
														{evaluationResult.score}
													</div>
													<p className="text-[#EEEEEE]/50 text-sm mt-2">
														out of 100
													</p>

													{/* Progress Bar */}
													<div className="mt-4 w-full bg-white/10 rounded-full h-3 overflow-hidden">
														<motion.div
															initial={{ width: 0 }}
															animate={{ width: `${evaluationResult.score}%` }}
															transition={{ duration: 1, delay: 0.3 }}
															className={`h-full bg-gradient-to-r ${getScoreGradient(
																evaluationResult.score
															)} rounded-full`}
														/>
													</div>
												</div>
											</div>

											{/* Reasons */}
											<div className="space-y-3">
												<h4 className="text-[#EEEEEE] font-semibold flex items-center gap-2">
													<CheckCircle className="h-5 w-5 text-[#76ABAE]" />
													Why This Score?
												</h4>
												<div className="space-y-2">
													{evaluationResult.reasons_for_the_score.map(
														(reason, index) => (
															<motion.div
																key={index}
																initial={{ opacity: 0, x: -20 }}
																animate={{ opacity: 1, x: 0 }}
																transition={{
																	duration: 0.5,
																	delay: index * 0.1,
																}}
																className="bg-white/5 rounded-lg p-3 border border-white/10"
															>
																<p className="text-[#EEEEEE]/80 text-sm">
																	{reason}
																</p>
															</motion.div>
														)
													)}
												</div>
											</div>

											{/* Suggestions */}
											{evaluationResult.suggestions.length > 0 && (
												<div className="space-y-3">
													<h4 className="text-[#EEEEEE] font-semibold flex items-center gap-2">
														<Target className="h-5 w-5 text-yellow-400" />
														Improvement Suggestions
													</h4>
													<div className="space-y-2">
														{evaluationResult.suggestions.map(
															(suggestion, index) => (
																<motion.div
																	key={index}
																	initial={{ opacity: 0, x: -20 }}
																	animate={{ opacity: 1, x: 0 }}
																	transition={{
																		duration: 0.5,
																		delay: index * 0.1,
																	}}
																	className="bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/20"
																>
																	<p className="text-[#EEEEEE]/80 text-sm">
																		{suggestion}
																	</p>
																</motion.div>
															)
														)}
													</div>
												</div>
											)}
										</div>
									)}
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}
