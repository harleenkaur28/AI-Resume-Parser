"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [isResettingPassword, setIsResettingPassword] = useState(false);
	const [resetMessage, setResetMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

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
										<Avatar src={session.user?.image} alt="Profile" size="lg" />
										<div className="flex-1">
											<p className="text-[#EEEEEE] font-medium mb-1">
												Profile Picture
											</p>
											<p className="text-[#EEEEEE]/60 text-sm">
												Managed by your{" "}
												{session.user?.image?.includes("googleusercontent.com")
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
										<span className="text-[#EEEEEE]/80 text-sm">Email:</span>
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
													<p className="text-[#EEEEEE] font-medium">Password</p>
													<p className="text-[#EEEEEE]/60 text-sm">
														Reset your account password
													</p>
												</div>
												<Button
													onClick={handlePasswordReset}
													disabled={isResettingPassword}
													variant="outline"
													size="sm"
													className="border-[#76ABAE]/30 text-[#76ABAE] hover:bg-[#76ABAE]/10 hover:text-[#76ABAE]"
												>
													<Key className="mr-2 h-4 w-4" />
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
							</CardContent>
						</Card>

						{/* Account Actions */}
						<Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
							<CardHeader>
								<CardTitle className="text-[#EEEEEE]">Quick Actions</CardTitle>
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

									{/* Password Management for Email Users */}
									{isEmailUser && (
										<Link href="/auth/forgot-password" className="block">
											<Button
												variant="outline"
												className="w-full border-[#76ABAE]/30 text-[#76ABAE] hover:bg-[#76ABAE]/10 hover:text-[#76ABAE]"
											>
												<Key className="mr-2 h-4 w-4" />
												Change Password
											</Button>
										</Link>
									)}

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
	);
}
