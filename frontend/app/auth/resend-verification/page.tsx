"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
import { ArrowLeft, Mail, Send, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ResendVerificationPage() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) {
			setError("Please enter your email address.");
			return;
		}
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		// TODO: Implement API call to resend verification email
		// Example:
		// try {
		//   const response = await fetch("/api/auth/resend-verification", {
		//     method: "POST",
		//     headers: { "Content-Type": "application/json" },
		//     body: JSON.stringify({ email }),
		//   });
		//   const data = await response.json();
		//   if (!response.ok) throw new Error(data.message || "Failed to resend email");
		//   setSuccess("Verification email sent! Please check your inbox.");
		// } catch (err: any) {
		//   setError(err.message || "An unexpected error occurred.");
		// } finally {
		//   setIsLoading(false);
		// }

		// Mock API call
		setTimeout(() => {
			// Simulate API call success
			setSuccess(
				`Verification email sent to ${email}! Please check your inbox (and spam folder).`
			);
			// setEmail(""); // Optionally clear email field
			setIsLoading(false);
		}, 1500);
	};

	return (
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
						<Send className="mx-auto h-10 w-10 text-[#76ABAE] mb-4" />
						<CardTitle className="text-[#EEEEEE]">
							Resend Verification Email
						</CardTitle>
						<CardDescription className="text-[#EEEEEE]/60">
							{success
								? success
								: "Enter your email address to receive a new verification link."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{!success && (
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
								{error && (
									<p className="text-sm text-red-400 flex items-center">
										<AlertCircle className="mr-1 h-4 w-4" />
										{error}
									</p>
								)}
								<Button
									type="submit"
									className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/90"
									disabled={isLoading}
								>
									{isLoading ? "Sending..." : "Resend Email"}
								</Button>
							</form>
						)}
						{success && (
							<div className="text-center mt-4">
								<Link href="/auth/verify-email">
									<Button
										variant="outline"
										className="border-[#76ABAE] text-[#76ABAE] hover:bg-[#76ABAE]/10 hover:text-white"
									>
										Enter Token Manually
									</Button>
								</Link>
							</div>
						)}
						<div className="mt-6 text-center text-sm">
							<p className="text-[#EEEEEE]/70">
								Remembered your token?{" "}
								<Link
									href="/auth/verify-email"
									className="font-medium text-[#76ABAE] hover:underline"
								>
									Verify now
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
