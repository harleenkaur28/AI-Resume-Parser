"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Send, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";

function ResendVerificationContent() {
	const searchParams = useSearchParams();
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Simulate page load
	useEffect(() => {
		const timer = setTimeout(() => setIsPageLoading(false), 600);
		return () => clearTimeout(timer);
	}, []);

	// Get email from URL parameters on component mount
	useEffect(() => {
		const emailFromUrl = searchParams.get("email");
		if (emailFromUrl) {
			setEmail(decodeURIComponent(emailFromUrl));
			// Automatically trigger resend if email is provided in URL
			handleResend(decodeURIComponent(emailFromUrl));
		}
	}, [searchParams]);

	const handleResend = async (emailToUse?: string) => {
		const targetEmail = emailToUse || email;
		if (!targetEmail.trim()) {
			setError("Please enter your email address.");
			return;
		}
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await fetch("/api/auth/resend-verification", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: targetEmail }),
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to resend email");
			}

			setSuccess(
				"Verification email sent! Please check your inbox (and spam folder)."
			);
		} catch (err: any) {
			setError(err.message || "An unexpected error occurred.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await handleResend();
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
						<Loader variant="pulse" size="xl" text="Loading verification..." />
					</motion.div>
				)}
			</AnimatePresence>

			{/* Full-screen loading overlay for verification email */}
			<AnimatePresence>
				{isLoading && (
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
								<Loader variant="pulse" size="xl" className="text-[#76ABAE]" />
							</div>
							<h3 className="text-[#EEEEEE] font-semibold text-xl mb-3">
								Sending Verification
							</h3>
							<p className="text-[#EEEEEE]/70 text-sm leading-relaxed">
								We're sending a verification email to your inbox...
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

			{!isPageLoading && (
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] flex flex-col items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className="absolute top-4 left-4"
					>
						<Link href="/auth">
							<Button
								variant="ghost"
								className="text-[#EEEEEE] hover:text-[#76ABAE]"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Login
							</Button>
						</Link>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="w-full max-w-md"
					>
						<Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
							<CardHeader className="text-center">
								{success ? (
									<CheckCircle className="mx-auto h-10 w-10 text-green-400 mb-4" />
								) : (
									<Send className="mx-auto h-10 w-10 text-[#76ABAE] mb-4" />
								)}
								<CardTitle className="text-[#EEEEEE]">
									{success ? "Email Sent!" : "Resend Verification Email"}
								</CardTitle>
								<CardDescription className="text-[#EEEEEE]/60">
									{success ? (
										<div className="space-y-2">
											<div>{success}</div>
											{email && (
												<div className="text-sm">
													Sent to:{" "}
													<span className="font-medium text-[#76ABAE]">
														{email}
													</span>
												</div>
											)}
										</div>
									) : searchParams.get("email") ? (
										<div className="space-y-2">
											<div>Sending verification email to:</div>
											<div className="font-medium text-[#76ABAE]">{email}</div>
										</div>
									) : (
										"Enter your email address to receive a new verification link."
									)}
								</CardDescription>
							</CardHeader>
							<CardContent>
								{error && (
									<div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center space-x-2">
										<AlertCircle className="h-4 w-4 flex-shrink-0" />
										<span>{error}</span>
									</div>
								)}

								{success ? (
									<div className="space-y-4">
										<div className="text-center">
											<Link href="/auth">
												<Button className="bg-[#76ABAE] hover:bg-[#76ABAE]/90 text-white">
													Back to Login
												</Button>
											</Link>
										</div>
										<div className="text-center">
											<Button
												variant="ghost"
												onClick={() => handleResend()}
												disabled={isLoading}
												className="text-[#EEEEEE] hover:text-[#76ABAE]"
											>
												{isLoading ? "Sending..." : "Send Another Email"}
											</Button>
										</div>
									</div>
								) : !searchParams.get("email") ? (
									<form onSubmit={handleSubmit} className="space-y-6">
										<div className="space-y-2">
											<Label htmlFor="email" className="text-[#EEEEEE]">
												Email Address
											</Label>
											<div className="relative">
												<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
												<Input
													id="email"
													type="email"
													placeholder="you@example.com"
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													required
													className="pl-10 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15"
												/>
											</div>
										</div>
										<Button
											type="submit"
											className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/90 flex items-center justify-center gap-2"
											disabled={isLoading}
										>
											{isLoading && <Loader variant="spinner" size="sm" />}
											{isLoading ? "Sending..." : "Resend Email"}
										</Button>
									</form>
								) : (
									<div className="text-center space-y-4">
										<div className="text-[#EEEEEE]/80">
											{isLoading
												? "Sending verification email..."
												: "Processing your request..."}
										</div>
										{!isLoading && (
											<Button
												variant="ghost"
												onClick={() => handleResend()}
												className="text-[#76ABAE] hover:text-[#76ABAE]/80"
											>
												Resend Email
											</Button>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</motion.div>
				</div>
			)}
		</>
	);
}

export default function ResendVerificationPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#393E46] to-[#76ABAE] flex items-center justify-center p-6">
					<div className="w-full max-w-md">
						<Card className="border-[#76ABAE]/20 bg-[#222831]/90 backdrop-blur-sm shadow-2xl">
							<CardHeader className="text-center">
								<CardTitle className="text-2xl font-bold text-[#EEEEEE]">
									Loading...
								</CardTitle>
							</CardHeader>
							<CardContent className="flex justify-center">
								<Loader variant="spinner" size="lg" />
							</CardContent>
						</Card>
					</div>
				</div>
			}
		>
			<ResendVerificationContent />
		</Suspense>
	);
}
