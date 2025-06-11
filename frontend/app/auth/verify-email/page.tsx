"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, MailCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(
		"Verifying your email, please wait..."
	);

	useEffect(() => {
		const tokenFromUrl = searchParams.get("token");
		if (tokenFromUrl) {
			verifyToken(tokenFromUrl);
		} else {
			setError(
				"No verification token found in the URL. Please use the link sent to your email."
			);
			setMessage("Invalid verification link.");
			setIsLoading(false);
		}
	}, [searchParams, router]);

	const verifyToken = async (tokenToVerify: string) => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);
		setMessage("Verifying your email, please wait...");

		// TODO: Implement API call to verify email with the token
		// Example:
		// try {
		//   const response = await fetch("/api/auth/verify-email", {
		//     method: "POST",
		//     headers: { "Content-Type": "application/json" },
		//     body: JSON.stringify({ token: tokenToVerify }),
		//   });
		//   const data = await response.json();
		//   if (!response.ok) throw new Error(data.message || "Verification failed");
		//   setSuccess("Email verified successfully! You can now login.");
		//   setMessage("Email verified successfully! Redirecting to login...");
		//   setTimeout(() => router.push("/auth"), 3000);
		// } catch (err: any) {
		//   setError(err.message || "An unexpected error occurred.");
		//   setMessage(err.message || "An unexpected error occurred.");
		// } finally {
		//   setIsLoading(false);
		// }

		// Mock API call
		setTimeout(() => {
			if (tokenToVerify === "valid-token") {
				setSuccess("Email verified successfully! Redirecting to login...");
				setMessage("Email verified successfully! Redirecting to login...");
				setTimeout(() => router.push("/auth"), 3000);
			} else {
				setError(
					"Invalid or expired token. Please try again or request a new verification email."
				);
				setMessage(
					"Invalid or expired token. Please try again or request a new verification email."
				);
			}
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
						<MailCheck className="mx-auto h-12 w-12 text-[#76ABAE] mb-4" />
						<CardTitle className="text-[#EEEEEE]">Verify Your Email</CardTitle>
						<CardDescription className="text-[#EEEEEE]/60 min-h-[40px]">
							{isLoading && "Verifying your email, please wait..."}
							{success && success}
							{error && !success && error}
							{!isLoading &&
								!success &&
								!error &&
								"No token found or an issue occurred."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{error && !success && (
							<div className="my-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-center">
								<p className="text-sm text-red-400 flex items-center justify-center">
									<AlertCircle className="mr-2 h-5 w-5" />
									{error}
								</p>
							</div>
						)}
						{success && (
							<div className="my-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md text-center">
								<p className="text-sm text-green-400 flex items-center justify-center">
									<MailCheck className="mr-2 h-5 w-5" />
									{success}
								</p>
							</div>
						)}
						{!isLoading && (
							<div className="mt-6 text-center text-sm">
								<p className="text-[#EEEEEE]/70">
									{error ? "Try again or " : "Didn't receive a token? "}
									<Link
										href="/auth/resend-verification"
										className="font-medium text-[#76ABAE] hover:underline"
									>
										Resend verification email
									</Link>
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
