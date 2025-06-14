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
							</div>
						</motion.div>
					</div>
				</div>
			)}

			{/* Delete Account Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent className="backdrop-blur-2xl bg-gradient-to-br from-red-900/20 via-[#31363F]/95 to-red-900/20 border-red-400/30 border-2 text-white shadow-2xl shadow-red-500/20 rounded-2xl max-w-lg w-[90vw] max-h-[90vh] overflow-y-auto">
					<div className="bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 rounded-2xl pointer-events-none"></div>
					<div className="relative z-10 p-2">
						<DialogHeader className="space-y-3">
							<DialogTitle className="text-xl font-semibold text-white flex items-center gap-3">
								<div className="p-2 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-400/30">
									<Trash2 className="h-6 w-6 text-red-400" />
								</div>
								Delete Account
							</DialogTitle>
							<DialogDescription className="text-slate-300/80">
								This action cannot be undone. This will permanently delete your
								account and all associated data.
							</DialogDescription>
						</DialogHeader>

						<div className="mt-4 space-y-4">
							<div>
								<p className="text-slate-300/80 text-sm mb-2">
									The following data will be permanently deleted:
								</p>
								<ul className="list-disc list-inside text-sm space-y-1 text-slate-300/70 ml-4">
									<li>All uploaded resumes and analyses</li>
									<li>Interview practice sessions</li>
									<li>Cold mail templates</li>
									<li>Account settings and preferences</li>
								</ul>
							</div>

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

							<div>
								<label className="block text-sm font-medium text-slate-300 mb-2">
									Type "DELETE" to confirm:
								</label>
								<Input
									type="text"
									value={deleteConfirmation}
									onChange={(e) => setDeleteConfirmation(e.target.value)}
									placeholder="DELETE"
									className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:ring-red-500/50 focus:border-red-500/50"
								/>
							</div>
						</div>

						<DialogFooter className="flex gap-2 mt-6 pt-4">
							<Button
								variant="outline"
								onClick={() => {
									setShowDeleteDialog(false);
									setDeleteConfirmation("");
									setResetMessage(null);
								}}
								className="border-slate-500/50 text-slate-300 hover:bg-slate-600/50 backdrop-blur-sm hover:border-slate-400/50 transition-all duration-200"
								disabled={isDeleting}
							>
								Cancel
							</Button>
							<Button
								onClick={handleDeleteAccount}
								disabled={isDeleting || deleteConfirmation !== "DELETE"}
								className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white backdrop-blur-sm border border-red-400/30 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isDeleting ? (
									<>
										<Loader className="mr-2 h-4 w-4" />
										Deleting Account...
									</>
								) : (
									<>
										<Trash2 className="mr-2 h-4 w-4" />
										Delete Account
									</>
								)}
							</Button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
