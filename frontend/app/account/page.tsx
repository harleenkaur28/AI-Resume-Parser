"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { AvatarUpload } from "@/components/avatar-upload";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ArrowLeft,
	User,
	Mail,
	Calendar,
	LogOut,
	Shield,
	Upload,
	Key,
	CheckCircle,
	AlertCircle,
	Trash2,
	AlertTriangle,
	X,
} from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function AccountPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [isResettingPassword, setIsResettingPassword] = useState(false);
	const [resetMessage, setResetMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteConfirmation, setDeleteConfirmation] = useState("");

	// Check if user is using email authentication (not OAuth)
	const isEmailUser =
		session?.user?.email &&
		!session.user?.image?.includes("googleusercontent.com") &&
		!session.user?.image?.includes("github.com") &&
		!session.user?.image?.includes("avatars.githubusercontent.com");

	// Redirect if not authenticated
	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth");
		}
	}, [status, router]);

	// Simulate page load
	useEffect(() => {
		const timer = setTimeout(() => setIsPageLoading(false), 100);
		return () => clearTimeout(timer);
	}, []);

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/" });
	};

	const handlePasswordReset = async () => {
		if (!session?.user?.email) {
			setResetMessage({
				type: "error",
				text: "No email address found for this account.",
			});
			return;
		}

		setIsResettingPassword(true);
		setResetMessage(null);

		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: session.user.email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to send reset email");
			}

			setResetMessage({
				type: "success",
				text: "Password reset link has been sent to your email address. Please check your inbox.",
			});
		} catch (error: any) {
			setResetMessage({
				type: "error",
				text:
					error.message ||
					"Failed to send password reset email. Please try again.",
			});
		} finally {
			setIsResettingPassword(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (deleteConfirmation !== "DELETE") {
			setResetMessage({
				type: "error",
				text: "Please type 'DELETE' to confirm account deletion.",
			});
			return;
		}

		setIsDeleting(true);
		setResetMessage(null);

		try {
			const response = await fetch("/api/auth/delete-account", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to delete account");
			}

			// Sign out and redirect to home page
			await signOut({ callbackUrl: "/" });
		} catch (error: any) {
			setResetMessage({
				type: "error",
				text: error.message || "Failed to delete account. Please try again.",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center min-h-screen text-white bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
				Loading...
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex items-center justify-center min-h-screen text-white bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
				Redirecting to login...
			</div>
		);
	}

	return (
		<>
			<AnimatePresence>
				{isPageLoading && (
					<motion.div
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] flex items-center justify-center z-50"
					>
						<Loader variant="pulse" size="xl" text="Loading your account..." />
					</motion.div>
				)}
			</AnimatePresence>

			{!isPageLoading && (
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] py-8">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className="absolute top-4 left-4"
					>
						<Link href="/dashboard">
							<Button
								variant="ghost"
								className="text-[#EEEEEE] hover:text-[#76ABAE]"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Dashboard
							</Button>
						</Link>
					</motion.div>

					<div className="container mx-auto px-4 pt-16">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="max-w-2xl mx-auto"
						>
							<div className="text-center mb-8">
								<h1 className="text-3xl font-bold text-[#EEEEEE] mb-2">
									My Account
								</h1>
								<p className="text-[#EEEEEE]/60">
									Manage your account settings and preferences
								</p>
							</div>

							<div className="space-y-6">
								{/* Profile Information */}
								<Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
									<CardHeader>
										<CardTitle className="text-[#EEEEEE] flex items-center gap-2">
											<User className="h-5 w-5" />
											Profile Information
										</CardTitle>
										<CardDescription className="text-[#EEEEEE]/60">
											Your basic account information
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										{/* Avatar Upload - only show for email users */}
										{isEmailUser ? (
											<AvatarUpload
												currentAvatar={avatarUrl || session.user?.image}
												onAvatarUpdate={(newUrl) => setAvatarUrl(newUrl)}
											/>
										) : (
											<div className="flex items-center space-x-4">
												<Avatar
													src={session.user?.image}
													alt="Profile"
													size="lg"
												/>
												<div className="flex-1">
													<p className="text-[#EEEEEE] font-medium mb-1">
														Profile Picture
													</p>
													<p className="text-[#EEEEEE]/60 text-sm">
														Managed by your{" "}
														{session.user?.image?.includes(
															"googleusercontent.com"
														)
															? "Google"
															: "GitHub"}{" "}
														account
													</p>
												</div>
											</div>
										)}

										<div className="space-y-2">
											<div className="flex items-center space-x-2">
												<User className="h-4 w-4 text-[#76ABAE]" />
												<span className="text-[#EEEEEE]/80 text-sm">Name:</span>
												<span className="text-[#EEEEEE] font-medium">
													{session.user?.name || "Not provided"}
												</span>
											</div>
											<div className="flex items-center space-x-2">
												<Mail className="h-4 w-4 text-[#76ABAE]" />
												<span className="text-[#EEEEEE]/80 text-sm">
													Email:
												</span>
												<span className="text-[#EEEEEE] font-medium">
													{session.user?.email || "Not provided"}
												</span>
											</div>
											<div className="flex items-center space-x-2">
												<Shield className="h-4 w-4 text-[#76ABAE]" />
												<span className="text-[#EEEEEE]/80 text-sm">Role:</span>
												<span className="text-[#EEEEEE] font-medium">
													{(session.user as any)?.role === "Admin"
														? "Recruiter"
														: (session.user as any)?.role || "Not assigned"}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Account Security */}
								<Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
									<CardHeader>
										<CardTitle className="text-[#EEEEEE] flex items-center gap-2">
											<Shield className="h-5 w-5" />
											Account Security
										</CardTitle>
										<CardDescription className="text-[#EEEEEE]/60">
											Manage your account security settings
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										{resetMessage && (
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												className={`p-3 rounded-lg text-sm flex items-center space-x-2 ${
													resetMessage.type === "success"
														? "bg-green-500/20 border border-green-500/30 text-green-200"
														: "bg-red-500/20 border border-red-500/30 text-red-200"
												}`}
											>
												{resetMessage.type === "success" ? (
													<CheckCircle className="h-4 w-4 flex-shrink-0" />
												) : (
													<AlertCircle className="h-4 w-4 flex-shrink-0" />
												)}
												<span>{resetMessage.text}</span>
											</motion.div>
										)}

										<div className="space-y-3">
											<div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
												<div>
													<p className="text-[#EEEEEE] font-medium">
														Authentication Method
													</p>
													<p className="text-[#EEEEEE]/60 text-sm">
														{session.user?.image?.includes("googleusercontent")
															? "Google OAuth"
															: session.user?.image?.includes("github")
															? "GitHub OAuth"
															: "Email Sign-in"}
													</p>
												</div>
												<div className="text-green-400 text-sm">Active</div>
											</div>

											{/* Password Reset Section - only show for email users */}
											{isEmailUser && (
												<div className="p-3 bg-white/5 rounded-lg space-y-3">
													<div className="flex items-center justify-between">
														<div>
															<p className="text-[#EEEEEE] font-medium">
																Password
															</p>
															<p className="text-[#EEEEEE]/60 text-sm">
																Reset your account password
															</p>
														</div>
														<Button
															onClick={handlePasswordReset}
															disabled={isResettingPassword}
															variant="outline"
															size="sm"
															className="border-[#76ABAE]/30 text-[#76ABAE] hover:bg-[#76ABAE]/10 hover:text-[#76ABAE] flex items-center gap-2"
														>
															{isResettingPassword ? (
																<Loader variant="spinner" size="sm" />
															) : (
																<Key className="h-4 w-4" />
															)}
															{isResettingPassword
																? "Sending..."
																: "Reset Password"}
														</Button>
													</div>
													<p className="text-[#EEEEEE]/50 text-xs">
														A password reset link will be sent to your email
														address.
													</p>
												</div>
											)}
										</div>

										{/* Danger Zone */}
										<div className="border-t border-red-500/20 pt-4 mt-6">
											<div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
												<h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
													<AlertCircle className="h-4 w-4" />
													Danger Zone
												</h4>
												<p className="text-red-300/80 text-sm mb-3">
													Permanently delete your account and all associated
													data. This action cannot be undone.
												</p>
												<Button
													onClick={() => setShowDeleteDialog(true)}
													variant="outline"
													size="sm"
													className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/70"
												>
													<Trash2 className="mr-2 h-3 w-3" />
													Delete Account
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Account Actions */}
								<Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
									<CardHeader>
										<CardTitle className="text-[#EEEEEE]">
											Quick Actions
										</CardTitle>
										<CardDescription className="text-[#EEEEEE]/60">
											Navigate to key areas of your account
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-3">
											<Link href="/dashboard" className="block">
												<Button className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/90 text-white py-3 text-lg">
													<ArrowLeft className="mr-2 h-5 w-5 rotate-180" />
													Go to Dashboard
												</Button>
											</Link>

											<Button
												onClick={handleSignOut}
												variant="outline"
												className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
											>
												<LogOut className="mr-2 h-4 w-4" />
												Sign Out
											</Button>
										</div>
									</CardContent>
								</Card>

								{/* BYOAW & Model Selector */}
								<Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl relative">
									{/* Coming Soon Overlay */}
									<div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
										<div className="text-center p-6">
											<div className="inline-flex items-center px-4 py-2 bg-[#76ABAE]/20 border border-[#76ABAE]/30 rounded-full mb-3">
												<div className="w-2 h-2 bg-[#76ABAE] rounded-full mr-2 animate-pulse"></div>
												<span className="text-[#76ABAE] text-sm font-medium">
													Coming Soon
												</span>
											</div>
											<p className="text-[#EEEEEE]/80 text-lg font-semibold mb-1">
												Work in Progress
											</p>
											<p className="text-[#EEEEEE]/60 text-sm">
												This feature is being developed
											</p>
										</div>
									</div>

									<CardHeader>
										<CardTitle className="text-[#EEEEEE] flex items-center gap-2">
											<div className="h-5 w-5 bg-[#76ABAE] rounded flex items-center justify-center">
												<span className="text-[#EEEEEE] text-xs font-bold">
													AI
												</span>
											</div>
											BYOAW & Model Selector
										</CardTitle>
										<CardDescription className="text-[#EEEEEE]/60">
											Bring your own AI weights and choose your preferred AI
											model
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6 opacity-50">
										{/* Model Selection */}
										<div className="space-y-4">
											<div>
												<h4 className="text-[#EEEEEE] font-medium mb-3 flex items-center gap-2">
													<div className="w-2 h-2 bg-[#76ABAE] rounded-full"></div>
													AI Model Provider
												</h4>
												<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
													{/* OpenAI */}
													<div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-[#76ABAE]/30 transition-colors cursor-pointer">
														<div className="flex items-center justify-between mb-2">
															<div className="flex items-center gap-2">
																<div className="w-8 h-8 bg-[#76ABAE] rounded-lg flex items-center justify-center">
																	<span className="text-[#EEEEEE] text-xs font-bold">
																		O
																	</span>
																</div>
																<span className="text-[#EEEEEE] font-medium">
																	OpenAI
																</span>
															</div>
															<div className="w-4 h-4 border-2 border-white/30 rounded-full"></div>
														</div>
														<p className="text-[#EEEEEE]/60 text-xs">
															GPT-4, GPT-3.5 Turbo
														</p>
													</div>

													{/* Claude */}
													<div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-[#76ABAE]/30 transition-colors cursor-pointer">
														<div className="flex items-center justify-between mb-2">
															<div className="flex items-center gap-2">
																<div className="w-8 h-8 bg-[#31363F] rounded-lg flex items-center justify-center">
																	<span className="text-[#EEEEEE] text-xs font-bold">
																		C
																	</span>
																</div>
																<span className="text-[#EEEEEE] font-medium">
																	Claude
																</span>
															</div>
															<div className="w-4 h-4 border-2 border-white/30 rounded-full"></div>
														</div>
														<p className="text-[#EEEEEE]/60 text-xs">
															Claude 3 Opus, Sonnet
														</p>
													</div>

													{/* Gemini */}
													<div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-[#76ABAE]/30 transition-colors cursor-pointer">
														<div className="flex items-center justify-between mb-2">
															<div className="flex items-center gap-2">
																<div className="w-8 h-8 bg-[#222831] rounded-lg flex items-center justify-center border border-white/20">
																	<span className="text-[#EEEEEE] text-xs font-bold">
																		G
																	</span>
																</div>
																<span className="text-[#EEEEEE] font-medium">
																	Gemini
																</span>
															</div>
															<div className="w-4 h-4 border-2 border-white/30 rounded-full"></div>
														</div>
														<p className="text-[#EEEEEE]/60 text-xs">
															Gemini Pro, Ultra
														</p>
													</div>
												</div>
											</div>
										</div>

										{/* API Configuration */}
										<div className="space-y-4">
											<div>
												<h4 className="text-[#EEEEEE] font-medium mb-3 flex items-center gap-2">
													<Key className="h-4 w-4 text-[#76ABAE]" />
													API Configuration
												</h4>
												<div className="space-y-3">
													<div>
														<label className="block text-sm font-medium text-[#EEEEEE]/80 mb-2">
															API Key
														</label>
														<Input
															type="password"
															placeholder="Enter your API key"
															className="bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/40"
															disabled
														/>
														<p className="text-[#EEEEEE]/50 text-xs mt-1">
															Your API key will be encrypted and stored securely
														</p>
													</div>
													<div>
														<label className="block text-sm font-medium text-[#EEEEEE]/80 mb-2">
															Custom Endpoint (Optional)
														</label>
														<Input
															type="url"
															placeholder="https://api.openai.com/v1"
															className="bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/40"
															disabled
														/>
													</div>
												</div>
											</div>
										</div>

										{/* Model Settings */}
										{/* <div className="space-y-4">
											<div>
												<h4 className="text-[#EEEEEE] font-medium mb-3 flex items-center gap-2">
													<div className="w-4 h-4 bg-[#76ABAE] rounded"></div>
													Model Settings
												</h4>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
													<div>
														<label className="block text-sm font-medium text-[#EEEEEE]/80 mb-2">
															Temperature
														</label>
														<Input
															type="number"
															placeholder="0.7"
															min="0"
															max="2"
															step="0.1"
															className="bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/40"
															disabled
														/>
													</div>
													<div>
														<label className="block text-sm font-medium text-[#EEEEEE]/80 mb-2">
															Max Tokens
														</label>
														<Input
															type="number"
															placeholder="2048"
															className="bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/40"
															disabled
														/>
													</div>
												</div>
											</div> 
										</div>*/}

										{/* Test Connection */}
										<div className="pt-4 border-t border-white/10">
											<Button
												disabled
												className="w-full bg-[#76ABAE]/50 hover:bg-[#76ABAE]/60 text-white"
											>
												<CheckCircle className="mr-2 h-4 w-4" />
												Test Connection
											</Button>
										</div>
									</CardContent>
								</Card>
							</div>
						</motion.div>
					</div>
				</div>
			)}

			{/* Delete Account Confirmation Dialog */}
			<AnimatePresence>
				{showDeleteDialog && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
						onClick={() => {
							setShowDeleteDialog(false);
							setDeleteConfirmation("");
							setResetMessage(null);
						}}
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="backdrop-blur-lg bg-[#222831]/95 border border-white/10 text-[#EEEEEE] max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg relative"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Close Button */}
							<button
								className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/10 hover:bg-red-500/20 transition-colors"
								onClick={() => {
									setShowDeleteDialog(false);
									setDeleteConfirmation("");
									setResetMessage(null);
								}}
							>
								<X className="h-4 w-4 text-[#EEEEEE]" />
							</button>

							<div className="p-6">
								{/* Header Section */}
								<div className="mb-6">
									<h2 className="text-2xl font-bold text-[#EEEEEE] mb-2 flex items-center">
										<Trash2 className="mr-3 h-6 w-6 text-red-400" />
										Delete Account
									</h2>
									<p className="text-[#EEEEEE]/60">
										This action cannot be undone. This will permanently delete
										your account and all associated data.
									</p>
								</div>

								{/* Content Grid */}
								<div className="grid grid-cols-1 gap-6">
									{/* Warning Information Card */}
									<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
										<h3 className="text-lg font-semibold text-[#EEEEEE] mb-4 flex items-center">
											<AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
											Data to be Deleted
										</h3>
										<div className="space-y-3">
											<div className="flex items-center text-sm text-[#EEEEEE]/80">
												<div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
												All uploaded resumes and analyses
											</div>
											<div className="flex items-center text-sm text-[#EEEEEE]/80">
												<div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
												Interview practice sessions
											</div>
											<div className="flex items-center text-sm text-[#EEEEEE]/80">
												<div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
												Cold mail templates
											</div>
											<div className="flex items-center text-sm text-[#EEEEEE]/80">
												<div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
												Account settings and preferences
											</div>
										</div>
									</div>

									{/* Status Message */}
									{resetMessage && (
										<motion.div
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											className={`backdrop-blur-lg rounded-lg p-4 border flex items-center space-x-3 ${
												resetMessage.type === "success"
													? "bg-green-500/10 border-green-400/30 text-green-200"
													: "bg-red-500/10 border-red-400/30 text-red-200"
											}`}
										>
											{resetMessage.type === "success" ? (
												<CheckCircle className="h-5 w-5 flex-shrink-0" />
											) : (
												<AlertCircle className="h-5 w-5 flex-shrink-0" />
											)}
											<span className="text-sm">{resetMessage.text}</span>
										</motion.div>
									)}

									{/* Confirmation Input Card */}
									<div className="backdrop-blur-lg bg-white/5 rounded-lg p-6 border border-white/10">
										<h3 className="text-lg font-semibold text-[#EEEEEE] mb-4 flex items-center">
											<Shield className="mr-2 h-5 w-5 text-red-400" />
											Confirmation Required
										</h3>
										<div>
											<label className="block text-sm font-medium text-[#EEEEEE] mb-3">
												Type{" "}
												<span className="text-red-400 font-bold">"DELETE"</span>{" "}
												to confirm:
											</label>
											<Input
												type="text"
												value={deleteConfirmation}
												onChange={(e) => setDeleteConfirmation(e.target.value)}
												placeholder="DELETE"
												className="bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/40 focus:ring-red-400/50 focus:border-red-400/50"
											/>
										</div>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-3 justify-end mt-6 pt-6 border-t border-white/10">
									<Button
										variant="outline"
										onClick={() => {
											setShowDeleteDialog(false);
											setDeleteConfirmation("");
											setResetMessage(null);
										}}
										className="border-white/20 text-[#EEEEEE] hover:bg-white/10"
										disabled={isDeleting}
									>
										Cancel
									</Button>
									<Button
										onClick={handleDeleteAccount}
										disabled={isDeleting || deleteConfirmation !== "DELETE"}
										className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isDeleting ? (
											<>
												<Loader className="mr-2 h-4 w-4 animate-spin" />
												Deleting Account...
											</>
										) : (
											<>
												<Trash2 className="mr-2 h-4 w-4" />
												Delete Account
											</>
										)}
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
