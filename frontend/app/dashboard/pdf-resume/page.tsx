"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResumeData, PdfGenerationRequest } from "@/types/resume";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
	Download,
	FileText,
	Upload,
	Copy,
	CheckCircle,
	ArrowLeft,
	Settings,
	Eye,
	Briefcase,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import LoadingOverlay from "@/components/pdf-resume/LoadingOverlay";

interface UserResume {
	id: string;
	customName: string;
	uploadDate: string;
	candidateName?: string;
	predictedField?: string;
}

export default function PdfResumePage() {
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationType, setGenerationType] = useState<"pdf" | "latex">("pdf");
	const [selectedTemplate, setSelectedTemplate] = useState("professional");
	const [fontSize, setFontSize] = useState(10);
	const [colorScheme, setColorScheme] = useState("default");
	const [latexOutput, setLatexOutput] = useState("");
	const [showLatex, setShowLatex] = useState(false);
	const { toast } = useToast();
	const [isPageLoading, setIsPageLoading] = useState(true);

	// Resume selection states
	const [inputMode, setInputMode] = useState<"file" | "resumeId">("file");
	const [resumeFile, setResumeFile] = useState<File | null>(null);
	const [userResumes, setUserResumes] = useState<UserResume[]>([]);
	const [selectedResumeId, setSelectedResumeId] = useState<string>("");
	const [isLoadingResumes, setIsLoadingResumes] = useState(false);
	const [parsedData, setParsedData] = useState<ResumeData | null>(null);

	// Tailored resume fields
	const [jobRole, setJobRole] = useState("");
	const [companyName, setCompanyName] = useState("");
	const [companyWebsite, setCompanyWebsite] = useState("");
	const [jobDescription, setJobDescription] = useState("");
	const [useTailoring, setUseTailoring] = useState(false);

	// Fetch user's resumes on mount
	useEffect(() => {
		fetchUserResumes();
		const timer = setTimeout(() => setIsPageLoading(false), 100);
		return () => clearTimeout(timer);
	}, []);

	const fetchUserResumes = async () => {
		setIsLoadingResumes(true);
		try {
			const response = await fetch("/api/backend-interface/cold-mail", {
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

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setResumeFile(file);
			setInputMode("file");
			toast({
				title: "File Uploaded",
				description: `${file.name} has been selected for processing.`,
			});
		}
	};

	const handleResumeSelection = (resumeId: string) => {
		setSelectedResumeId(resumeId);
		setInputMode("resumeId");
		const selectedResume = userResumes.find((r) => r.id === resumeId);
		if (selectedResume) {
			toast({
				title: "Resume Selected",
				description: `${selectedResume.customName} has been selected.`,
			});
		}
	};

	const getResumeData = async (): Promise<ResumeData | null> => {
		try {
			const formData = new FormData();

			// Add resume source
			if (inputMode === "file" && resumeFile) {
				formData.append("file", resumeFile);
			} else if (inputMode === "resumeId" && selectedResumeId) {
				formData.append("resumeId", selectedResumeId);
			} else {
				throw new Error("Please select a resume or upload a file");
			}

			// Add tailoring parameters if enabled
			if (useTailoring) {
				if (!jobRole.trim()) {
					throw new Error("Job role is required for tailoring");
				}
				formData.append("job_role", jobRole);
				if (companyName) formData.append("company_name", companyName);
				if (companyWebsite) formData.append("company_website", companyWebsite);
				if (jobDescription) formData.append("job_description", jobDescription);
			} else {
				// For non-tailored resumes, we still need to use the backend to get the resume data
				// Use a placeholder job role to satisfy the API requirement
				formData.append("job_role", "General");
			}

			const response = await fetch("/api/backend-interface/tailored-resume", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || "Failed to process resume");
			}

			// Transform backend response to ResumeData format
			const resumeData = result.resume_data || result.data || result;
			setParsedData(resumeData); // Update state for preview
			return resumeData;
		} catch (error: any) {
			toast({
				title: "Processing Failed",
				description: error.message || "Could not process resume",
				variant: "destructive",
			});
			return null;
		}
	};

	const generateLatex = async () => {
		// Validation based on input mode
		if (inputMode === "file" && !resumeFile) {
			toast({
				title: "No File",
				description: "Please upload a resume file.",
				variant: "destructive",
			});
			return;
		}

		if (inputMode === "resumeId" && !selectedResumeId) {
			toast({
				title: "No Resume Selected",
				description: "Please select a resume from your saved resumes.",
				variant: "destructive",
			});
			return;
		}

		setIsGenerating(true);
		setGenerationType("latex");

		try {
			// Get resume data (tailored or not)
			const dataToUse = await getResumeData();

			if (!dataToUse) {
				throw new Error("Failed to get resume data");
			}

			const request: PdfGenerationRequest = {
				resumeData: dataToUse,
				template: selectedTemplate,
				options: {
					fontSize: fontSize,
					colorScheme: colorScheme as any,
					margins: { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 },
				},
			};

			const response = await fetch("/api/generate-latex", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(request),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to generate LaTeX");
			}

			const result = await response.json();
			setLatexOutput(result.latex);
			setShowLatex(true);

			toast({
				title: "LaTeX Generated",
				description: useTailoring
					? "Tailored LaTeX code has been generated successfully."
					: "LaTeX code has been generated successfully.",
			});
		} catch (error: any) {
			toast({
				title: "Generation Failed",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			setIsGenerating(false);
		}
	};

	const downloadPdf = async () => {
		// Validation based on input mode
		if (inputMode === "file" && !resumeFile) {
			toast({
				title: "No File",
				description: "Please upload a resume file.",
				variant: "destructive",
			});
			return;
		}

		if (inputMode === "resumeId" && !selectedResumeId) {
			toast({
				title: "No Resume Selected",
				description: "Please select a resume from your saved resumes.",
				variant: "destructive",
			});
			return;
		}

		setIsGenerating(true);
		setGenerationType("pdf");

		try {
			// Get resume data (tailored or not)
			const dataToUse = await getResumeData();

			if (!dataToUse) {
				throw new Error("Failed to get resume data");
			}

			const request: PdfGenerationRequest = {
				resumeData: dataToUse,
				template: selectedTemplate,
				options: {
					fontSize: fontSize,
					colorScheme: colorScheme as any,
					margins: { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 },
				},
			};

			const response = await fetch("/api/download-resume", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(request),
			});

			if (
				response.ok &&
				response.headers.get("content-type")?.includes("application/pdf")
			) {
				// PDF was generated successfully
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				const fileName = dataToUse.name
					? `${dataToUse.name.replace(/\s/g, "_")}_Resume.pdf`
					: "Resume.pdf";
				a.download = fileName;
				document.body.appendChild(a);
				a.click();
				a.remove();
				window.URL.revokeObjectURL(url);

				toast({
					title: "Success!",
					description: useTailoring
						? "Your tailored resume PDF has been downloaded."
						: "Your resume PDF has been downloaded.",
				});
			} else {
				// Fallback mode - show LaTeX
				const result = await response.json();
				if (result.fallback && result.latex) {
					setLatexOutput(result.latex);
					setShowLatex(true);

					toast({
						title: "PDF Service Unavailable",
						description:
							"LaTeX code generated. You can copy it and compile manually.",
						variant: "destructive",
					});
				} else {
					throw new Error(result.error || "Failed to generate PDF");
				}
			}
		} catch (error: any) {
			toast({
				title: "Download Failed",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			setIsGenerating(false);
		}
	};

	const copyLatexToClipboard = () => {
		if (latexOutput) {
			navigator.clipboard.writeText(latexOutput).then(() => {
				toast({
					title: "Copied!",
					description: "LaTeX code copied to clipboard.",
				});
			});
		}
	};

	const openInOverleaf = () => {
		if (latexOutput) {
			const encodedLatex = encodeURIComponent(latexOutput);
			window.open(
				`https://www.overleaf.com/docs?snip=${encodedLatex}`,
				"_blank"
			);
		}
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
							text="Loading PDF Resume Generator..."
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{!isPageLoading && (
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
					<LoadingOverlay
						isGenerating={isGenerating}
						generationType={generationType}
					/>
					{/* Mobile-optimized container */}
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
						{/* Back button - consistent with cold-mail page */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
							className="mb-6 sm:mb-8"
						>
							<Link href="/">
								<Button
									variant="ghost"
									size="sm"
									className="text-[#EEEEEE] hover:text-[#76ABAE] hover:bg-white/5 transition-all duration-300 p-2 sm:p-3"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									<span className="hidden sm:inline">Back to Home</span>
									<span className="sm:hidden">Back</span>
								</Button>
							</Link>
						</motion.div>

						<div className="max-w-7xl mx-auto">
							{/* Modern header with better mobile typography */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.2 }}
								className="text-center mb-8 sm:mb-12"
							>
								<div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#76ABAE]/10 rounded-2xl mb-4 sm:mb-6">
									<FileText className="h-8 w-8 sm:h-10 sm:w-10 text-[#76ABAE]" />
								</div>
								<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#EEEEEE] mb-3 sm:mb-4 leading-tight">
									PDF Resume Generator
								</h1>
								<p className="text-[#EEEEEE]/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">
									Transform your resume JSON data into a professional PDF or
									LaTeX document with customizable templates.
								</p>
							</motion.div>

							{/* Responsive grid - stack on mobile */}
							<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
								{/* Input Section */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.4 }}
									className="order-1 space-y-6"
								>
									{/* Resume Input Mode Selection */}
									<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden">
										<CardHeader className="pb-4">
											<CardTitle className="text-[#EEEEEE] text-xl sm:text-2xl font-semibold flex items-center gap-2">
												<Upload className="h-5 w-5 text-[#76ABAE]" />
												Resume Source
											</CardTitle>
											<p className="text-[#EEEEEE]/60 text-sm">
												Choose how to provide your resume data
											</p>
										</CardHeader>
										<CardContent className="space-y-4">
											{/* Input Mode Tabs */}
											<div className="flex gap-2 flex-wrap">
												<Button
													onClick={() => setInputMode("file")}
													variant={inputMode === "file" ? "default" : "outline"}
													size="sm"
													className={
														inputMode === "file"
															? "bg-[#76ABAE] text-white hover:bg-[#76ABAE]/90"
															: "bg-white/5 border-white/20 text-[#EEEEEE] hover:bg-white/10"
													}
												>
													Upload File
												</Button>
												<Button
													onClick={() => setInputMode("resumeId")}
													variant={
														inputMode === "resumeId" ? "default" : "outline"
													}
													size="sm"
													className={
														inputMode === "resumeId"
															? "bg-[#76ABAE] text-white hover:bg-[#76ABAE]/90"
															: "bg-white/5 border-white/20 text-[#EEEEEE] hover:bg-white/10"
													}
												>
													Saved Resumes
												</Button>
											</div>

											{/* File Upload Mode */}
											{inputMode === "file" && (
												<div className="space-y-3">
													<Label
														htmlFor="file-upload"
														className="text-[#EEEEEE] text-sm font-medium block"
													>
														Upload Resume File
													</Label>
													<div className="flex items-center gap-2">
														<input
															id="file-upload"
															type="file"
															accept=".pdf,.doc,.docx,.txt"
															onChange={handleFileUpload}
															className="hidden"
														/>
														<Button
															onClick={() =>
																document.getElementById("file-upload")?.click()
															}
															variant="outline"
															size="sm"
															className="bg-white/5 border-white/20 text-[#EEEEEE] hover:bg-white/10 hover:border-[#76ABAE]/50"
														>
															<Upload className="h-4 w-4 mr-2" />
															Choose File
														</Button>
														{resumeFile && (
															<span className="text-sm text-[#EEEEEE]/70">
																{resumeFile.name}
															</span>
														)}
													</div>
													{resumeFile && (
														<div className="flex items-center gap-2 text-green-400 bg-green-900/20 rounded-lg px-3 py-2">
															<CheckCircle className="h-4 w-4" />
															<span className="text-sm font-medium">
																File uploaded successfully
															</span>
														</div>
													)}
												</div>
											)}

											{/* Saved Resumes Mode */}
											{inputMode === "resumeId" && (
												<div className="space-y-3">
													<Label
														htmlFor="resume-select"
														className="text-[#EEEEEE] text-sm font-medium block"
													>
														Select a Saved Resume
													</Label>
													{isLoadingResumes ? (
														<div className="text-[#EEEEEE]/60 text-sm py-4">
															Loading resumes...
														</div>
													) : userResumes.length > 0 ? (
														<Select
															value={selectedResumeId}
															onValueChange={handleResumeSelection}
														>
															<SelectTrigger className="bg-white/5 border-white/20 text-[#EEEEEE] focus:ring-[#76ABAE]/50">
																<SelectValue placeholder="Select a resume" />
															</SelectTrigger>
															<SelectContent className="bg-[#31363F] border-white/20">
																{userResumes.map((resume) => (
																	<SelectItem
																		key={resume.id}
																		value={resume.id}
																		className="text-[#EEEEEE] focus:bg-[#76ABAE]/20"
																	>
																		<div>
																			<div className="font-medium">
																				{resume.customName}
																			</div>
																			{resume.candidateName && (
																				<div className="text-sm text-[#EEEEEE]/60">
																					{resume.candidateName}
																				</div>
																			)}
																		</div>
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													) : (
														<div className="text-[#EEEEEE]/60 text-sm py-4 bg-white/5 rounded-lg px-4">
															No saved resumes found. Please upload a file
															instead.
														</div>
													)}
													{selectedResumeId && (
														<div className="flex items-center gap-2 text-green-400 bg-green-900/20 rounded-lg px-3 py-2">
															<CheckCircle className="h-4 w-4" />
															<span className="text-sm font-medium">
																Resume selected
															</span>
														</div>
													)}
												</div>
											)}
										</CardContent>
									</Card>

									{/* Tailored Resume Options */}
									<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden">
										<CardHeader className="pb-4">
											<CardTitle className="text-[#EEEEEE] text-xl font-semibold flex items-center gap-2">
												<Briefcase className="h-5 w-5 text-[#76ABAE]" />
												Tailor Resume (Optional)
											</CardTitle>
											<p className="text-[#EEEEEE]/60 text-sm">
												Customize your resume for a specific job
											</p>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="flex items-center gap-2">
												<input
													type="checkbox"
													id="use-tailoring"
													checked={useTailoring}
													onChange={(e) => setUseTailoring(e.target.checked)}
													className="w-4 h-4 text-[#76ABAE] bg-white/5 border-white/20 rounded focus:ring-[#76ABAE]"
												/>
												<Label
													htmlFor="use-tailoring"
													className="text-[#EEEEEE] text-sm cursor-pointer"
												>
													Enable resume tailoring for this job
												</Label>
											</div>

											{useTailoring && (
												<>
													<div>
														<Label
															htmlFor="job-role"
															className="text-[#EEEEEE] text-sm font-medium"
														>
															Job Role *
														</Label>
														<input
															id="job-role"
															type="text"
															value={jobRole}
															onChange={(e) => setJobRole(e.target.value)}
															placeholder="e.g., Senior Software Engineer"
															className="mt-1 w-full p-2 text-sm bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#76ABAE]/50 text-[#EEEEEE] placeholder-[#EEEEEE]/40"
														/>
													</div>

													<div>
														<Label
															htmlFor="company-name"
															className="text-[#EEEEEE] text-sm font-medium"
														>
															Company Name (Optional)
														</Label>
														<input
															id="company-name"
															type="text"
															value={companyName}
															onChange={(e) => setCompanyName(e.target.value)}
															placeholder="e.g., Tech Corp"
															className="mt-1 w-full p-2 text-sm bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#76ABAE]/50 text-[#EEEEEE] placeholder-[#EEEEEE]/40"
														/>
													</div>

													<div>
														<Label
															htmlFor="company-website"
															className="text-[#EEEEEE] text-sm font-medium"
														>
															Company Website (Optional)
														</Label>
														<input
															id="company-website"
															type="text"
															value={companyWebsite}
															onChange={(e) =>
																setCompanyWebsite(e.target.value)
															}
															placeholder="e.g., https://techcorp.com"
															className="mt-1 w-full p-2 text-sm bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#76ABAE]/50 text-[#EEEEEE] placeholder-[#EEEEEE]/40"
														/>
													</div>

													<div>
														<Label
															htmlFor="job-description"
															className="text-[#EEEEEE] text-sm font-medium"
														>
															Job Description (Optional)
														</Label>
														<textarea
															id="job-description"
															value={jobDescription}
															onChange={(e) =>
																setJobDescription(e.target.value)
															}
															placeholder="Paste the job description here for better tailoring..."
															className="mt-1 w-full h-32 p-2 text-sm bg-white/5 border border-white/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#76ABAE]/50 text-[#EEEEEE] placeholder-[#EEEEEE]/40"
														/>
													</div>
												</>
											)}
										</CardContent>
									</Card>

									{/* Configuration Card */}
									<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden">
										<CardHeader className="pb-4">
											<CardTitle className="text-[#EEEEEE] text-xl font-semibold flex items-center gap-2">
												<Settings className="h-5 w-5 text-[#76ABAE]" />
												Configuration
											</CardTitle>
											<p className="text-[#EEEEEE]/60 text-sm">
												Customize your resume appearance
											</p>
										</CardHeader>
										<CardContent className="space-y-4">
											{/* Template Selection */}
											<div>
												<Label
													htmlFor="template"
													className="text-[#EEEEEE] text-sm font-medium"
												>
													Template
												</Label>
												<Select
													value={selectedTemplate}
													onValueChange={setSelectedTemplate}
												>
													<SelectTrigger className="mt-1 bg-white/5 border-white/20 text-[#EEEEEE] focus:ring-[#76ABAE]/50 focus:border-[#76ABAE]/50">
														<SelectValue placeholder="Select a template" />
													</SelectTrigger>
													<SelectContent className="bg-[#31363F] border-white/20">
														<SelectItem
															value="professional"
															className="text-[#EEEEEE] focus:bg-[#76ABAE]/20"
														>
															<div>
																<div className="font-medium">Professional</div>
																<div className="text-sm text-[#EEEEEE]/60">
																	Clean, ATS-friendly design
																</div>
															</div>
														</SelectItem>
														<SelectItem
															value="modern"
															className="text-[#EEEEEE] focus:bg-[#76ABAE]/20"
														>
															<div>
																<div className="font-medium">Modern</div>
																<div className="text-sm text-[#EEEEEE]/60">
																	Contemporary with visual elements
																</div>
															</div>
														</SelectItem>
													</SelectContent>
												</Select>
											</div>

											{/* Font Size */}
											<div>
												<Label
													htmlFor="fontSize"
													className="text-[#EEEEEE] text-sm font-medium"
												>
													Font Size: {fontSize}pt
												</Label>
												<input
													type="range"
													min="8"
													max="12"
													step="1"
													value={fontSize}
													onChange={(e) =>
														setFontSize(parseInt(e.target.value))
													}
													className="mt-2 w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
												/>
											</div>

											{/* Color Scheme */}
											<div>
												<Label
													htmlFor="colorScheme"
													className="text-[#EEEEEE] text-sm font-medium"
												>
													Color Scheme
												</Label>
												<Select
													value={colorScheme}
													onValueChange={setColorScheme}
												>
													<SelectTrigger className="mt-1 bg-white/5 border-white/20 text-[#EEEEEE] focus:ring-[#76ABAE]/50 focus:border-[#76ABAE]/50">
														<SelectValue placeholder="Select color scheme" />
													</SelectTrigger>
													<SelectContent className="bg-[#31363F] border-white/20">
														<SelectItem
															value="default"
															className="text-[#EEEEEE] focus:bg-[#76ABAE]/20"
														>
															Default (Gray)
														</SelectItem>
														<SelectItem
															value="blue"
															className="text-[#EEEEEE] focus:bg-[#76ABAE]/20"
														>
															Professional Blue
														</SelectItem>
														<SelectItem
															value="green"
															className="text-[#EEEEEE] focus:bg-[#76ABAE]/20"
														>
															Modern Green
														</SelectItem>
														<SelectItem
															value="red"
															className="text-[#EEEEEE] focus:bg-[#76ABAE]/20"
														>
															Bold Red
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</CardContent>
									</Card>

									{/* Action Buttons */}
									<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden">
										<CardHeader className="pb-4">
											<CardTitle className="text-[#EEEEEE] text-xl font-semibold">
												Generate
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											{/* Preview Button */}
											<motion.div
												whileHover={{ scale: 1.01 }}
												whileTap={{ scale: 0.99 }}
											>
												<Button
													onClick={async () => {
														setIsGenerating(true);
														await getResumeData();
														setIsGenerating(false);
													}}
													disabled={isGenerating}
													variant="outline"
													className="relative w-full h-12 bg-white/5 border-white/20 text-[#EEEEEE] hover:bg-white/10 hover:border-[#76ABAE]/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
												>
													<div className="relative z-10 flex items-center justify-center">
														{isGenerating ? (
															<>
																<Loader
																	variant="spinner"
																	size="sm"
																	className="text-[#EEEEEE] mr-2"
																/>
																<span>Loading Preview...</span>
															</>
														) : (
															<>
																<Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
																Preview Resume
															</>
														)}
													</div>
												</Button>
											</motion.div>

											<motion.div
												whileHover={{ scale: 1.01 }}
												whileTap={{ scale: 0.99 }}
											>
												<Button
													onClick={generateLatex}
													disabled={isGenerating}
													variant="outline"
													className="relative w-full h-12 bg-white/5 border-white/20 text-[#EEEEEE] hover:bg-white/10 hover:border-[#76ABAE]/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
												>
													{/* Animated background for loading state */}
													{isGenerating && generationType === "latex" && (
														<div className="absolute inset-0 bg-gradient-to-r from-[#76ABAE]/20 via-[#76ABAE]/40 to-[#76ABAE]/20 animate-pulse"></div>
													)}

													{/* Button content */}
													<div className="relative z-10 flex items-center justify-center">
														{isGenerating && generationType === "latex" ? (
															<>
																<div className="flex items-center space-x-3">
																	<div className="relative">
																		<Loader
																			variant="spinner"
																			size="sm"
																			className="text-[#EEEEEE]"
																		/>
																		{/* Additional spinning ring */}
																		<div className="absolute inset-0 border-2 border-[#EEEEEE]/20 border-t-[#EEEEEE] rounded-full animate-spin"></div>
																	</div>
																	<div className="flex flex-col items-start">
																		<span className="text-sm font-medium">
																			Generating LaTeX...
																		</span>
																		<span className="text-xs text-[#EEEEEE]/80">
																			Converting your data
																		</span>
																	</div>
																</div>
															</>
														) : (
															<>
																<FileText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
																Generate LaTeX
															</>
														)}
													</div>

													{/* Subtle shine effect on hover */}
													<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

													{/* Progress indicator for loading */}
													{isGenerating && generationType === "latex" && (
														<div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-pulse w-full">
															<div className="h-full bg-[#EEEEEE]/60 animate-pulse"></div>
														</div>
													)}
												</Button>
											</motion.div>

											<motion.div
												whileHover={{ scale: 1.01 }}
												whileTap={{ scale: 0.99 }}
											>
												<Button
													onClick={downloadPdf}
													disabled={isGenerating}
													className="relative w-full h-14 bg-gradient-to-r from-[#76ABAE] to-[#76ABAE]/80 hover:from-[#76ABAE]/90 hover:to-[#76ABAE]/70 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl overflow-hidden group"
												>
													{/* Animated background for loading state */}
													{isGenerating && generationType === "pdf" && (
														<div className="absolute inset-0 bg-gradient-to-r from-[#76ABAE]/20 via-[#76ABAE]/40 to-[#76ABAE]/20 animate-pulse"></div>
													)}

													{/* Button content */}
													<div className="relative z-10 flex items-center justify-center">
														{isGenerating && generationType === "pdf" ? (
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
																			Generating PDF...
																		</span>
																		<span className="text-xs text-white/80">
																			This may take a few moments
																		</span>
																	</div>
																</div>
															</>
														) : (
															<>
																<Download className="mr-3 h-5 w-5 group-hover:translate-y-1 transition-transform duration-300" />
																<span className="text-base">Download PDF</span>
															</>
														)}
													</div>

													{/* Subtle shine effect on hover */}
													<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

													{/* Progress indicator for loading */}
													{isGenerating && generationType === "pdf" && (
														<div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-pulse w-full">
															<div className="h-full bg-white/60 animate-pulse"></div>
														</div>
													)}
												</Button>
											</motion.div>
										</CardContent>
									</Card>
								</motion.div>

								{/* Output Section */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.6 }}
									className="order-2 space-y-6"
								>
									{/* Resume Preview */}
									{parsedData && (
										<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden">
											<CardHeader className="pb-4">
												<CardTitle className="text-[#EEEEEE] text-xl font-semibold flex items-center gap-2">
													<Eye className="h-5 w-5 text-[#76ABAE]" />
													Resume Preview
												</CardTitle>
												<p className="text-[#EEEEEE]/60 text-sm">
													Preview of your resume data
												</p>
											</CardHeader>
											<CardContent className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
												{/* Header */}
												<div className="text-center border-b border-white/10 pb-4">
													<h2 className="text-xl font-bold text-[#EEEEEE]">
														{parsedData.name}
													</h2>
													<p className="text-[#EEEEEE]/70">
														{parsedData.email} • {parsedData.contact}
													</p>
													{parsedData.predicted_field && (
														<span className="inline-block mt-2 px-3 py-1 bg-[#76ABAE]/20 text-[#76ABAE] text-xs rounded-full border border-[#76ABAE]/30">
															{parsedData.predicted_field}
														</span>
													)}
												</div>

												{/* Main content sections */}
												<div className="space-y-4 text-sm">
													{/* Education */}
													{parsedData.education?.length > 0 && (
														<div>
															<h3 className="font-semibold text-[#EEEEEE] mb-2">
																Education
															</h3>
															{parsedData.education.map(
																(edu: any, index: number) => (
																	<div
																		key={index}
																		className="text-[#EEEEEE]/70 mb-2"
																	>
																		{edu.education_detail || edu.degree}
																	</div>
																)
															)}
														</div>
													)}

													{/* Skills */}
													{parsedData.skills_analysis?.length > 0 && (
														<div>
															<h3 className="font-semibold text-[#EEEEEE] mb-2">
																Skills
															</h3>
															<div className="flex flex-wrap gap-2">
																{parsedData.skills_analysis.map(
																	(skill: any, index: number) => (
																		<span
																			key={index}
																			className="px-2 py-1 bg-white/10 text-[#EEEEEE]/80 text-xs rounded border border-white/20"
																		>
																			{skill.skill_name}
																		</span>
																	)
																)}
															</div>
														</div>
													)}

													{/* Languages */}
													{parsedData.languages?.length > 0 && (
														<div>
															<h3 className="font-semibold text-[#EEEEEE] mb-2">
																Languages
															</h3>
															<div className="flex flex-wrap gap-2">
																{parsedData.languages.map(
																	(lang: any, i: number) => (
																		<span
																			key={i}
																			className="px-2 py-1 bg-white/10 text-[#EEEEEE]/80 text-xs rounded border border-white/20"
																		>
																			{lang.language || lang}
																		</span>
																	)
																)}
															</div>
														</div>
													)}

													{/* Work Experience */}
													{parsedData.work_experience?.length > 0 && (
														<div>
															<h3 className="font-semibold text-[#EEEEEE] mb-2">
																Experience
															</h3>
															{parsedData.work_experience.map(
																(exp: any, index: number) => (
																	<div key={index} className="mb-3">
																		<p className="font-medium text-sm text-[#EEEEEE]">
																			{exp.role} -{" "}
																			{exp.company_and_duration || exp.company}
																		</p>
																		{exp.bullet_points && (
																			<ul className="list-disc list-inside text-[#EEEEEE]/70 text-xs mt-1 space-y-1">
																				{exp.bullet_points.map(
																					(bp: string, bi: number) => (
																						<li key={bi}>{bp}</li>
																					)
																				)}
																			</ul>
																		)}
																	</div>
																)
															)}
														</div>
													)}

													{/* Projects */}
													{parsedData.projects?.length > 0 && (
														<div>
															<h3 className="font-semibold text-[#EEEEEE] mb-2">
																Projects
															</h3>
															{parsedData.projects.map(
																(proj: any, i: number) => (
																	<div
																		key={i}
																		className="mb-3 text-[#EEEEEE]/70"
																	>
																		<p className="font-medium text-sm text-[#EEEEEE]">
																			{proj.title || proj.project_name}
																		</p>
																		{proj.technologies_used && (
																			<p className="text-xs mt-1">
																				{Array.isArray(proj.technologies_used)
																					? proj.technologies_used.join(", ")
																					: proj.technologies_used}
																			</p>
																		)}
																		{proj.description && (
																			<p className="text-xs mt-1">
																				{proj.description}
																			</p>
																		)}
																	</div>
																)
															)}
														</div>
													)}

													{/* Publications */}
													{parsedData.publications?.length > 0 && (
														<div>
															<h3 className="font-semibold text-[#EEEEEE] mb-2">
																Publications
															</h3>
															{parsedData.publications.map(
																(pub: any, i: number) => (
																	<div
																		key={i}
																		className="mb-2 text-[#EEEEEE]/70"
																	>
																		<p className="font-medium text-sm text-[#EEEEEE]">
																			{pub.title}
																		</p>
																		<p className="text-xs">
																			{pub.authors} —{" "}
																			{pub.journal_conference || pub.venue} (
																			{pub.year})
																		</p>
																		{pub.doi && (
																			<p className="text-xs">DOI: {pub.doi}</p>
																		)}
																		{pub.url && (
																			<a
																				href={pub.url}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="text-[#76ABAE] text-xs hover:underline"
																			>
																				Link
																			</a>
																		)}
																	</div>
																)
															)}
														</div>
													)}

													{/* Positions of responsibility */}
													{parsedData.positions_of_responsibility?.length >
														0 && (
														<div>
															<h3 className="font-semibold text-[#EEEEEE] mb-2">
																Positions
															</h3>
															{parsedData.positions_of_responsibility.map(
																(pos: any, i: number) => (
																	<div
																		key={i}
																		className="mb-2 text-[#EEEEEE]/70"
																	>
																		<p className="font-medium text-sm text-[#EEEEEE]">
																			{pos.title || pos.role} —{" "}
																			{pos.organization}
																		</p>
																		{pos.duration && (
																			<p className="text-xs">{pos.duration}</p>
																		)}
																		{pos.description && (
																			<p className="text-xs mt-1">
																				{pos.description}
																			</p>
																		)}
																	</div>
																)
															)}
														</div>
													)}

													{/* Certifications */}
													{parsedData.certifications?.length > 0 && (
														<div>
															<h3 className="font-semibold text-[#EEEEEE] mb-2">
																Certifications
															</h3>
															{parsedData.certifications.map(
																(cert: any, i: number) => (
																	<div
																		key={i}
																		className="mb-2 text-[#EEEEEE]/70"
																	>
																		<p className="font-medium text-sm text-[#EEEEEE]">
																			{cert.name}
																		</p>
																		<p className="text-xs">
																			{cert.issuing_organization || cert.issuer}{" "}
																			— {cert.issue_date}
																			{cert.expiry_date
																				? ` to ${cert.expiry_date}`
																				: ""}
																		</p>
																		{cert.credential_id && (
																			<p className="text-xs">
																				ID: {cert.credential_id}
																			</p>
																		)}
																	</div>
																)
															)}
														</div>
													)}

													{/* Achievements */}
													{parsedData.achievements?.length > 0 && (
														<div>
															<h3 className="font-semibold text-[#EEEEEE] mb-2">
																Achievements
															</h3>
															{parsedData.achievements.map(
																(ach: any, i: number) => (
																	<div
																		key={i}
																		className="mb-2 text-[#EEEEEE]/70"
																	>
																		<p className="font-medium text-sm text-[#EEEEEE]">
																			{typeof ach === "string"
																				? ach
																				: ach.title}
																			{ach.year ? ` — ${ach.year}` : ""}
																		</p>
																		{ach.description && (
																			<p className="text-xs">
																				{ach.description}
																			</p>
																		)}
																	</div>
																)
															)}
														</div>
													)}
												</div>
											</CardContent>
										</Card>
									)}

									{/* LaTeX Output */}
									{showLatex && latexOutput && (
										<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden">
											<CardHeader className="pb-4">
												<CardTitle className="text-[#EEEEEE] text-xl font-semibold flex items-center gap-2">
													<FileText className="h-5 w-5 text-[#76ABAE]" />
													LaTeX Output
												</CardTitle>
												<p className="text-[#EEEEEE]/60 text-sm">
													Generated LaTeX code for your resume
												</p>
											</CardHeader>
											<CardContent className="space-y-4">
												<div className="flex gap-2">
													<Button
														onClick={copyLatexToClipboard}
														variant="outline"
														size="sm"
														className="bg-white/5 border-white/20 text-[#EEEEEE] hover:bg-white/10 hover:border-[#76ABAE]/50"
													>
														<Copy className="h-4 w-4 mr-2" />
														Copy LaTeX
													</Button>
													<Button
														onClick={openInOverleaf}
														variant="outline"
														size="sm"
														className="bg-white/5 border-white/20 text-[#EEEEEE] hover:bg-white/10 hover:border-[#76ABAE]/50"
													>
														Open in Overleaf
													</Button>
												</div>

												<textarea
													value={latexOutput}
													readOnly
													className="w-full h-96 p-4 text-xs font-mono bg-black/20 border border-white/20 rounded-lg resize-none focus:outline-none text-[#EEEEEE] placeholder-[#EEEEEE]/40"
												/>

												<div className="text-sm text-[#EEEEEE]/60 bg-white/5 rounded-lg p-4 border border-white/10">
													<p className="font-medium text-[#EEEEEE] mb-2">
														To compile manually:
													</p>
													<ol className="list-decimal list-inside space-y-1">
														<li>Copy the LaTeX code above</li>
														<li>
															Go to{" "}
															<a
																href="https://overleaf.com"
																target="_blank"
																className="text-[#76ABAE] hover:underline"
															>
																Overleaf.com
															</a>
														</li>
														<li>Create a new document and paste the code</li>
														<li>Click "Recompile" to generate your PDF</li>
													</ol>
												</div>
											</CardContent>
										</Card>
									)}
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
