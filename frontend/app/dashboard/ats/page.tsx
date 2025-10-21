"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import ResumeSelection from "@/components/ats/ResumeSelection";
import JobDescriptionForm from "@/components/ats/JobDescriptionForm";
import EvaluationResults from "@/components/ats/EvaluationResults";
import LoadingOverlay from "@/components/ats/LoadingOverlay";
import PageLoader from "@/components/ats/PageLoader";

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

	return (
		<>
			<PageLoader isPageLoading={isPageLoading} />
			{!isPageLoading && (
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
					<LoadingOverlay isEvaluating={isEvaluating} />

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
											<ResumeSelection
												resumeSelectionMode={resumeSelectionMode}
												setResumeSelectionMode={setResumeSelectionMode}
												userResumes={userResumes}
												selectedResumeId={selectedResumeId}
												setSelectedResumeId={setSelectedResumeId}
												isLoadingResumes={isLoadingResumes}
												showResumeDropdown={showResumeDropdown}
												setShowResumeDropdown={setShowResumeDropdown}
												resumeFile={resumeFile}
												setResumeFile={setResumeFile}
												resumeText={resumeText}
												setResumeText={setResumeText}
											/>
											<JobDescriptionForm
												formData={formData}
												handleInputChange={handleInputChange}
											/>
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
																<span className="text-base">
																	Evaluate Resume
																</span>
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
									<EvaluationResults evaluationResult={evaluationResult} />
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
