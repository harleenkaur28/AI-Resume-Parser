"use client";

import { useState, useEffect } from "react";
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

export default function ForgotPasswordPage() {
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) {
			setError("Please enter your email address.");
			return;
		}
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to send reset email");
			}

			setSuccess(data.message);
		} catch (err: any) {
			setError(err.message || "An unexpected error occurred.");
		} finally {
			setIsLoading(false);
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
							text="Loading password reset..."
						/>
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
									{success ? "Reset Link Sent!" : "Reset Your Password"}
								</CardTitle>
								<CardDescription className="text-[#EEEEEE]/60">
									{success
										? success
										: "Enter your email address and we'll send you a link to reset your password."}
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
												onClick={() => {
													setSuccess(null);
													setEmail("");
												}}
												className="text-[#EEEEEE] hover:text-[#76ABAE]"
											>
												Send Another Email
											</Button>
										</div>
									</div>
								) : (
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
											{isLoading ? "Sending..." : "Send Reset Link"}
										</Button>
									</form>
								)}

								<div className="mt-6 text-center text-sm">
									<p className="text-[#EEEEEE]/70">
										Remember your password?{" "}
										<Link
											href="/auth"
											className="font-medium text-[#76ABAE] hover:underline"
										>
											Sign in here
										</Link>
									</p>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			)}
		</>
	);
}
