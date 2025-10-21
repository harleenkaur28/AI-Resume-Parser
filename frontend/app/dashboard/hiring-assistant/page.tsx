"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	ArrowLeft,
	Users,
	Send,
	Copy,
	Download,
	Plus,
	Trash2,
	FileText,
	Briefcase,
	Building,
	HelpCircle,
	Upload,
	CheckCircle,
	ChevronDown,
	Calendar,
	User,
} from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import ResumeSelection from "@/components/hiring-assistant/ResumeSelection";
import InterviewDetailsForm from "@/components/hiring-assistant/InterviewDetailsForm";
import CommonQuestionsPanel from "@/components/hiring-assistant/CommonQuestionsPanel";
import QuestionsEditor from "@/components/hiring-assistant/QuestionsEditor";
import GeneratedAnswersPanel from "@/components/hiring-assistant/GeneratedAnswersPanel";
import LoadingOverlay from "@/components/hiring-assistant/LoadingOverlay";
import PageLoader from "@/components/hiring-assistant/PageLoader";

interface HiringAssistantRequest {
	resume_file: File;
	role: string;
	company: string;
	questions_list: string[];
	word_limit: number;
	user_company_knowledge?: string;
	company_url?: string;
}

interface HiringAssistantResponse {
	success: boolean;
	message: string;
	data: { [key: string]: string };
}

interface UserResume {
	id: string;
	customName: string;
	uploadDate: string;
	candidateName?: string;
	predictedField?: string;
}

export default function HiringAssistant() {
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedAnswers, setGeneratedAnswers] = useState<{
		[key: string]: string;
	} | null>(null);
	const [resumeFile, setResumeFile] = useState<File | null>(null);
	const [resumeText, setResumeText] = useState("");
	const [isPreloaded, setIsPreloaded] = useState(false);
	const [questions, setQuestions] = useState<string[]>([""]);

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
		role: "",
		company: "",
		word_limit: 150,
		user_company_knowledge: "",
		company_url: "",
	});

	// Common interview questions for quick selection
	const commonQuestions = [
		"Tell me about yourself.",
		"Why do you want to work for our company?",
		"What are your greatest strengths?",
		"What is your biggest weakness?",
		"Where do you see yourself in 5 years?",
		"Why are you leaving your current job?",
		"Describe a challenging project you worked on.",
		"How do you handle stress and pressure?",
		"What motivates you?",
		"Do you have any questions for us?",
	];

	// Fetch user's resumes
	const fetchUserResumes = async () => {
		setIsLoadingResumes(true);
		try {
			const response = await fetch("/api/gen-answer", {
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

	// Simulate page load and check for pre-populated data
	useEffect(() => {
		const timer = setTimeout(() => setIsPageLoading(false), 100);

		// Fetch user resumes
		fetchUserResumes();

		// Check for pre-populated resume file and analysis data
		const storedResumeFile = localStorage.getItem("resumeFile");
		const storedAnalysisData = localStorage.getItem("analysisData");

		if (storedResumeFile && storedAnalysisData) {
			try {
				const fileData = JSON.parse(storedResumeFile);
				const analysisData = JSON.parse(storedAnalysisData);

				// Set pre-loaded file info
				setResumeText(
					`${fileData.name} (${(fileData.size / 1024).toFixed(
						1
					)} KB) - Pre-loaded from analysis`
				);
				setIsPreloaded(true);
				setResumeSelectionMode("upload"); // Switch to upload mode if preloaded

				// Pre-populate form with analysis data
				setFormData((prev) => ({
					...prev,
					role: analysisData.predicted_field || "",
				}));

				// Clear the stored data after using it (with a small delay to ensure it's processed)
				setTimeout(() => {
					localStorage.removeItem("resumeFile");
					localStorage.removeItem("analysisData");
				}, 100);

				toast({
					title: "Resume Pre-loaded!",
					description:
						"Your resume and details have been automatically filled from your recent analysis.",
				});
			} catch (error) {
				console.error("Error loading pre-populated data:", error);
			}
		}

		return () => clearTimeout(timer);
	}, [toast]);

	const handleInputChange = (field: string, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setResumeFile(file);
			setIsPreloaded(false); // Clear preloaded state when new file is uploaded

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

	const addQuestion = () => {
		setQuestions([...questions, ""]);
	};

	const removeQuestion = (index: number) => {
		if (questions.length > 1) {
			setQuestions(questions.filter((_, i) => i !== index));
		}
	};

	const updateQuestion = (index: number, value: string) => {
		const updatedQuestions = [...questions];
		updatedQuestions[index] = value;
		setQuestions(updatedQuestions);
	};

	const addCommonQuestion = (question: string) => {
		if (!questions.includes(question)) {
			setQuestions([...questions.filter((q) => q !== ""), question]);
		}
	};

	const generateAnswers = async () => {
		// Validation for resume selection
		if (resumeSelectionMode === "existing") {
			if (!selectedResumeId) {
				toast({
					title: "Resume Required",
					description: "Please select a resume from your saved resumes.",
					variant: "destructive",
				});
				return;
			}
		} else {
			if (!resumeFile && !isPreloaded) {
				toast({
					title: "Resume Required",
					description: "Please upload your resume first.",
					variant: "destructive",
				});
				return;
			}

			if (isPreloaded && !resumeFile) {
				toast({
					title: "Resume File Needed",
					description: "Please re-upload your resume file to generate answers.",
					variant: "destructive",
				});
				return;
			}
		}

		if (!formData.role || !formData.company) {
			toast({
				title: "Required Fields Missing",
				description: "Please fill in the role and company name.",
				variant: "destructive",
			});
			return;
		}

		const validQuestions = questions.filter((q) => q.trim() !== "");
		if (validQuestions.length === 0) {
			toast({
				title: "Questions Required",
				description: "Please add at least one interview question.",
				variant: "destructive",
			});
			return;
		}

		setIsGenerating(true);

		try {
			const formDataToSend = new FormData();

			// Add resume data based on selection mode
			if (resumeSelectionMode === "existing") {
				formDataToSend.append("resumeId", selectedResumeId);
			} else {
				formDataToSend.append("file", resumeFile!);
			}

			formDataToSend.append("role", formData.role);
			formDataToSend.append("company_name", formData.company);
			formDataToSend.append("word_limit", formData.word_limit.toString());
			formDataToSend.append("questions", JSON.stringify(validQuestions));

			if (formData.user_company_knowledge) {
				formDataToSend.append(
					"user_knowledge",
					formData.user_company_knowledge
				);
			}
			if (formData.company_url) {
				formDataToSend.append("company_url", formData.company_url);
			}

			const response = await fetch("/api/gen-answer", {
				method: "POST",
				body: formDataToSend,
			});

			const result: HiringAssistantResponse = await response.json();

			if (result.success && result.data) {
				setGeneratedAnswers(result.data);
				toast({
					title: "Answers Generated Successfully!",
					description:
						"Your interview answers have been generated and are ready for review.",
				});
			} else {
				throw new Error(result.message || "Failed to generate answers");
			}
		} catch (error) {
			toast({
				title: "Generation Failed",
				description:
					error instanceof Error
						? error.message
						: "An error occurred while generating the answers.",
				variant: "destructive",
			});
		} finally {
			setIsGenerating(false);
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast({
				title: "Copied!",
				description: "Answer copied to clipboard.",
			});
		} catch (error) {
			toast({
				title: "Copy Failed",
				description: "Could not copy to clipboard.",
				variant: "destructive",
			});
		}
	};

	const downloadAsText = () => {
		if (!generatedAnswers) return;

		let content = `Interview Answers for ${formData.role} at ${formData.company}\n\n`;
		Object.entries(generatedAnswers).forEach(([question, answer]) => {
			content += `Q: ${question}\n\nA: ${answer}\n\n---\n\n`;
		});

		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "interview-answers.txt";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<>
			<PageLoader isPageLoading={isPageLoading} />
			{!isPageLoading && (
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] relative overflow-hidden">
					<LoadingOverlay isGenerating={isGenerating} />
					{/* Background decorative elements */}
					<div className="absolute inset-0 overflow-hidden pointer-events-none">
						<div className="absolute -top-20 -right-20 md:-top-40 md:-right-40 w-40 h-40 md:w-80 md:h-80 bg-[#76ABAE]/10 rounded-full blur-3xl"></div>
						<div className="absolute -bottom-20 -left-20 md:-bottom-40 md:-left-40 w-40 h-40 md:w-80 md:h-80 bg-[#76ABAE]/5 rounded-full blur-3xl"></div>
						<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-96 md:h-96 bg-[#76ABAE]/5 rounded-full blur-3xl"></div>
					</div>
					<div className="container mx-auto px-4 py-6 relative z-10 max-w-7xl">
						{/* Header with back button */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
							className="mb-6"
						>
							<Link href="/dashboard/seeker">
								<Button
									variant="ghost"
									size="sm"
									className="text-[#EEEEEE] hover:text-[#76ABAE] hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-[#76ABAE]/30 h-10"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									<span className="hidden sm:inline">Back to Dashboard</span>
									<span className="sm:hidden">Back</span>
								</Button>
							</Link>
						</motion.div>
						{/* Modern header with better mobile typography */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="text-center mb-8 sm:mb-12"
						>
							<div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#76ABAE]/10 rounded-2xl mb-4 sm:mb-6">
								<Users className="h-8 w-8 sm:h-10 sm:w-10 text-[#76ABAE]" />
							</div>
							<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#EEEEEE] mb-3 sm:mb-4 leading-tight">
								AI Hiring Assistant
							</h1>
							<p className="text-[#EEEEEE]/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">
								Generate personalized interview answers using AI to help you
								prepare for your next opportunity.
							</p>
						</motion.div>
						{/* Main Content Grid */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 lg:items-start">
							{/* Setup Panel */}
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8, delay: 0.4 }}
								className="lg:col-span-1 space-y-6"
							>
								<Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
									<CardHeader className="pb-4">
										<CardTitle className="text-[#EEEEEE] text-lg md:text-xl font-semibold">
											Interview Details
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
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
											isPreloaded={isPreloaded}
											setIsPreloaded={setIsPreloaded}
											formData={formData}
											setFormData={setFormData}
										/>
										<InterviewDetailsForm
											formData={formData}
											handleInputChange={handleInputChange}
										/>
										<motion.div
											whileHover={{ scale: 1.01 }}
											whileTap={{ scale: 0.99 }}
										>
											<Button
												onClick={generateAnswers}
												disabled={
													isGenerating ||
													(resumeSelectionMode === "existing"
														? !selectedResumeId
														: !resumeFile && !isPreloaded) ||
													!formData.role ||
													!formData.company
												}
												className="relative w-full h-14 bg-gradient-to-r from-[#76ABAE] to-[#76ABAE]/80 hover:from-[#76ABAE]/90 hover:to-[#76ABAE]/70 text-white font-semibold rounded-xl transition-all duration-300 overflow-hidden group disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
											>
												{isGenerating ? (
													<div className="absolute inset-0 bg-gradient-to-r from-[#76ABAE]/20 via-[#76ABAE]/40 to-[#76ABAE]/20 animate-pulse"></div>
												) : null}
												<div className="relative z-10 flex items-center justify-center">
													{isGenerating ? (
														<>
															<div className="flex items-center space-x-3">
																<div className="relative">
																	<Loader
																		variant="spinner"
																		size="sm"
																		className="text-white"
																	/>
																	<div className="absolute inset-0 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
																</div>
																<div className="flex flex-col items-start">
																	<span className="text-sm font-medium">
																		Generating answers...
																	</span>
																	<span className="text-xs text-white/80">
																		Processing your questions
																	</span>
																</div>
															</div>
														</>
													) : (
														<>
															<Send className="mr-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
															<span className="text-base">
																Generate Answers
															</span>
														</>
													)}
												</div>
												<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
												{isGenerating ? (
													<div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-pulse w-full">
														<div className="h-full bg-white/60 animate-pulse"></div>
													</div>
												) : null}
											</Button>
										</motion.div>
									</CardContent>
								</Card>
								<CommonQuestionsPanel
									commonQuestions={commonQuestions}
									addCommonQuestion={addCommonQuestion}
								/>
							</motion.div>
							{/* Questions Section */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.6 }}
								className="lg:col-span-1 flex flex-col"
							>
								<QuestionsEditor
									questions={questions}
									addQuestion={addQuestion}
									removeQuestion={removeQuestion}
									updateQuestion={updateQuestion}
								/>
							</motion.div>
							{/* Answers Section */}
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8, delay: 0.8 }}
								className="lg:col-span-1 flex flex-col"
							>
								<GeneratedAnswersPanel
									generatedAnswers={generatedAnswers}
									formData={formData}
									copyToClipboard={copyToClipboard}
									downloadAsText={downloadAsText}
								/>
							</motion.div>
						</div>
					</div>
					{/* Custom scrollbar styles */}
					<style jsx global>{`
						.custom-scrollbar {
							scrollbar-width: thin;
							scrollbar-color: rgba(118, 171, 174, 0.3) transparent;
						}

						.custom-scrollbar::-webkit-scrollbar {
							width: 4px;
						}

						.custom-scrollbar::-webkit-scrollbar-track {
							background: transparent;
						}

						.custom-scrollbar::-webkit-scrollbar-thumb {
							background-color: rgba(118, 171, 174, 0.3);
							border-radius: 2px;
						}

						.custom-scrollbar::-webkit-scrollbar-thumb:hover {
							background-color: rgba(118, 171, 174, 0.5);
						}
					`}</style>
				</div>
			)}
		</>
	);
}
