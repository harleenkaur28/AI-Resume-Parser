"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import {
	ArrowLeft,
	Lock,
	Eye,
	EyeOff,
	AlertCircle,
	CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";

function ResetPasswordContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [token, setToken] = useState<string | null>(null);

	// Simulate page load
	useEffect(() => {
		const timer = setTimeout(() => setIsPageLoading(false), 600);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		const tokenFromUrl = searchParams.get("token");
		if (tokenFromUrl) {
			setToken(tokenFromUrl);
		} else {
			setError(
				"No reset token found in the URL. Please use the link sent to your email."
			);
		}
	}, [searchParams]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!token) {
			setError("Invalid reset token.");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters long.");
			return;
		}

		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await fetch("/api/auth/confirm-reset", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, password }),
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to reset password");
			}

			setSuccess(data.message);
			setTimeout(() => router.push("/auth"), 3000);
		} catch (err: any) {
			setError(err.message || "An unexpected error occurred.");
		} finally {
			setIsLoading(false);
		}
	};

	if (!token && !error) {
		return <div className="text-center text-[#EEEEEE]">Loading...</div>;
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
						) : error ? (
							<AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-4" />
						) : (
							<Lock className="mx-auto h-10 w-10 text-[#76ABAE] mb-4" />
						)}
						<CardTitle className="text-[#EEEEEE]">
							{success
								? "Password Reset!"
								: error
								? "Reset Failed"
								: "Reset Your Password"}
						</CardTitle>
						<CardDescription className="text-[#EEEEEE]/60">
							{success
								? "Your password has been successfully reset. Redirecting to login..."
								: error
								? "Please try again or request a new reset link."
								: "Enter your new password below."}
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
							<div className="text-center">
								<Link href="/auth">
									<Button className="bg-[#76ABAE] hover:bg-[#76ABAE]/90 text-white">
										Go to Login
									</Button>
								</Link>
							</div>
						) : !error ? (
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="password" className="text-[#EEEEEE]">
										New Password
									</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
										<Input
											id="password"
											type={showPassword ? "text" : "password"}
											placeholder="Enter new password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											className="pl-10 pr-10 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15"
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76ABAE] hover:text-[#EEEEEE] transition-colors"
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="confirmPassword" className="text-[#EEEEEE]">
										Confirm New Password
									</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
										<Input
											id="confirmPassword"
											type={showConfirmPassword ? "text" : "password"}
											placeholder="Confirm new password"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											required
											className="pl-10 pr-10 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15"
										/>
										<button
											type="button"
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76ABAE] hover:text-[#EEEEEE] transition-colors"
										>
											{showConfirmPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
								</div>

								<Button
									type="submit"
									className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/90 flex items-center justify-center gap-2"
									disabled={isLoading}
								>
									{isLoading && (
										<Loader variant="spinner" size="sm" />
									)}
									{isLoading ? "Resetting..." : "Reset Password"}
								</Button>
							</form>
						) : (
							<div className="text-center space-y-4">
								<Link href="/auth/forgot-password">
									<Button className="bg-[#76ABAE] hover:bg-[#76ABAE]/90 text-white">
										Request New Reset Link
									</Button>
								</Link>
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

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] flex items-center justify-center">
					<div className="text-[#EEEEEE]">Loading...</div>
				</div>
			}
		>
			<ResetPasswordContent />
		</Suspense>
	);
}
