"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Send } from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import ResumeSelection from "@/components/cold-mail/ResumeSelection";
import EmailDetailsForm from "@/components/cold-mail/EmailDetailsForm";
import GeneratedEmailPanel from "@/components/cold-mail/GeneratedEmailPanel";
import LoadingOverlay from "@/components/cold-mail/LoadingOverlay";
import PageLoader from "@/components/cold-mail/PageLoader";

interface ColdMailResponse {
	success: boolean;
	message: string;
	subject: string;
	body: string;
	requestId?: string;
	responseId?: string;
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
	const [customDraft, setCustomDraft] = useState("");
	const [customDraftEdited, setCustomDraftEdited] = useState("");

	// Resume selection states
	const [userResumes, setUserResumes] = useState<UserResume[]>([]);
	const [selectedResumeId, setSelectedResumeId] = useState<string>("");
	const [isLoadingResumes, setIsLoadingResumes] = useState(false);
	const [showResumeDropdown, setShowResumeDropdown] = useState(false);
	const [resumeSelectionMode, setResumeSelectionMode] = useState<
		"existing" | "upload" | "customDraft"
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
		} else if (resumeSelectionMode === "upload") {
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
		} else if (resumeSelectionMode === "customDraft") {
			if (!customDraft.trim()) {
				toast({
					title: "Draft Required",
					description: "Please paste your email draft first.",
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
			} else if (resumeSelectionMode === "upload") {
				formDataToSend.append("file", resumeFile!);
			} else if (resumeSelectionMode === "customDraft") {
				// For custom draft mode, add resume if available
				if (selectedResumeId) {
					formDataToSend.append("resumeId", selectedResumeId);
				} else if (resumeFile) {
					formDataToSend.append("file", resumeFile);
				}
				// Add the custom draft (use enhanced version if available)
				const draftToUse = customDraftEdited || customDraft;
				formDataToSend.append("custom_draft", draftToUse);
				if (editInstructions.trim()) {
					formDataToSend.append("edit_instructions", editInstructions);
				}
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

			// Use different endpoint for custom draft mode
			const endpoint =
				resumeSelectionMode === "customDraft"
					? "/api/cold-mail/edit"
					: "/api/backend-interface/cold-mail";

			const response = await fetch(endpoint, {
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
						resumeSelectionMode === "customDraft"
							? customDraftEdited
								? "Your enhanced draft has been finalized and is ready to use."
								: "Your draft has been enhanced and is ready to use."
							: "Your cold email has been generated and is ready to use.",
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

	const handleCustomDraftEdit = async () => {
		if (!customDraft.trim()) {
			toast({
				title: "Draft Required",
				description: "Please paste your email draft first.",
				variant: "destructive",
			});
			return;
		}

		if (!editInstructions.trim()) {
			toast({
				title: "Instructions Required",
				description: "Please provide enhancement instructions.",
				variant: "destructive",
			});
			return;
		}

		setIsEditing(true);
		try {
			const formDataToSend = new FormData();

			// Add resume data if available
			if (selectedResumeId) {
				formDataToSend.append("resumeId", selectedResumeId);
			} else if (resumeFile) {
				formDataToSend.append("file", resumeFile);
			}

			// Add form data
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

			// Add draft and instructions
			formDataToSend.append("generated_email_subject", "");
			formDataToSend.append("generated_email_body", customDraft);
			formDataToSend.append("edit_inscription", editInstructions);

			const response = await fetch("/api/cold-mail/edit", {
				method: "POST",
				body: formDataToSend,
			});
			const result = await response.json();
			if (result.success) {
				setCustomDraftEdited(result.data.body);
				// Also update generatedEmail so the panel displays the enhanced draft
				setGeneratedEmail({
					subject: result.data.subject || "",
					body: result.data.body,
					requestId: result.data.requestId,
					responseId: result.data.responseId,
				});
				toast({
					title: "Draft Enhanced Successfully!",
					description:
						"Your draft has been enhanced based on your instructions.",
				});
			} else {
				throw new Error(result.message || "Failed to enhance draft");
			}
		} catch (error) {
			toast({
				title: "Enhancement Failed",
				description:
					error instanceof Error
						? error.message
						: "An error occurred while enhancing the draft.",
				variant: "destructive",
			});
		} finally {
			setIsEditing(false);
		}
	};

	return (
		<>
			<PageLoader isPageLoading={isPageLoading} />
			{!isPageLoading && (
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
					<LoadingOverlay isGenerating={isGenerating} isEditing={isEditing} />
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
												customDraft={customDraft}
												setCustomDraft={setCustomDraft}
												editInstructions={editInstructions}
												setEditInstructions={setEditInstructions}
												customDraftEdited={customDraftEdited}
												setCustomDraftEdited={setCustomDraftEdited}
												isEditing={isEditing}
												handleCustomDraftEdit={handleCustomDraftEdit}
												handleInputChange={handleInputChange}
											/>
											<EmailDetailsForm
												formData={formData}
												handleInputChange={handleInputChange}
											/>
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
															: resumeSelectionMode === "upload"
															? !resumeFile && !isPreloaded
															: resumeSelectionMode === "customDraft"
															? !customDraft.trim()
															: true) ||
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
																			{resumeSelectionMode === "customDraft"
																				? customDraftEdited
																					? "Finalizing your enhanced email..."
																					: "Enhancing your draft..."
																				: "Generating your email..."}
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
																	{resumeSelectionMode === "customDraft"
																		? customDraftEdited
																			? "Finalize Enhanced Email"
																			: "Enhance My Draft"
																		: "Generate Cold Email"}
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
									<GeneratedEmailPanel
										generatedEmail={generatedEmail}
										editMode={editMode}
										setEditMode={setEditMode}
										editInstructions={editInstructions}
										setEditInstructions={setEditInstructions}
										isEditing={isEditing}
										editColdMail={editColdMail}
										copyToClipboard={copyToClipboard}
										downloadAsText={downloadAsText}
									/>
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
