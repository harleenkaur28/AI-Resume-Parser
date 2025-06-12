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

			// Show file info instead of trying to read binary files as text
			const fileExtension = file.name.toLowerCase().split(".").pop();
			if (fileExtension === "txt" || fileExtension === "md") {
				// Only preview text files
				const reader = new FileReader();
				reader.onload = (e) => {
					const text = e.target?.result as string;
					setResumeText(text.substring(0, 500) + "..."); // Preview first 500 chars
				};
				reader.readAsText(file);
			} else {
				// For PDF, DOCX files, just show file info
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

			// Convert questions array to JSON string
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
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
					<div className="container mx-auto px-4 py-8">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
							className="mb-8"
						>
							<Link href="/dashboard/seeker">
								<Button
									variant="ghost"
									className="text-[#EEEEEE] hover:text-[#76ABAE] hover:bg-white/5 transition-all duration-300"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Dashboard
								</Button>
							</Link>
						</motion.div>

						<div className="max-w-7xl mx-auto">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.2 }}
								className="text-center mb-8"
							>
								<Users className="h-16 w-16 text-[#76ABAE] mx-auto mb-4" />
								<h1 className="text-4xl md:text-5xl font-bold text-[#EEEEEE] mb-4">
									Hiring Assistant
								</h1>
								<p className="text-[#EEEEEE]/70 text-lg max-w-2xl mx-auto">
									Get AI-powered answers to interview questions tailored to your
									resume, the role, and the company you're applying to.
								</p>
							</motion.div>

							<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
								{/* Input Form */}
								<motion.div
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.8, delay: 0.4 }}
									className="xl:col-span-1"
								>
									<Card className="backdrop-blur-lg bg-white/5 border-white/10">
										<CardHeader>
											<CardTitle className="text-[#EEEEEE] text-xl">
												Interview Setup
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											{/* Resume Upload */}
											<div>
												<Label
													htmlFor="resume"
													className="text-[#EEEEEE] mb-2 block"
												>
													Resume File *
												</Label>
												<Input
													id="resume"
													type="file"
													accept=".pdf,.doc,.docx,.txt,.md"
													onChange={handleFileUpload}
													className="bg-white/5 border-white/20 text-[#EEEEEE] file:bg-[#76ABAE] file:text-white file:border-0"
												/>
												{resumeText && (
													<p className="text-[#EEEEEE]/60 text-xs mt-1">
														Preview: {resumeText}
													</p>
												)}
											</div>

											{/* Role & Company */}
											<div>
												<Label
													htmlFor="role"
													className="text-[#EEEEEE] mb-2 block"
												>
													Role/Position *
												</Label>
												<Input
													id="role"
													placeholder="Software Engineer"
													value={formData.role}
													onChange={(e) =>
														handleInputChange("role", e.target.value)
													}
													className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
												/>
											</div>

											<div>
												<Label
													htmlFor="company"
													className="text-[#EEEEEE] mb-2 block"
												>
													Company Name *
												</Label>
												<Input
													id="company"
													placeholder="Tech Corp Inc."
													value={formData.company}
													onChange={(e) =>
														handleInputChange("company", e.target.value)
													}
													className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
												/>
											</div>

											{/* Word Limit */}
											<div>
												<Label
													htmlFor="word_limit"
													className="text-[#EEEEEE] mb-2 block"
												>
													Answer Word Limit
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
													className="bg-white/5 border-white/20 text-[#EEEEEE]"
												/>
											</div>

											{/* Company Knowledge */}
											<div>
												<Label
													htmlFor="user_company_knowledge"
													className="text-[#EEEEEE] mb-2 block"
												>
													Your Company Knowledge
												</Label>
												<textarea
													id="user_company_knowledge"
													placeholder="What you know about the company, their products, values, etc..."
													value={formData.user_company_knowledge}
													onChange={(e) =>
														handleInputChange(
															"user_company_knowledge",
															e.target.value
														)
													}
													className="w-full h-20 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 resize-none"
												/>
											</div>

											{/* Company URL */}
											<div>
												<Label
													htmlFor="company_url"
													className="text-[#EEEEEE] mb-2 block"
												>
													Company Website (Optional)
												</Label>
												<Input
													id="company_url"
													placeholder="https://company.com"
													value={formData.company_url}
													onChange={(e) =>
														handleInputChange("company_url", e.target.value)
													}
													className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
												/>
											</div>

											<Button
												onClick={generateAnswers}
												disabled={isGenerating}
												className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/80 text-white"
											>
												{isGenerating ? (
													<Loader
														variant="spinner"
														size="sm"
														className="mr-2"
													/>
												) : (
													<Send className="mr-2 h-4 w-4" />
												)}
												{isGenerating ? "Generating..." : "Generate Answers"}
											</Button>
										</CardContent>
									</Card>

									{/* Common Questions Quick Add */}
									<Card className="backdrop-blur-lg bg-white/5 border-white/10 mt-6">
										<CardHeader>
											<CardTitle className="text-[#EEEEEE] text-lg">
												Common Questions
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-1 gap-2">
												{commonQuestions.map((question, index) => (
													<Button
														key={index}
														variant="ghost"
														size="sm"
														onClick={() => addCommonQuestion(question)}
														className="text-left justify-start text-[#EEEEEE]/80 hover:text-[#76ABAE] hover:bg-white/5 text-xs"
													>
														<Plus className="mr-2 h-3 w-3" />
														{question}
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
									className="xl:col-span-1"
								>
									<Card className="backdrop-blur-lg bg-white/5 border-white/10">
										<CardHeader>
											<CardTitle className="text-[#EEEEEE] text-xl flex items-center justify-between">
												Interview Questions
												<Button
													size="sm"
													onClick={addQuestion}
													className="bg-[#76ABAE] hover:bg-[#76ABAE]/80 text-white"
												>
													<Plus className="h-4 w-4" />
												</Button>
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4 max-h-96 overflow-y-auto">
											{questions.map((question, index) => (
												<div key={index} className="flex space-x-2">
													<textarea
														placeholder={`Question ${index + 1}...`}
														value={question}
														onChange={(e) =>
															updateQuestion(index, e.target.value)
														}
														className="flex-1 h-16 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 resize-none"
													/>
													{questions.length > 1 && (
														<Button
															size="sm"
															variant="ghost"
															onClick={() => removeQuestion(index)}
															className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													)}
												</div>
											))}
										</CardContent>
									</Card>
								</motion.div>

								{/* Generated Answers Display */}
								<motion.div
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.8, delay: 0.8 }}
									className="xl:col-span-1"
								>
									<Card className="backdrop-blur-lg bg-white/5 border-white/10">
										<CardHeader>
											<CardTitle className="text-[#EEEEEE] text-xl flex items-center justify-between">
												Generated Answers
												{generatedAnswers && (
													<Button
														size="sm"
														variant="ghost"
														onClick={downloadAsText}
														className="text-[#76ABAE] hover:text-[#76ABAE]/80"
													>
														<Download className="h-4 w-4" />
													</Button>
												)}
											</CardTitle>
										</CardHeader>
										<CardContent>
											{generatedAnswers ? (
												<div className="space-y-6 max-h-96 overflow-y-auto">
													{Object.entries(generatedAnswers).map(
														([question, answer], index) => (
															<div
																key={index}
																className="border-b border-white/10 pb-4 last:border-b-0"
															>
																<div className="flex items-start justify-between mb-2">
																	<h4 className="text-[#EEEEEE] font-semibold text-sm">
																		Q{index + 1}: {question}
																	</h4>
																	<Button
																		size="sm"
																		variant="ghost"
																		onClick={() => copyToClipboard(answer)}
																		className="text-[#76ABAE] hover:text-[#76ABAE]/80 ml-2"
																	>
																		<Copy className="h-3 w-3" />
																	</Button>
																</div>
																<div className="p-3 bg-white/5 border border-white/20 rounded-md">
																	<p className="text-[#EEEEEE]/90 text-sm leading-relaxed">
																		{answer}
																	</p>
																</div>
															</div>
														)
													)}
												</div>
											) : (
												<div className="text-center py-12">
													<Users className="h-16 w-16 text-[#EEEEEE]/30 mx-auto mb-4" />
													<p className="text-[#EEEEEE]/60">
														Fill out the interview setup, add your questions,
														and click "Generate Answers" to see your
														personalized responses here.
													</p>
												</div>
											)}
										</CardContent>
									</Card>
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
