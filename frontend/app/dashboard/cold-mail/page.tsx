"use client";

import { useState, useEffect } from "react";
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
	ChevronDown,
	Calendar,
	User,
	Edit,
	Wand2,
	RefreshCw,
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
	requestId?: string;
	responseId?: string;
}

interface ColdMailEditRequest {
	resume_text?: string;
	resumeId?: string;
	recipient_name: string;
	recipient_designation: string;
	company_name: string;
	sender_name: string;
	sender_role_or_goal: string;
	key_points_to_include: string;
	additional_info_for_llm: string;
	company_url?: string;
	generated_email_subject: string;
	generated_email_body: string;
	edit_inscription: string;
	cold_mail_request_id?: string;
}

interface UserResume {
	id: string;
	customName: string;
	uploadDate: string;
	candidateName?: string;
	predictedField?: string;
}

export default function ColdMailGenerator() {
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [generatedEmail, setGeneratedEmail] = useState<{
		subject: string;
		body: string;
		requestId?: string;
		responseId?: string;
	} | null>(null);
	const [resumeFile, setResumeFile] = useState<File | null>(null);
	const [resumeText, setResumeText] = useState("");
	const [isPreloaded, setIsPreloaded] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [editInstructions, setEditInstructions] = useState("");

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
		recipient_name: "",
		recipient_designation: "",
		company_name: "",
		sender_name: "",
		sender_role_or_goal: "",
		key_points_to_include: "",
		additional_info_for_llm: "",
		company_url: "",
	});

	// Fetch user's resumes
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
					sender_name: analysisData.name || "",
					key_points_to_include: analysisData.skills?.join(", ") || "",
					sender_role_or_goal: analysisData.predicted_field || "",
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

	const handleInputChange = (field: string, value: string) => {
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

	const generateColdMail = async () => {
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
					description:
						"Please re-upload your resume file to generate the email.",
					variant: "destructive",
				});
				return;
			}
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

			// Add resume data based on selection mode
			if (resumeSelectionMode === "existing") {
				formDataToSend.append("resumeId", selectedResumeId);
			} else {
				formDataToSend.append("file", resumeFile!);
			}

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

			const response = await fetch("/api/backend-interface/cold-mail", {
				method: "POST",
				body: formDataToSend,
			});

			const result: ColdMailResponse = await response.json();

			if (result.success) {
				setGeneratedEmail({
					subject: result.subject,
					body: result.body,
					requestId: result.requestId,
					responseId: result.responseId,
				});
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

	// Edit existing cold mail
	const editColdMail = async () => {
		if (!generatedEmail) {
			toast({
				title: "No Email to Edit",
				description: "Please generate an email first before editing.",
				variant: "destructive",
			});
			return;
		}

		if (!editInstructions.trim()) {
			toast({
				title: "Edit Instructions Required",
				description: "Please provide instructions on how to edit the email.",
				variant: "destructive",
			});
			return;
		}

		setIsEditing(true);

		try {
			const formDataToSend = new FormData();

			// Add resume data
			if (resumeSelectionMode === "existing" && selectedResumeId) {
				formDataToSend.append("resumeId", selectedResumeId);
			} else if (resumeFile) {
				formDataToSend.append("file", resumeFile);
			} else if (isPreloaded && !resumeFile) {
				toast({
					title: "Resume File Needed",
					description: "Please re-upload your resume file to edit the email.",
					variant: "destructive",
				});
				setIsEditing(false);
				return;
			}

			// Append other form data
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

			// Append email to be edited and instructions
			formDataToSend.append("generated_email_subject", generatedEmail.subject);
			formDataToSend.append("generated_email_body", generatedEmail.body);
			formDataToSend.append("edit_inscription", editInstructions);

			// Append request ID if it exists
			if (generatedEmail.requestId) {
				formDataToSend.append("cold_mail_request_id", generatedEmail.requestId);
			}

			const response = await fetch("/api/cold-mail/edit", {
				method: "POST",
				body: formDataToSend,
			});

			const result = await response.json();

			if (result.success) {
				setGeneratedEmail({
					subject: result.data.subject,
					body: result.data.body,
					requestId: result.data.requestId,
					responseId: result.data.responseId,
				});
				setEditInstructions(""); // Clear edit instructions
				setEditMode(false); // Exit edit mode
				toast({
					title: "Email Edited Successfully!",
					description:
						"Your cold email has been updated based on your instructions.",
				});
			} else {
				throw new Error(result.message || "Failed to edit email");
			}
		} catch (error) {
			toast({
				title: "Edit Failed",
				description:
					error instanceof Error
						? error.message
						: "An error occurred while editing the email.",
				variant: "destructive",
			});
		} finally {
			setIsEditing(false);
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
							text="Loading Cold Mail Generator..."
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{!isPageLoading && (
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
					{/* Full-screen loading overlay for email generation */}
					<AnimatePresence>
						{(isGenerating || isEditing) && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center"
							>
								<motion.div
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.8, opacity: 0 }}
									className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 text-center max-w-sm mx-4"
								>
									<div className="relative mb-6">
										<Loader
											variant="pulse"
											size="xl"
											className="text-[#76ABAE]"
										/>
									</div>
									<h3 className="text-[#EEEEEE] font-semibold text-xl mb-3">
										{isEditing ? "Editing Your Email" : "Crafting Your Email"}
									</h3>
									<p className="text-[#EEEEEE]/70 text-sm leading-relaxed">
										{isEditing
											? "AI is applying your edits and improving the email..."
											: "AI is analyzing your resume and generating a personalized cold email..."}
									</p>
									<div className="mt-6 flex justify-center space-x-2">
										<div className="w-2 h-2 bg-[#76ABAE] rounded-full animate-pulse"></div>
										<div className="w-2 h-2 bg-[#76ABAE] rounded-full animate-pulse delay-75"></div>
										<div className="w-2 h-2 bg-[#76ABAE] rounded-full animate-pulse delay-150"></div>
									</div>
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>
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
											{/* Resume Selection Mode Toggle */}
											<div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
												<button
													onClick={() => setResumeSelectionMode("existing")}
													className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
														resumeSelectionMode === "existing"
															? "bg-[#76ABAE] text-white shadow-lg"
															: "text-[#EEEEEE]/70 hover:text-[#EEEEEE] hover:bg-white/10"
													}`}
												>
													Use Existing Resume
												</button>
												<button
													onClick={() => setResumeSelectionMode("upload")}
													className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
														resumeSelectionMode === "upload"
															? "bg-[#76ABAE] text-white shadow-lg"
															: "text-[#EEEEEE]/70 hover:text-[#EEEEEE] hover:bg-white/10"
													}`}
												>
													Upload New Resume
												</button>
											</div>

											{/* Resume Selection */}
											{resumeSelectionMode === "existing" ? (
												<div className="space-y-3">
													<Label className="text-[#EEEEEE] text-sm font-medium flex items-center">
														<FileText className="h-4 w-4 mr-2 text-[#76ABAE]" />
														Select Resume *
													</Label>
													<div className="relative">
														<button
															onClick={() =>
																setShowResumeDropdown(!showResumeDropdown)
															}
															className="relative flex items-center justify-between w-full h-12 px-4 border border-white/20 rounded-xl bg-gradient-to-br from-white/5 to-white/10 hover:from-[#76ABAE]/10 hover:to-[#76ABAE]/5 transition-all duration-300 cursor-pointer group"
														>
															<div className="flex items-center space-x-3">
																<FileText className="h-4 w-4 text-[#76ABAE]" />
																<div className="text-left">
																	{selectedResumeId ? (
																		<div>
																			<p className="text-[#EEEEEE] text-sm font-medium">
																				{
																					userResumes.find(
																						(r) => r.id === selectedResumeId
																					)?.customName
																				}
																			</p>
																			<p className="text-[#EEEEEE]/60 text-xs">
																				{userResumes.find(
																					(r) => r.id === selectedResumeId
																				)?.predictedField || "Resume Selected"}
																			</p>
																		</div>
																	) : (
																		<p className="text-[#EEEEEE]/50 text-sm">
																			{isLoadingResumes
																				? "Loading resumes..."
																				: "Choose a resume"}
																		</p>
																	)}
																</div>
															</div>
															<ChevronDown
																className={`h-4 w-4 text-[#EEEEEE]/60 transition-transform duration-200 ${
																	showResumeDropdown ? "rotate-180" : ""
																}`}
															/>
														</button>

														{/* Dropdown */}
														<AnimatePresence>
															{showResumeDropdown && (
																<motion.div
																	initial={{ opacity: 0, y: -10, scale: 0.95 }}
																	animate={{ opacity: 1, y: 0, scale: 1 }}
																	exit={{ opacity: 0, y: -10, scale: 0.95 }}
																	transition={{ duration: 0.2 }}
																	className="absolute top-full mt-2 w-full bg-[#31363F] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
																>
																	{isLoadingResumes ? (
																		<div className="p-4 text-center">
																			<Loader
																				variant="spinner"
																				size="sm"
																				className="text-[#76ABAE]"
																			/>
																		</div>
																	) : userResumes.length > 0 ? (
																		<div className="max-h-64 overflow-y-auto">
																			{userResumes.map((resume) => (
																				<button
																					key={resume.id}
																					onClick={() => {
																						setSelectedResumeId(resume.id);
																						setShowResumeDropdown(false);
																						// Auto-populate sender name if available
																						if (
																							resume.candidateName &&
																							!formData.sender_name
																						) {
																							setFormData((prev) => ({
																								...prev,
																								sender_name:
																									resume.candidateName || "",
																							}));
																						}
																						// Auto-populate role/goal if available
																						if (
																							resume.predictedField &&
																							!formData.sender_role_or_goal
																						) {
																							setFormData((prev) => ({
																								...prev,
																								sender_role_or_goal:
																									resume.predictedField || "",
																							}));
																						}
																					}}
																					className="w-full p-3 text-left hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
																				>
																					<div className="flex items-center space-x-3">
																						<FileText className="h-4 w-4 text-[#76ABAE] flex-shrink-0" />
																						<div className="flex-1 min-w-0">
																							<p className="text-[#EEEEEE] text-sm font-medium truncate">
																								{resume.customName}
																							</p>
																							<div className="flex items-center space-x-2 mt-1">
																								{resume.candidateName && (
																									<div className="flex items-center space-x-1">
																										<User className="h-3 w-3 text-[#EEEEEE]/40" />
																										<span className="text-[#EEEEEE]/60 text-xs">
																											{resume.candidateName}
																										</span>
																									</div>
																								)}
																								{resume.predictedField && (
																									<span className="px-2 py-0.5 bg-[#76ABAE]/20 text-[#76ABAE] text-xs rounded-full">
																										{resume.predictedField}
																									</span>
																								)}
																							</div>
																							<div className="flex items-center space-x-1 mt-1">
																								<Calendar className="h-3 w-3 text-[#EEEEEE]/40" />
																								<span className="text-[#EEEEEE]/40 text-xs">
																									{new Date(
																										resume.uploadDate
																									).toLocaleDateString()}
																								</span>
																							</div>
																						</div>
																					</div>
																				</button>
																			))}
																		</div>
																	) : (
																		<div className="p-4 text-center">
																			<FileText className="h-8 w-8 text-[#EEEEEE]/30 mx-auto mb-2" />
																			<p className="text-[#EEEEEE]/60 text-sm">
																				No resumes found
																			</p>
																			<p className="text-[#EEEEEE]/40 text-xs mt-1">
																				Upload a resume first in the analysis
																				section
																			</p>
																		</div>
																	)}
																</motion.div>
															)}
														</AnimatePresence>
													</div>
												</div>
											) : (
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
															className="relative flex items-center justify-center w-full h-28 border-2 border-dashed border-white/20 rounded-xl bg-gradient-to-br from-white/5 to-white/10 hover:from-[#76ABAE]/10 hover:to-[#76ABAE]/5 transition-all duration-500 cursor-pointer group overflow-hidden"
														>
															{/* Animated background gradient */}
															<div className="absolute inset-0 bg-gradient-to-r from-[#76ABAE]/0 via-[#76ABAE]/5 to-[#76ABAE]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

															<div className="relative z-10 text-center">
																{resumeFile || isPreloaded ? (
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
																			{resumeFile?.name || "Pre-loaded Resume"}
																		</p>
																		<p className="text-[#76ABAE] text-xs font-medium">
																			{isPreloaded
																				? "✓ Pre-loaded from analysis"
																				: "✓ Ready for analysis"}
																		</p>
																		{isPreloaded && (
																			<p className="text-[#EEEEEE]/60 text-xs mt-1">
																				You can upload a new file to replace
																			</p>
																		)}
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
											)}

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
													disabled={
														isGenerating ||
														(resumeSelectionMode === "existing"
															? !selectedResumeId
															: !resumeFile && !isPreloaded) ||
														!formData.recipient_name ||
														!formData.company_name ||
														!formData.sender_name
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
															onClick={() => setEditMode(!editMode)}
															className="text-[#76ABAE] hover:text-[#76ABAE]/80 hover:bg-white/10 rounded-lg p-2"
															title={editMode ? "Cancel edit" : "Edit email"}
														>
															{editMode ? (
																<RefreshCw className="h-4 w-4" />
															) : (
																<Edit className="h-4 w-4" />
															)}
														</Button>
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
													{/* Edit Mode */}
													{editMode && (
														<motion.div
															initial={{ opacity: 0, height: 0 }}
															animate={{ opacity: 1, height: "auto" }}
															exit={{ opacity: 0, height: 0 }}
															className="space-y-4 p-4 bg-[#76ABAE]/10 border border-[#76ABAE]/20 rounded-xl"
														>
															<div className="flex items-center space-x-2 mb-3">
																<Wand2 className="h-4 w-4 text-[#76ABAE]" />
																<Label className="text-[#EEEEEE] text-sm font-semibold">
																	Edit Instructions
																</Label>
															</div>
															<textarea
																placeholder="Describe how you want to modify the email (e.g., 'Make it more formal', 'Add emphasis on Python skills', 'Shorten the content')..."
																value={editInstructions}
																onChange={(e) =>
																	setEditInstructions(e.target.value)
																}
																className="w-full h-24 px-3 py-3 bg-white/5 border border-white/20 rounded-lg text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 resize-none focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
															/>
															<div className="flex space-x-3">
																<Button
																	onClick={editColdMail}
																	disabled={
																		isEditing || !editInstructions.trim()
																	}
																	className="bg-[#76ABAE] hover:bg-[#76ABAE]/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed"
																>
																	{isEditing ? (
																		<>
																			<Loader
																				variant="spinner"
																				size="sm"
																				className="mr-2"
																			/>
																			Editing...
																		</>
																	) : (
																		<>
																			<Wand2 className="mr-2 h-4 w-4" />
																			Apply Changes
																		</>
																	)}
																</Button>
																<Button
																	onClick={() => {
																		setEditMode(false);
																		setEditInstructions("");
																	}}
																	variant="ghost"
																	className="text-[#EEEEEE]/70 hover:text-[#EEEEEE] hover:bg-white/10"
																>
																	Cancel
																</Button>
															</div>
														</motion.div>
													)}

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
