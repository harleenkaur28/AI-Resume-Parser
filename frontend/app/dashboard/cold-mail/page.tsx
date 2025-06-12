"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Send, Copy, Download } from "lucide-react";
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

						<div className="max-w-6xl mx-auto">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.2 }}
								className="text-center mb-8"
							>
								<Mail className="h-16 w-16 text-[#76ABAE] mx-auto mb-4" />
								<h1 className="text-4xl md:text-5xl font-bold text-[#EEEEEE] mb-4">
									Cold Mail Generator
								</h1>
								<p className="text-[#EEEEEE]/70 text-lg max-w-2xl mx-auto">
									Generate personalized cold emails using AI to connect with
									potential employers and networking contacts.
								</p>
							</motion.div>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
								{/* Input Form */}
								<motion.div
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.8, delay: 0.4 }}
								>
									<Card className="backdrop-blur-lg bg-white/5 border-white/10">
										<CardHeader>
											<CardTitle className="text-[#EEEEEE] text-xl">
												Email Details
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

											{/* Recipient Details */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<Label
														htmlFor="recipient_name"
														className="text-[#EEEEEE] mb-2 block"
													>
														Recipient Name *
													</Label>
													<Input
														id="recipient_name"
														placeholder="John Doe"
														value={formData.recipient_name}
														onChange={(e) =>
															handleInputChange(
																"recipient_name",
																e.target.value
															)
														}
														className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
													/>
												</div>
												<div>
													<Label
														htmlFor="recipient_designation"
														className="text-[#EEEEEE] mb-2 block"
													>
														Recipient Position
													</Label>
													<Input
														id="recipient_designation"
														placeholder="HR Manager"
														value={formData.recipient_designation}
														onChange={(e) =>
															handleInputChange(
																"recipient_designation",
																e.target.value
															)
														}
														className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
													/>
												</div>
											</div>

											{/* Company & Sender Details */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div>
													<Label
														htmlFor="company_name"
														className="text-[#EEEEEE] mb-2 block"
													>
														Company Name *
													</Label>
													<Input
														id="company_name"
														placeholder="Tech Corp Inc."
														value={formData.company_name}
														onChange={(e) =>
															handleInputChange("company_name", e.target.value)
														}
														className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
													/>
												</div>
												<div>
													<Label
														htmlFor="sender_name"
														className="text-[#EEEEEE] mb-2 block"
													>
														Your Name *
													</Label>
													<Input
														id="sender_name"
														placeholder="Jane Smith"
														value={formData.sender_name}
														onChange={(e) =>
															handleInputChange("sender_name", e.target.value)
														}
														className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
													/>
												</div>
											</div>

											{/* Role & Goal */}
											<div>
												<Label
													htmlFor="sender_role_or_goal"
													className="text-[#EEEEEE] mb-2 block"
												>
													Your Goal/Desired Role
												</Label>
												<Input
													id="sender_role_or_goal"
													placeholder="Software Engineer Internship"
													value={formData.sender_role_or_goal}
													onChange={(e) =>
														handleInputChange(
															"sender_role_or_goal",
															e.target.value
														)
													}
													className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
												/>
											</div>

											{/* Key Points */}
											<div>
												<Label
													htmlFor="key_points_to_include"
													className="text-[#EEEEEE] mb-2 block"
												>
													Key Points to Highlight
												</Label>
												<textarea
													id="key_points_to_include"
													placeholder="Previous internship experience, relevant projects, specific skills..."
													value={formData.key_points_to_include}
													onChange={(e) =>
														handleInputChange(
															"key_points_to_include",
															e.target.value
														)
													}
													className="w-full h-20 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 resize-none"
												/>
											</div>

											{/* Additional Info */}
											<div>
												<Label
													htmlFor="additional_info_for_llm"
													className="text-[#EEEEEE] mb-2 block"
												>
													Additional Context
												</Label>
												<textarea
													id="additional_info_for_llm"
													placeholder="Any specific requirements or context for the email..."
													value={formData.additional_info_for_llm}
													onChange={(e) =>
														handleInputChange(
															"additional_info_for_llm",
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
												onClick={generateColdMail}
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
												{isGenerating ? "Generating..." : "Generate Cold Email"}
											</Button>
										</CardContent>
									</Card>
								</motion.div>

								{/* Generated Email Display */}
								<motion.div
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.8, delay: 0.6 }}
								>
									<Card className="backdrop-blur-lg bg-white/5 border-white/10">
										<CardHeader>
											<CardTitle className="text-[#EEEEEE] text-xl flex items-center justify-between">
												Generated Email
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
															className="text-[#76ABAE] hover:text-[#76ABAE]/80"
														>
															<Copy className="h-4 w-4" />
														</Button>
														<Button
															size="sm"
															variant="ghost"
															onClick={downloadAsText}
															className="text-[#76ABAE] hover:text-[#76ABAE]/80"
														>
															<Download className="h-4 w-4" />
														</Button>
													</div>
												)}
											</CardTitle>
										</CardHeader>
										<CardContent>
											{generatedEmail ? (
												<div className="space-y-4">
													<div>
														<Label className="text-[#EEEEEE] mb-2 block font-semibold">
															Subject:
														</Label>
														<div className="p-3 bg-white/5 border border-white/20 rounded-md">
															<p className="text-[#EEEEEE]">
																{generatedEmail.subject}
															</p>
														</div>
													</div>
													<div>
														<Label className="text-[#EEEEEE] mb-2 block font-semibold">
															Email Body:
														</Label>
														<div className="p-3 bg-white/5 border border-white/20 rounded-md max-h-96 overflow-y-auto">
															<pre className="text-[#EEEEEE] whitespace-pre-wrap font-sans">
																{generatedEmail.body}
															</pre>
														</div>
													</div>
												</div>
											) : (
												<div className="text-center py-12">
													<Mail className="h-16 w-16 text-[#EEEEEE]/30 mx-auto mb-4" />
													<p className="text-[#EEEEEE]/60">
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
