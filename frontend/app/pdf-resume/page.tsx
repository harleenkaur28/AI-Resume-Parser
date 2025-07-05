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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import LoadingOverlay from "@/components/pdf-resume/LoadingOverlay";

const sampleJsonData = {
	name: "John Doe",
	email: "john.doe@example.com",
	contact: "+1 (555) 123-4567",
	predicted_field: "Software Engineer",
	skills_analysis: [
		{ skill_name: "JavaScript", percentage: 90 },
		{ skill_name: "TypeScript", percentage: 85 },
		{ skill_name: "React", percentage: 88 },
		{ skill_name: "Node.js", percentage: 80 },
		{ skill_name: "Python", percentage: 75 },
		{ skill_name: "Docker", percentage: 70 },
	],
	languages: [{ language: "English" }, { language: "Spanish" }],
	education: [
		{
			education_detail:
				"Bachelor of Science in Computer Science, University of Technology (2020-2024)",
		},
	],
	work_experience: [
		{
			role: "Full Stack Developer",
			company_and_duration: "Tech Solutions Inc. (2023-Present)",
			bullet_points: [
				"Developed and maintained 5+ web applications using React and Node.js",
				"Implemented CI/CD pipelines reducing deployment time by 40%",
				"Collaborated with cross-functional teams of 8+ members",
			],
		},
	],
	projects: [
		{
			title: "E-commerce Platform",
			technologies_used: ["React", "Node.js", "MongoDB", "Docker"],
			description:
				"Built a full-stack e-commerce platform with user authentication, payment processing, and inventory management.",
		},
	],
	recommended_roles: [
		"Full Stack Developer",
		"Frontend Developer",
		"Software Engineer",
	],
};

export default function PdfResumePage() {
	const [jsonInput, setJsonInput] = useState("");
	const [parsedData, setParsedData] = useState<ResumeData | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationType, setGenerationType] = useState<"pdf" | "latex">("pdf");
	const [selectedTemplate, setSelectedTemplate] = useState("professional");
	const [fontSize, setFontSize] = useState(10);
	const [colorScheme, setColorScheme] = useState("default");
	const [latexOutput, setLatexOutput] = useState("");
	const [showLatex, setShowLatex] = useState(false);
	const { toast } = useToast();
	const [isPageLoading, setIsPageLoading] = useState(true);

	const loadSampleData = () => {
		const sampleJson = JSON.stringify(sampleJsonData, null, 2);
		setJsonInput(sampleJson);
		setParsedData(sampleJsonData);
		toast({
			title: "Sample Data Loaded",
			description: "Sample resume data has been loaded into the editor.",
		});
	};

	const parseJsonInput = () => {
		try {
			const parsed = JSON.parse(jsonInput);

			// Basic validation
			if (!parsed.name || !parsed.email) {
				throw new Error("Name and email are required fields");
			}

			setParsedData(parsed);
			toast({
				title: "JSON Parsed Successfully",
				description: "Your resume data is ready for processing.",
			});
		} catch (error: any) {
			toast({
				title: "Invalid JSON",
				description: error.message || "Please check your JSON format.",
				variant: "destructive",
			});
			setParsedData(null);
		}
	};

	const generateLatex = async () => {
		if (!parsedData) {
			toast({
				title: "No Data",
				description: "Please paste and parse JSON data first.",
				variant: "destructive",
			});
			return;
		}

		setIsGenerating(true);
		setGenerationType("latex");
		try {
			const request: PdfGenerationRequest = {
				resumeData: parsedData,
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
				description: "LaTeX code has been generated successfully.",
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
		if (!parsedData) {
			toast({
				title: "No Data",
				description: "Please paste and parse JSON data first.",
				variant: "destructive",
			});
			return;
		}

		setIsGenerating(true);
		setGenerationType("pdf");
		try {
			const request: PdfGenerationRequest = {
				resumeData: parsedData,
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
				a.download = `${parsedData.name.replace(/\s/g, "_")}_Resume.pdf`;
				document.body.appendChild(a);
				a.click();
				a.remove();
				window.URL.revokeObjectURL(url);

				toast({
					title: "Success!",
					description: "Your resume PDF has been downloaded.",
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

	// Simulate page load
	useEffect(() => {
		const timer = setTimeout(() => setIsPageLoading(false), 100);
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
									{/* JSON Input Card */}
									<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden">
										<CardHeader className="pb-4">
											<CardTitle className="text-[#EEEEEE] text-xl sm:text-2xl font-semibold flex items-center gap-2">
												<Upload className="h-5 w-5 text-[#76ABAE]" />
												JSON Input
											</CardTitle>
											<p className="text-[#EEEEEE]/60 text-sm">
												Paste your resume data in JSON format
											</p>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="flex gap-2">
												<Button
													onClick={loadSampleData}
													variant="outline"
													size="sm"
													className="bg-white/5 border-white/20 text-[#EEEEEE] hover:bg-white/10 hover:border-[#76ABAE]/50"
												>
													Load Sample Data
												</Button>
												<Button
													onClick={parseJsonInput}
													variant="outline"
													size="sm"
													className="bg-white/5 border-white/20 text-[#EEEEEE] hover:bg-white/10 hover:border-[#76ABAE]/50"
												>
													Parse JSON
												</Button>
											</div>

											<textarea
												value={jsonInput}
												onChange={(e) => setJsonInput(e.target.value)}
												placeholder="Paste your JSON resume data here..."
												className="w-full h-96 p-4 text-sm font-mono bg-black/20 border border-white/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#76ABAE]/50 focus:border-[#76ABAE]/50 text-[#EEEEEE] placeholder-[#EEEEEE]/40"
											/>

											{parsedData && (
												<div className="flex items-center gap-2 text-green-400 bg-green-900/20 rounded-lg px-3 py-2">
													<CheckCircle className="h-4 w-4" />
													<span className="text-sm font-medium">
														JSON parsed successfully
													</span>
												</div>
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
											<motion.div
												whileHover={{ scale: 1.01 }}
												whileTap={{ scale: 0.99 }}
											>
												<Button
													onClick={generateLatex}
													disabled={isGenerating || !parsedData}
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
													disabled={isGenerating || !parsedData}
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
											<CardContent className="space-y-4">
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

												<div className="space-y-3 text-sm">
													{parsedData.education?.length > 0 && (
														<div>
															<h3 className="font-semibold text-[#EEEEEE] mb-2">
																Education
															</h3>
															{parsedData.education.map((edu, index) => (
																<p key={index} className="text-[#EEEEEE]/70">
																	{edu.education_detail}
																</p>
															))}
														</div>
													)}

													{parsedData.skills_analysis?.length > 0 && (
														<div>
															<h3 className="font-semibold text-[#EEEEEE] mb-2">
																Skills
															</h3>
															<div className="flex flex-wrap gap-1">
																{parsedData.skills_analysis
																	.slice(0, 6)
																	.map((skill, index) => (
																		<span
																			key={index}
																			className="px-2 py-1 bg-white/10 text-[#EEEEEE]/80 text-xs rounded border border-white/20"
																		>
																			{skill.skill_name}
																		</span>
																	))}
																{parsedData.skills_analysis.length > 6 && (
																	<span className="px-2 py-1 bg-white/10 text-[#EEEEEE]/80 text-xs rounded border border-white/20">
																		+{parsedData.skills_analysis.length - 6}{" "}
																		more
																	</span>
																)}
															</div>
														</div>
													)}

													{parsedData.work_experience?.length > 0 && (
														<div>
															<h3 className="font-semibold text-[#EEEEEE] mb-2">
																Experience
															</h3>
															{parsedData.work_experience
																.slice(0, 2)
																.map((exp, index) => (
																	<div key={index} className="mb-2">
																		<p className="font-medium text-xs text-[#EEEEEE]">
																			{exp.role} - {exp.company_and_duration}
																		</p>
																	</div>
																))}
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
