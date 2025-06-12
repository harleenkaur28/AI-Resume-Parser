"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";

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

export default function HiringAssistant() {
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedAnswers, setGeneratedAnswers] = useState<{
		[key: string]: string;
	} | null>(null);
	const [resumeFile, setResumeFile] = useState<File | null>(null);
	const [resumeText, setResumeText] = useState("");
	const [questions, setQuestions] = useState<string[]>([""]);
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

	// Simulate page load
	useState(() => {
		const timer = setTimeout(() => setIsPageLoading(false), 800);
		return () => clearTimeout(timer);
	});

	const handleInputChange = (field: string, value: string | number) => {
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
		if (!resumeFile) {
			toast({
				title: "Resume Required",
				description: "Please upload your resume first.",
				variant: "destructive",
			});
			return;
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
			formDataToSend.append("file", resumeFile);
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

			const response = await fetch("http://localhost:8000/hiring-assistant/", {
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
							text="Loading Hiring Assistant..."
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{!isPageLoading && (
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] relative overflow-hidden">
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

						{/* Hero Section */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="text-center mb-8 md:mb-12"
						>
							<motion.div
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 0.6, delay: 0.3 }}
								className="relative inline-block mb-4 md:mb-6"
							>
								<div className="absolute inset-0 bg-gradient-to-r from-[#76ABAE] to-[#76ABAE]/60 rounded-full blur-xl opacity-30"></div>
								<Users className="h-12 w-12 md:h-16 md:w-16 text-[#76ABAE] relative z-10" />
							</motion.div>
							<motion.h1
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.4 }}
								className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#EEEEEE] via-[#76ABAE] to-[#EEEEEE] bg-clip-text text-transparent mb-3 md:mb-4"
							>
								AI Hiring Assistant
							</motion.h1>
							<motion.p
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.6 }}
								className="text-[#EEEEEE]/70 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed px-2"
							>
								Get personalized interview answers tailored to your resume,
								role, and company insights.
							</motion.p>
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
								{/* Interview Setup Card */}
								<Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
									<CardHeader className="pb-4">
										<CardTitle className="text-[#EEEEEE] text-lg md:text-xl font-semibold bg-gradient-to-r from-[#76ABAE] to-[#EEEEEE] bg-clip-text text-transparent flex items-center">
											<Briefcase className="mr-2 h-5 w-5 text-[#76ABAE]" />
											Interview Setup
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										{/* Modern Resume Upload */}
										<div>
											<Label
												htmlFor="resume"
												className="text-[#EEEEEE] mb-3 flex items-center font-medium text-sm"
											>
												<FileText className="mr-2 h-4 w-4 text-[#76ABAE]" />
												Resume File *
											</Label>
											<div className="relative">
												<Input
													id="resume"
													type="file"
													accept=".pdf,.doc,.docx,.txt,.md"
													onChange={handleFileUpload}
													className="hidden"
												/>
												<motion.label
													htmlFor="resume"
													whileHover={{ scale: 1.01 }}
													whileTap={{ scale: 0.99 }}
													className="relative flex items-center justify-center w-full h-28 border-2 border-dashed border-white/20 rounded-xl bg-gradient-to-br from-white/5 to-white/10 hover:from-[#76ABAE]/10 hover:to-[#76ABAE]/5 transition-all duration-500 cursor-pointer group overflow-hidden"
												>
													{/* Animated background gradient */}
													<div className="absolute inset-0 bg-gradient-to-r from-[#76ABAE]/0 via-[#76ABAE]/5 to-[#76ABAE]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>

													<div className="relative z-10 text-center">
														{resumeFile ? (
															<motion.div
																initial={{ opacity: 0, scale: 0.8 }}
																animate={{ opacity: 1, scale: 1 }}
																className="flex flex-col items-center"
															>
																<div className="relative mb-2">
																	<div className="absolute inset-0 bg-[#76ABAE]/20 rounded-full blur-lg"></div>
																	<CheckCircle className="relative h-6 w-6 text-[#76ABAE]" />
																</div>
																<p className="text-[#EEEEEE] text-sm font-medium mb-1 max-w-44 truncate">
																	{resumeFile.name}
																</p>
																<p className="text-[#76ABAE] text-xs font-medium">
																	✓ Ready for analysis
																</p>
															</motion.div>
														) : (
															<motion.div
																className="flex flex-col items-center"
																whileHover={{ y: -1 }}
																transition={{ duration: 0.2 }}
															>
																<div className="relative mb-2">
																	<div className="absolute inset-0 bg-[#76ABAE]/10 rounded-full blur-lg group-hover:bg-[#76ABAE]/20 transition-colors duration-500"></div>
																	<Upload className="relative h-6 w-6 text-[#EEEEEE]/60 group-hover:text-[#76ABAE] transition-colors duration-300" />
																</div>
																<p className="text-[#EEEEEE] text-sm font-medium mb-1">
																	Upload Resume
																</p>
																<div className="flex items-center space-x-2 text-xs text-[#EEEEEE]/50 mt-2">
																	<span className="px-2 py-1 bg-white/10 rounded-full">
																		PDF
																	</span>
																	<span className="px-2 py-1 bg-white/10 rounded-full">
																		DOC
																	</span>
																	<span className="px-2 py-1 bg-white/10 rounded-full">
																		TXT
																	</span>
																	<span className="px-2 py-1 bg-white/10 rounded-full">
																		MD
																	</span>
																</div>
															</motion.div>
														)}
													</div>
												</motion.label>
											</div>
											{resumeText && (
												<motion.div
													initial={{ opacity: 0, height: 0 }}
													animate={{ opacity: 1, height: "auto" }}
													className="mt-3 p-3 bg-gradient-to-r from-[#76ABAE]/10 to-[#76ABAE]/5 border border-[#76ABAE]/20 rounded-lg backdrop-blur-sm"
												>
													<div className="flex items-start space-x-2">
														<FileText className="h-4 w-4 text-[#76ABAE] mt-0.5 flex-shrink-0" />
														<div>
															<p className="text-[#EEEEEE]/90 text-xs font-medium mb-1">
																File Preview:
															</p>
															<p className="text-[#EEEEEE]/70 text-xs leading-relaxed">
																{resumeText}
															</p>
														</div>
													</div>
												</motion.div>
											)}
										</div>

										{/* Role & Company */}
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div>
												<Label
													htmlFor="role"
													className="text-[#EEEEEE] mb-2 block font-medium text-sm"
												>
													Role *
												</Label>
												<Input
													id="role"
													placeholder="Software Engineer"
													value={formData.role}
													onChange={(e) =>
														handleInputChange("role", e.target.value)
													}
													className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 hover:bg-white/10 transition-all duration-300 focus:border-[#76ABAE] focus:ring-2 focus:ring-[#76ABAE]/20 text-sm"
												/>
											</div>
											<div>
												<Label
													htmlFor="company"
													className="text-[#EEEEEE] mb-2 flex items-center font-medium text-sm"
												>
													<Building className="mr-1 h-3 w-3 text-[#76ABAE]" />
													Company *
												</Label>
												<Input
													id="company"
													placeholder="Tech Corp"
													value={formData.company}
													onChange={(e) =>
														handleInputChange("company", e.target.value)
													}
													className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 hover:bg-white/10 transition-all duration-300 focus:border-[#76ABAE] focus:ring-2 focus:ring-[#76ABAE]/20 text-sm"
												/>
											</div>
										</div>

										{/* Word Limit */}
										<div>
											<Label
												htmlFor="word_limit"
												className="text-[#EEEEEE] mb-2 block font-medium text-sm"
											>
												Word Limit ({formData.word_limit} words)
											</Label>
											<Input
												id="word_limit"
												type="number"
												min="50"
												max="500"
												value={formData.word_limit}
												onChange={(e) =>
													handleInputChange(
														"word_limit",
														parseInt(e.target.value) || 150
													)
												}
												className="bg-white/5 border-white/20 text-[#EEEEEE] hover:bg-white/10 transition-all duration-300 focus:border-[#76ABAE] focus:ring-2 focus:ring-[#76ABAE]/20 text-sm"
											/>
										</div>

										{/* Company Knowledge */}
										<div>
											<Label
												htmlFor="user_company_knowledge"
												className="text-[#EEEEEE] mb-2 block font-medium text-sm"
											>
												Company Knowledge{" "}
												<span className="text-[#EEEEEE]/60">(Optional)</span>
											</Label>
											<textarea
												id="user_company_knowledge"
												placeholder="What you know about the company..."
												value={formData.user_company_knowledge}
												onChange={(e) =>
													handleInputChange(
														"user_company_knowledge",
														e.target.value
													)
												}
												className="w-full h-20 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 resize-none hover:bg-white/10 transition-all duration-300 focus:border-[#76ABAE] focus:ring-2 focus:ring-[#76ABAE]/20 text-sm"
											/>
										</div>

										{/* Company URL */}
										<div>
											<Label
												htmlFor="company_url"
												className="text-[#EEEEEE] mb-2 block font-medium text-sm"
											>
												Company Website{" "}
												<span className="text-[#EEEEEE]/60">(Optional)</span>
											</Label>
											<Input
												id="company_url"
												placeholder="https://company.com"
												value={formData.company_url}
												onChange={(e) =>
													handleInputChange("company_url", e.target.value)
												}
												className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 hover:bg-white/10 transition-all duration-300 focus:border-[#76ABAE] focus:ring-2 focus:ring-[#76ABAE]/20 text-sm"
											/>
										</div>

										{/* Enhanced Generate Button */}
										<motion.div
											whileHover={{ scale: 1.01 }}
											whileTap={{ scale: 0.99 }}
										>
											<Button
												onClick={generateAnswers}
												disabled={
													isGenerating ||
													!resumeFile ||
													!formData.role ||
													!formData.company
												}
												className="relative w-full h-14 bg-gradient-to-r from-[#76ABAE] to-[#76ABAE]/80 hover:from-[#76ABAE]/90 hover:to-[#76ABAE]/70 text-white font-semibold rounded-xl transition-all duration-300 overflow-hidden group disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
											>
												{/* Animated background for loading state */}
												{isGenerating && (
													<div className="absolute inset-0 bg-gradient-to-r from-[#76ABAE]/20 via-[#76ABAE]/40 to-[#76ABAE]/20 animate-pulse"></div>
												)}

												{/* Button content */}
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
																	{/* Additional spinning ring */}
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

												{/* Subtle shine effect on hover */}
												<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

												{/* Progress indicator for loading */}
												{isGenerating && (
													<div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-pulse w-full">
														<div className="h-full bg-white/60 animate-pulse"></div>
													</div>
												)}
											</Button>
										</motion.div>
									</CardContent>
								</Card>

								{/* Common Questions */}
								<Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
									<CardHeader className="pb-3">
										<CardTitle className="text-[#EEEEEE] text-lg font-semibold bg-gradient-to-r from-[#76ABAE] to-[#EEEEEE] bg-clip-text text-transparent flex items-center">
											<HelpCircle className="mr-2 h-4 w-4 text-[#76ABAE]" />
											Quick Add
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
											{commonQuestions.slice(0, 5).map((question, index) => (
												<Button
													key={index}
													variant="ghost"
													size="sm"
													onClick={() => addCommonQuestion(question)}
													className="text-left justify-start text-[#EEEEEE]/80 hover:text-[#76ABAE] hover:bg-white/10 text-xs p-2 h-auto rounded-lg transition-all duration-300 border border-transparent hover:border-[#76ABAE]/30"
												>
													<Plus className="mr-2 h-3 w-3 flex-shrink-0" />
													<span className="text-left leading-relaxed truncate">
														{question}
													</span>
												</Button>
											))}
										</div>
									</CardContent>
								</Card>
							</motion.div>

							{/* Questions Section */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.6 }}
								className="lg:col-span-1 flex flex-col"
							>
								<Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500 flex-1 flex flex-col max-h-[calc(100vh-16rem)]">
									<CardHeader className="pb-4 flex-shrink-0">
										<CardTitle className="text-[#EEEEEE] text-lg md:text-xl font-semibold bg-gradient-to-r from-[#76ABAE] to-[#EEEEEE] bg-clip-text text-transparent flex items-center justify-between">
											<span className="flex items-center">
												<HelpCircle className="mr-2 h-5 w-5 text-[#76ABAE]" />
												Questions
											</span>
											<Button
												size="sm"
												onClick={addQuestion}
												className="bg-gradient-to-r from-[#76ABAE] to-[#76ABAE]/80 hover:from-[#76ABAE]/90 hover:to-[#76ABAE]/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-8 w-8 p-0"
											>
												<Plus className="h-4 w-4" />
											</Button>
										</CardTitle>
									</CardHeader>
									<CardContent className="flex-1 flex flex-col overflow-hidden">
										<div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
											{questions.map((question, index) => (
												<motion.div
													key={index}
													initial={{ opacity: 0, x: -10 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ duration: 0.3, delay: index * 0.1 }}
													className="flex space-x-2"
												>
													<textarea
														placeholder={`Question ${index + 1}...`}
														value={question}
														onChange={(e) =>
															updateQuestion(index, e.target.value)
														}
														className="flex-1 h-16 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 resize-none hover:bg-white/10 transition-all duration-300 focus:border-[#76ABAE] focus:ring-2 focus:ring-[#76ABAE]/20 text-sm"
													/>
													{questions.length > 1 && (
														<Button
															size="sm"
															variant="ghost"
															onClick={() => removeQuestion(index)}
															className="text-red-400 hover:text-red-300 hover:bg-red-400/20 border border-red-400/20 hover:border-red-400/40 transition-all duration-300 h-8 w-8 p-0 flex-shrink-0"
														>
															<Trash2 className="h-3 w-3" />
														</Button>
													)}
												</motion.div>
											))}
											{questions.length === 0 && (
												<div className="text-center py-8">
													<p className="text-[#EEEEEE]/60 mb-4 text-sm">
														No questions added yet
													</p>
													<Button
														onClick={addQuestion}
														size="sm"
														className="bg-gradient-to-r from-[#76ABAE] to-[#76ABAE]/80 hover:from-[#76ABAE]/90 hover:to-[#76ABAE]/70 text-white"
													>
														<Plus className="mr-2 h-3 w-3" />
														Add Question
													</Button>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							</motion.div>

							{/* Answers Section */}
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8, delay: 0.8 }}
								className="lg:col-span-1 flex flex-col"
							>
								<Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500 flex-1 flex flex-col max-h-[calc(100vh-16rem)]">
									<CardHeader className="pb-4 flex-shrink-0">
										<CardTitle className="text-[#EEEEEE] text-lg md:text-xl font-semibold bg-gradient-to-r from-[#76ABAE] to-[#EEEEEE] bg-clip-text text-transparent flex items-center justify-between">
											<span className="flex items-center">
												<FileText className="mr-2 h-5 w-5 text-[#76ABAE]" />
												Answers
											</span>
											{generatedAnswers && (
												<Button
													size="sm"
													variant="ghost"
													onClick={downloadAsText}
													className="text-[#76ABAE] hover:text-[#76ABAE]/80 hover:bg-[#76ABAE]/20 border border-[#76ABAE]/20 hover:border-[#76ABAE]/40 transition-all duration-300 h-8 w-8 p-0"
												>
													<Download className="h-3 w-3" />
												</Button>
											)}
										</CardTitle>
									</CardHeader>
									<CardContent className="flex-1 flex flex-col overflow-hidden">
										{generatedAnswers ? (
											<div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
												{Object.entries(generatedAnswers).map(
													([question, answer], index) => (
														<motion.div
															key={index}
															initial={{ opacity: 0, y: 10 }}
															animate={{ opacity: 1, y: 0 }}
															transition={{ duration: 0.3, delay: index * 0.1 }}
															className="border-b border-white/10 pb-4 last:border-b-0"
														>
															<div className="flex items-start justify-between mb-2">
																<h4 className="text-[#EEEEEE] font-medium text-sm leading-relaxed pr-2">
																	<span className="inline-block bg-gradient-to-r from-[#76ABAE] to-[#76ABAE]/80 text-white text-xs px-2 py-1 rounded-full mr-2 font-medium">
																		Q{index + 1}
																	</span>
																	{question}
																</h4>
																<Button
																	size="sm"
																	variant="ghost"
																	onClick={() => copyToClipboard(answer)}
																	className="text-[#76ABAE] hover:text-[#76ABAE]/80 hover:bg-[#76ABAE]/20 border border-[#76ABAE]/20 hover:border-[#76ABAE]/40 transition-all duration-300 flex-shrink-0 h-6 w-6 p-0"
																>
																	<Copy className="h-3 w-3" />
																</Button>
															</div>
															<div className="p-3 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg backdrop-blur-sm">
																<p className="text-[#EEEEEE]/90 text-sm leading-relaxed">
																	{answer}
																</p>
															</div>
														</motion.div>
													)
												)}
											</div>
										) : (
											<div className="flex-1 flex items-center justify-center">
												<div className="text-center">
													<motion.div
														initial={{ scale: 0.8, opacity: 0 }}
														animate={{ scale: 1, opacity: 1 }}
														transition={{ duration: 0.5 }}
														className="mb-4"
													>
														<Users className="h-12 w-12 text-[#EEEEEE]/30 mx-auto" />
													</motion.div>
													<h3 className="text-[#EEEEEE]/80 text-base font-medium mb-2">
														Ready to Generate?
													</h3>
													<p className="text-[#EEEEEE]/60 text-sm leading-relaxed max-w-xs mx-auto">
														Upload your resume, add questions, and generate
														personalized answers.
													</p>
												</div>
											</div>
										)}
									</CardContent>
								</Card>
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
