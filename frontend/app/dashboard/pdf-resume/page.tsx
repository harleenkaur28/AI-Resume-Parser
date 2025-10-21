"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ResumeData, PdfGenerationRequest } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Download,
	FileText,
	Upload,
	ArrowLeft,
	Settings,
	Eye,
	Briefcase,
	CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import LoadingOverlay from "@/components/pdf-resume/LoadingOverlay";
import PageLoader from "@/components/pdf-resume/PageLoader";
import ResumeSourceSelector from "@/components/pdf-resume/ResumeSourceSelector";
import TailoringForm from "@/components/pdf-resume/TailoringForm";
import ConfigurationForm from "@/components/pdf-resume/ConfigurationForm";
import ResumePreview from "@/components/pdf-resume/ResumePreview";
import LatexOutput from "@/components/pdf-resume/LatexOutput";

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
			const response = await fetch("/api/cold-mail", {
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

			const response = await fetch("/api/tailored-resume", {
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
			<PageLoader isPageLoading={isPageLoading} />
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
												Resume Generator Details
											</CardTitle>
											<p className="text-[#EEEEEE]/60 text-sm">
												Provide your resume and customize the output format
											</p>
										</CardHeader>
										<CardContent className="space-y-6">
											{/* Resume Input Mode Selection */}
											<ResumeSourceSelector
												inputMode={inputMode}
												setInputMode={setInputMode}
												resumeFile={resumeFile}
												handleFileUpload={handleFileUpload}
												userResumes={userResumes}
												selectedResumeId={selectedResumeId}
												handleResumeSelection={handleResumeSelection}
												isLoadingResumes={isLoadingResumes}
											/>

											{/* Tailored Resume Options */}
											<TailoringForm
												useTailoring={useTailoring}
												setUseTailoring={setUseTailoring}
												jobRole={jobRole}
												setJobRole={setJobRole}
												companyName={companyName}
												setCompanyName={setCompanyName}
												companyWebsite={companyWebsite}
												setCompanyWebsite={setCompanyWebsite}
												jobDescription={jobDescription}
												setJobDescription={setJobDescription}
											/>

											{/* Configuration Card */}
											<ConfigurationForm
												selectedTemplate={selectedTemplate}
												setSelectedTemplate={setSelectedTemplate}
												fontSize={fontSize}
												setFontSize={setFontSize}
												colorScheme={colorScheme}
												setColorScheme={setColorScheme}
											/>
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
									{parsedData && <ResumePreview parsedData={parsedData} />}

									{/* LaTeX Output */}
									{showLatex && latexOutput && (
										<LatexOutput
											latexOutput={latexOutput}
											copyLatexToClipboard={copyLatexToClipboard}
											openInOverleaf={openInOverleaf}
										/>
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
