"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	ArrowLeft,
	Mail,
	Send,
	Copy,
	Download,
	Upload,
	CheckCircle,
	FileText,
} from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";

interface ColdMailRequest {
	resume_text: string;
	recipient_name: string;
	recipient_designation: string;
	company_name: string;
	sender_name: string;
	sender_role_or_goal: string;
	key_points_to_include: string;
	additional_info_for_llm: string;
	company_url?: string;
}

interface ColdMailResponse {
	success: boolean;
	message: string;
	subject: string;
	body: string;
}

export default function ColdMailGenerator() {
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedEmail, setGeneratedEmail] = useState<{
		subject: string;
		body: string;
	} | null>(null);
	const [resumeFile, setResumeFile] = useState<File | null>(null);
	const [resumeText, setResumeText] = useState("");
	const { toast } = useToast();

	const [formData, setFormData] = useState({
		recipient_name: "",
		recipient_designation: "",
		company_name: "",
		sender_name: "",
		sender_role_or_goal: "",
		key_points_to_include: "",
		additional_info_for_llm: "",
		company_url: "",
	});

	// Simulate page load
	useState(() => {
		const timer = setTimeout(() => setIsPageLoading(false), 800);
		return () => clearTimeout(timer);
	});

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

	const generateColdMail = async () => {
		if (!resumeFile) {
			toast({
				title: "Resume Required",
				description: "Please upload your resume first.",
				variant: "destructive",
			});
			return;
		}

		if (
			!formData.recipient_name ||
			!formData.company_name ||
			!formData.sender_name
		) {
			toast({
				title: "Required Fields Missing",
				description:
					"Please fill in recipient name, company name, and your name.",
				variant: "destructive",
			});
			return;
		}

		setIsGenerating(true);

		try {
			const formDataToSend = new FormData();
			formDataToSend.append("file", resumeFile);
			formDataToSend.append("recipient_name", formData.recipient_name);
			formDataToSend.append(
				"recipient_designation",
				formData.recipient_designation
			);
			formDataToSend.append("company_name", formData.company_name);
			formDataToSend.append("sender_name", formData.sender_name);
			formDataToSend.append(
				"sender_role_or_goal",
				formData.sender_role_or_goal
			);
			formDataToSend.append(
				"key_points_to_include",
				formData.key_points_to_include
			);
			formDataToSend.append(
				"additional_info_for_llm",
				formData.additional_info_for_llm
			);
			if (formData.company_url) {
				formDataToSend.append("company_url", formData.company_url);
			}

			const response = await fetch(
				"http://localhost:8000/cold-mail-generator/",
				{
					method: "POST",
					body: formDataToSend,
				}
			);

			const result: ColdMailResponse = await response.json();

			if (result.success) {
				setGeneratedEmail({ subject: result.subject, body: result.body });
				toast({
					title: "Email Generated Successfully!",
					description:
						"Your cold email has been generated and is ready to use.",
				});
			} else {
				throw new Error(result.message || "Failed to generate email");
			}
		} catch (error) {
			toast({
				title: "Generation Failed",
				description:
					error instanceof Error
						? error.message
						: "An error occurred while generating the email.",
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
				description: "Email content copied to clipboard.",
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
		if (!generatedEmail) return;

		const content = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "cold-email.txt";
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
							text="Loading Cold Mail Generator..."
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{!isPageLoading && (
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
					{/* Mobile-optimized container */}
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
						{/* Back button - better mobile positioning */}
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
							{/* Modern header with better mobile typography */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.2 }}
								className="text-center mb-8 sm:mb-12"
							>
								<div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#76ABAE]/10 rounded-2xl mb-4 sm:mb-6">
									<Mail className="h-8 w-8 sm:h-10 sm:w-10 text-[#76ABAE]" />
								</div>
								<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#EEEEEE] mb-3 sm:mb-4 leading-tight">
									Cold Mail Generator
								</h1>
								<p className="text-[#EEEEEE]/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">
									Generate personalized cold emails using AI to connect with
									potential employers and networking contacts.
								</p>
							</motion.div>

							{/* Responsive grid - stack on mobile */}
							<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
								{/* Input Form - Modern design */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.4 }}
									className="order-1"
								>
									<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden">
										{/* Loading overlay */}
										<AnimatePresence>
											{isGenerating && (
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
													className="absolute inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
												>
													<motion.div
														initial={{ scale: 0.8, opacity: 0 }}
														animate={{ scale: 1, opacity: 1 }}
														exit={{ scale: 0.8, opacity: 0 }}
														className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center"
													>
														<div className="relative mb-4">
															<Loader
																variant="pulse"
																size="lg"
																className="text-[#76ABAE]"
															/>
														</div>
														<h3 className="text-[#EEEEEE] font-semibold text-lg mb-2">
															Crafting Your Email
														</h3>
														<p className="text-[#EEEEEE]/70 text-sm max-w-xs">
															AI is analyzing your resume and generating a
															personalized cold email...
														</p>
														<div className="mt-4 flex justify-center space-x-1">
															<div className="w-2 h-2 bg-[#76ABAE] rounded-full animate-pulse"></div>
															<div className="w-2 h-2 bg-[#76ABAE] rounded-full animate-pulse delay-75"></div>
															<div className="w-2 h-2 bg-[#76ABAE] rounded-full animate-pulse delay-150"></div>
														</div>
													</motion.div>
												</motion.div>
											)}
										</AnimatePresence>
										<CardHeader className="pb-4">
											<CardTitle className="text-[#EEEEEE] text-xl sm:text-2xl font-semibold">
												Email Details
											</CardTitle>
											<p className="text-[#EEEEEE]/60 text-sm">
												Fill in the details to generate your personalized cold
												email
											</p>
										</CardHeader>
										<CardContent className="space-y-6">
											{/* Ultra-modern file upload with drag & drop */}
											<div className="space-y-3">
												<Label
													htmlFor="resume"
													className="text-[#EEEEEE] text-sm font-medium flex items-center"
												>
													<FileText className="h-4 w-4 mr-2 text-[#76ABAE]" />
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
														className="relative flex items-center justify-center w-full h-32 sm:h-36 border-2 border-dashed border-white/20 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 hover:from-[#76ABAE]/10 hover:to-[#76ABAE]/5 transition-all duration-500 cursor-pointer group overflow-hidden"
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
																	<div className="relative mb-3">
																		<div className="absolute inset-0 bg-[#76ABAE]/20 rounded-full blur-lg"></div>
																		<CheckCircle className="relative h-8 w-8 text-[#76ABAE]" />
																	</div>
																	<p className="text-[#EEEEEE] text-sm font-medium mb-1 max-w-48 truncate">
																		{resumeFile.name}
																	</p>
																	<p className="text-[#76ABAE] text-xs font-medium">
																		✓ File uploaded successfully
																	</p>
																	<p className="text-[#EEEEEE]/50 text-xs mt-1">
																		Click to change file
																	</p>
																</motion.div>
															) : (
																<motion.div
																	className="flex flex-col items-center"
																	whileHover={{ y: -2 }}
																	transition={{ duration: 0.2 }}
																>
																	<div className="relative mb-3">
																		<div className="absolute inset-0 bg-[#76ABAE]/10 rounded-full blur-lg group-hover:bg-[#76ABAE]/20 transition-colors duration-500"></div>
																		<Upload className="relative h-8 w-8 text-[#EEEEEE]/60 group-hover:text-[#76ABAE] transition-colors duration-300" />
																	</div>
																	<p className="text-[#EEEEEE] text-base font-medium mb-1">
																		Drop your resume here
																	</p>
																	<p className="text-[#EEEEEE]/60 text-sm mb-2">
																		or click to browse
																	</p>
																	<div className="flex items-center space-x-2 text-xs text-[#EEEEEE]/50">
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

														{/* Animated border effect */}
														<div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-[#76ABAE]/0 via-[#76ABAE]/50 to-[#76ABAE]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
													</motion.label>
												</div>
												{resumeText && (
													<motion.div
														initial={{ opacity: 0, height: 0 }}
														animate={{ opacity: 1, height: "auto" }}
														transition={{ duration: 0.3 }}
														className="p-4 bg-gradient-to-r from-[#76ABAE]/10 to-white/5 border border-[#76ABAE]/20 rounded-xl backdrop-blur-sm"
													>
														<div className="flex items-start space-x-3">
															<FileText className="h-4 w-4 text-[#76ABAE] mt-0.5 flex-shrink-0" />
															<div>
																<p className="text-[#EEEEEE]/90 text-sm font-medium mb-1">
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

											{/* Form sections with better spacing */}
											<div className="space-y-6">
												{/* Recipient Section */}
												<div className="space-y-4">
													<h3 className="text-[#EEEEEE] font-medium text-base border-b border-white/10 pb-2">
														Recipient Information
													</h3>
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label className="text-[#EEEEEE] text-sm font-medium">
																Recipient Name *
															</Label>
															<Input
																placeholder="John Doe"
																value={formData.recipient_name}
																onChange={(e) =>
																	handleInputChange(
																		"recipient_name",
																		e.target.value
																	)
																}
																className="h-11 bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
															/>
														</div>
														<div className="space-y-2">
															<Label className="text-[#EEEEEE] text-sm font-medium">
																Position
															</Label>
															<Input
																placeholder="HR Manager"
																value={formData.recipient_designation}
																onChange={(e) =>
																	handleInputChange(
																		"recipient_designation",
																		e.target.value
																	)
																}
																className="h-11 bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
															/>
														</div>
													</div>
												</div>

												{/* Company & Sender Section */}
												<div className="space-y-4">
													<h3 className="text-[#EEEEEE] font-medium text-base border-b border-white/10 pb-2">
														Company & Personal Details
													</h3>
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label className="text-[#EEEEEE] text-sm font-medium">
																Company Name *
															</Label>
															<Input
																placeholder="Tech Corp Inc."
																value={formData.company_name}
																onChange={(e) =>
																	handleInputChange(
																		"company_name",
																		e.target.value
																	)
																}
																className="h-11 bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
															/>
														</div>
														<div className="space-y-2">
															<Label className="text-[#EEEEEE] text-sm font-medium">
																Your Name *
															</Label>
															<Input
																placeholder="Jane Smith"
																value={formData.sender_name}
																onChange={(e) =>
																	handleInputChange(
																		"sender_name",
																		e.target.value
																	)
																}
																className="h-11 bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
															/>
														</div>
													</div>

													<div className="space-y-2">
														<Label className="text-[#EEEEEE] text-sm font-medium">
															Your Goal/Desired Role
														</Label>
														<Input
															placeholder="Software Engineer Internship"
															value={formData.sender_role_or_goal}
															onChange={(e) =>
																handleInputChange(
																	"sender_role_or_goal",
																	e.target.value
																)
															}
															className="h-11 bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
														/>
													</div>

													<div className="space-y-2">
														<Label className="text-[#EEEEEE] text-sm font-medium">
															Company Website (Optional)
														</Label>
														<Input
															placeholder="https://company.com"
															value={formData.company_url}
															onChange={(e) =>
																handleInputChange("company_url", e.target.value)
															}
															className="h-11 bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
														/>
													</div>
												</div>

												{/* Content Section */}
												<div className="space-y-4">
													<h3 className="text-[#EEEEEE] font-medium text-base border-b border-white/10 pb-2">
														Email Content
													</h3>

													<div className="space-y-2">
														<Label className="text-[#EEEEEE] text-sm font-medium">
															Key Points to Highlight
														</Label>
														<textarea
															placeholder="Previous internship experience, relevant projects, specific skills..."
															value={formData.key_points_to_include}
															onChange={(e) =>
																handleInputChange(
																	"key_points_to_include",
																	e.target.value
																)
															}
															className="w-full h-24 px-3 py-3 bg-white/5 border border-white/20 rounded-lg text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 resize-none focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
														/>
													</div>

													<div className="space-y-2">
														<Label className="text-[#EEEEEE] text-sm font-medium">
															Additional Context
														</Label>
														<textarea
															placeholder="Any specific requirements or context for the email..."
															value={formData.additional_info_for_llm}
															onChange={(e) =>
																handleInputChange(
																	"additional_info_for_llm",
																	e.target.value
																)
															}
															className="w-full h-24 px-3 py-3 bg-white/5 border border-white/20 rounded-lg text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 resize-none focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
														/>
													</div>
												</div>
											</div>

											{/* Enhanced generate button with advanced loader */}
											<motion.div
												whileHover={{ scale: 1.01 }}
												whileTap={{ scale: 0.99 }}
											>
												<Button
													onClick={generateColdMail}
													disabled={isGenerating}
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
																			Generating your email...
																		</span>
																		<span className="text-xs text-white/80">
																			This may take a few moments
																		</span>
																	</div>
																</div>
															</>
														) : (
															<>
																<Send className="mr-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
																<span className="text-base">
																	Generate Cold Email
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
								</motion.div>

								{/* Generated Email Display - Modern design */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.6 }}
									className="order-2"
								>
									<Card className="backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl h-fit sticky top-4">
										<CardHeader className="pb-4">
											<div className="flex items-center justify-between">
												<div>
													<CardTitle className="text-[#EEEEEE] text-xl sm:text-2xl font-semibold flex items-center">
														<FileText className="mr-2 h-5 w-5 text-[#76ABAE]" />
														Generated Email
													</CardTitle>
													<p className="text-[#EEEEEE]/60 text-sm mt-1">
														Your personalized cold email will appear here
													</p>
												</div>
												{generatedEmail && (
													<div className="flex space-x-2">
														<Button
															size="sm"
															variant="ghost"
															onClick={() =>
																copyToClipboard(
																	`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`
																)
															}
															className="text-[#76ABAE] hover:text-[#76ABAE]/80 hover:bg-white/10 rounded-lg p-2"
															title="Copy to clipboard"
														>
															<Copy className="h-4 w-4" />
														</Button>
														<Button
															size="sm"
															variant="ghost"
															onClick={downloadAsText}
															className="text-[#76ABAE] hover:text-[#76ABAE]/80 hover:bg-white/10 rounded-lg p-2"
															title="Download as text"
														>
															<Download className="h-4 w-4" />
														</Button>
													</div>
												)}
											</div>
										</CardHeader>
										<CardContent>
											{generatedEmail ? (
												<div className="space-y-6">
													<div className="space-y-3">
														<Label className="text-[#EEEEEE] text-sm font-semibold">
															Subject Line:
														</Label>
														<div className="p-4 bg-white/5 border border-white/20 rounded-xl">
															<p className="text-[#EEEEEE] font-medium">
																{generatedEmail.subject}
															</p>
														</div>
													</div>
													<div className="space-y-3">
														<Label className="text-[#EEEEEE] text-sm font-semibold">
															Email Body:
														</Label>
														<div className="p-4 bg-white/5 border border-white/20 rounded-xl max-h-[500px] overflow-y-auto">
															<pre className="text-[#EEEEEE] whitespace-pre-wrap font-sans text-sm leading-relaxed">
																{generatedEmail.body}
															</pre>
														</div>
													</div>
												</div>
											) : (
												<div className="text-center py-16">
													<div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-2xl mb-4">
														<Mail className="h-8 w-8 text-[#EEEEEE]/30" />
													</div>
													<p className="text-[#EEEEEE]/60 text-base max-w-sm mx-auto leading-relaxed">
														Fill out the form and click "Generate Cold Email" to
														see your personalized email here.
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
