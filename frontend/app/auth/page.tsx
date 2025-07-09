"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	Mail,
	Github,
	Chrome,
	Eye,
	EyeOff,
	User,
	Lock,
	Upload,
	AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";

interface Role {
	id: string;
	name: string;
}

function AuthContent() {
	const { data: session, status } = useSession();
	const [isPageLoading, setIsPageLoading] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [roles, setRoles] = useState<Role[]>([]);
	const [error, setError] = useState<string | React.ReactNode>("");
	const router = useRouter();
	const searchParams = useSearchParams();
	const defaultTab =
		searchParams.get("tab") === "register" ? "register" : "login";

	// Login form state
	const [loginForm, setLoginForm] = useState({
		email: "",
		password: "",
	});

	// Register form state
	const [registerForm, setRegisterForm] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		roleId: "",
		avatarUrl: "",
	});

	// Avatar preview state
	const [avatarPreview, setAvatarPreview] = useState("");
	const [avatarError, setAvatarError] = useState("");

	// Avatar URL validation
	const handleAvatarUrlChange = (url: string) => {
		setRegisterForm((prev) => ({ ...prev, avatarUrl: url }));
		setAvatarError("");

		if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
			setAvatarPreview(url);
		} else {
			setAvatarPreview("");
		}
	};

	const validateAvatarUrl = (url: string) => {
		if (!url) return true; // Avatar is optional

		try {
			new URL(url);
			return true;
		} catch {
			setAvatarError("Please enter a valid URL");
			return false;
		}
	};

	// Fetch roles on component mount
	useEffect(() => {
		const fetchRoles = async () => {
			try {
				const response = await fetch("/api/roles");
				const data = await response.json();
				setRoles(data.roles || []);
			} catch (error) {
				console.error("Failed to fetch roles:", error);
			}
		};

		fetchRoles();
	}, []);

	// Simulate page load
	useEffect(() => {
		const timer = setTimeout(() => setIsPageLoading(false), 800);
		return () => clearTimeout(timer);
	}, []);

	// Redirect if session exists
	useEffect(() => {
		if (session) {
			router.push("/dashboard");
		}
	}, [session, router]);

	// Handle URL error parameters
	useEffect(() => {
		const errorParam = searchParams.get("error");
		if (errorParam === "unverified") {
			const emailParam = searchParams.get("email");
			setError(
				<div>
					Please verify your email before signing in.{" "}
					<Link
						href={`/auth/resend-verification${
							emailParam ? `?email=${encodeURIComponent(emailParam)}` : ""
						}`}
						className="text-[#76ABAE] hover:underline font-medium"
					>
						Resend verification email
					</Link>
				</div>
			);
		}
	}, [searchParams]);

	const handleOAuthSignIn = async (provider: string) => {
		setIsLoading(true);
		await signIn(provider, { callbackUrl: "/dashboard" });
		setIsLoading(false);
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		const result = await signIn("credentials", {
			email: loginForm.email,
			password: loginForm.password,
			redirect: false,
		});

		if (result?.error) {
			// Check if error is related to email verification
			if (result.error.includes("verify your email")) {
				setError(
					<div>
						Please verify your email before signing in.{" "}
						<Link
							href={`/auth/resend-verification?email=${encodeURIComponent(
								loginForm.email
							)}`}
							className="text-[#76ABAE] hover:underline font-medium"
						>
							Resend verification email
						</Link>
					</div>
				);
			} else {
				setError("Invalid email or password");
			}
		} else if (result?.ok) {
			router.push("/dashboard");
		}

		setIsLoading(false);
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		if (registerForm.password !== registerForm.confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		if (registerForm.password.length < 6) {
			setError("Password must be at least 6 characters");
			setIsLoading(false);
			return;
		}

		if (!registerForm.roleId) {
			setError("Please select a role");
			setIsLoading(false);
			return;
		}

		if (!validateAvatarUrl(registerForm.avatarUrl)) {
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: registerForm.name,
					email: registerForm.email,
					password: registerForm.password,
					roleId: registerForm.roleId,
					avatarUrl: registerForm.avatarUrl || null,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				// Registration successful - show email verification message
				setError(
					<div className="text-green-400 text-center">
						<div className="font-medium mb-2">Registration Successful!</div>
						<div className="text-sm">
							A verification email has been sent to {registerForm.email}. Please
							check your inbox and click the verification link to activate your
							account.
						</div>
						<div className="mt-3">
							<Link
								href={`/auth/resend-verification?email=${encodeURIComponent(
									registerForm.email
								)}`}
								className="text-[#76ABAE] hover:underline font-medium text-sm"
							>
								Didn't receive the email? Resend verification
							</Link>
						</div>
					</div>
				);

				// Clear the form
				setRegisterForm({
					name: "",
					email: "",
					password: "",
					confirmPassword: "",
					roleId: "",
					avatarUrl: "",
				});
				setAvatarPreview("");
			} else {
				setError(data.error || "Registration failed");
			}
		} catch (error) {
			setError("An error occurred during registration");
		}

		setIsLoading(false);
	};

	if (status === "loading") {
		return (
			<div className="flex items-center justify-center min-h-screen text-white bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
				Loading authentication...
			</div>
		);
	}

	if (session) {
		return (
			<div className="flex items-center justify-center min-h-screen text-white bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
				Redirecting to dashboard...
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
						<Loader
							variant="pulse"
							size="xl"
							text="Loading authentication..."
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Full-screen loading overlay for authentication requests */}
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
								Processing Authentication
							</h3>
							<p className="text-[#EEEEEE]/70 text-sm leading-relaxed">
								Please wait while we authenticate your request...
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
				<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] relative overflow-visible">
					{/* Animated background elements */}
					<div className="absolute inset-0 overflow-hidden">
						<div className="absolute -top-10 -left-10 w-72 h-72 bg-[#76ABAE]/10 rounded-full blur-3xl animate-pulse"></div>
						<div className="absolute top-1/2 -right-20 w-96 h-96 bg-[#31363F]/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
						<div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-[#76ABAE]/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
					</div>

					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className="absolute top-6 left-6 z-10"
					>
						<Link href="/">
							<Button
								variant="ghost"
								className="text-white hover:text-[#76ABAE] hover:bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Home
							</Button>
						</Link>
					</motion.div>

					<div className="container mx-auto px-4 py-10 relative z-10 flex items-center justify-center min-h-screen">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="max-w-md mx-auto w-full"
						>
							<Tabs defaultValue={defaultTab} className="w-full">
								<TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-lg h-14 rounded-xl p-1 mb-8 border border-white/10">
									<TabsTrigger
										value="login"
										className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#76ABAE] data-[state=active]:to-[#5A8B8F] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#EEEEEE]/70 rounded-lg transition-all duration-300 font-medium py-3"
									>
										Sign In
									</TabsTrigger>
									<TabsTrigger
										value="register"
										className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#76ABAE] data-[state=active]:to-[#5A8B8F] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#EEEEEE]/70 rounded-lg transition-all duration-300 font-medium py-3"
									>
										Sign Up
									</TabsTrigger>
								</TabsList>

								{error && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className={`mb-6 p-4 rounded-xl backdrop-blur-lg border text-sm ${
											typeof error === "string" &&
											error.includes("Registration Successful")
												? "bg-green-500/10 border-green-500/30 text-green-200"
												: "bg-red-500/10 border-red-500/30 text-red-200"
										}`}
									>
										<div className="flex items-start space-x-2">
											<AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
											<div>{error}</div>
										</div>
									</motion.div>
								)}

								<TabsContent value="login">
									<Card className="backdrop-blur-lg bg-white/5 border border-white/10 shadow-2xl rounded-xl">
										<CardHeader className="text-center pb-6">
											<CardTitle className="text-2xl font-bold text-[#EEEEEE] mb-2">
												Welcome back!
											</CardTitle>
											<CardDescription className="text-[#EEEEEE]/60 text-base">
												Sign in to access your AI-powered career dashboard
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-6">
											{/* OAuth Buttons First */}
											<div className="space-y-3">
												<Button
													onClick={() => handleOAuthSignIn("google")}
													disabled={isLoading}
													type="button"
													className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 rounded-xl font-medium"
												>
													{isLoading ? (
														<Loader variant="spinner" size="sm" />
													) : (
														<svg className="h-5 w-5" viewBox="0 0 24 24">
															<path
																fill="#4285F4"
																d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
															/>
															<path
																fill="#34A853"
																d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
															/>
															<path
																fill="#FBBC05"
																d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
															/>
															<path
																fill="#EA4335"
																d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
															/>
														</svg>
													)}
													Continue with Google
												</Button>

												<Button
													onClick={() => handleOAuthSignIn("github")}
													disabled={isLoading}
													type="button"
													className="w-full h-12 bg-[#24292F] hover:bg-[#1C2128] text-white border border-gray-600 hover:border-gray-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 rounded-xl font-medium"
												>
													{isLoading ? (
														<Loader variant="spinner" size="sm" />
													) : (
														<Github className="h-5 w-5" />
													)}
													Continue with GitHub
												</Button>
											</div>

											<div className="relative">
												<div className="absolute inset-0 flex items-center">
													<span className="w-full border-t border-white/20" />
												</div>
												<div className="relative flex justify-center text-sm uppercase">
													<span className="bg-white/10 backdrop-blur-sm px-4 py-1 text-[#EEEEEE]/60 rounded-full border border-white/10">
														Or sign in with email
													</span>
												</div>
											</div>

											<form onSubmit={handleLogin} className="space-y-5">
												<div className="space-y-2">
													<Label
														htmlFor="login-email"
														className="text-[#EEEEEE] font-medium"
													>
														Email Address
													</Label>
													<div className="relative">
														<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
														<Input
															id="login-email"
															type="email"
															placeholder="Enter your email"
															value={loginForm.email}
															onChange={(e) =>
																setLoginForm((prev) => ({
																	...prev,
																	email: e.target.value,
																}))
															}
															required
															className="pl-10 h-12 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 focus:border-[#76ABAE]/50 transition-all duration-300 rounded-xl"
														/>
													</div>
												</div>

												<div className="space-y-2">
													<Label
														htmlFor="login-password"
														className="text-[#EEEEEE] font-medium"
													>
														Password
													</Label>
													<div className="relative">
														<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
														<Input
															id="login-password"
															type={showPassword ? "text" : "password"}
															placeholder="Enter your password"
															value={loginForm.password}
															onChange={(e) =>
																setLoginForm((prev) => ({
																	...prev,
																	password: e.target.value,
																}))
															}
															required
															className="pl-10 pr-12 h-12 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 focus:border-[#76ABAE]/50 transition-all duration-300 rounded-xl"
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

												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-2">
														<input
															type="checkbox"
															id="remember"
															className="accent-[#76ABAE] w-4 h-4 rounded"
														/>
														<Label
															htmlFor="remember"
															className="text-sm text-[#EEEEEE]/70"
														>
															Remember me
														</Label>
													</div>
													<Link
														href="/auth/forgot-password"
														className="text-sm text-[#76ABAE] hover:text-[#76ABAE]/80 transition-colors font-medium"
													>
														Forgot password?
													</Link>
												</div>

												<Button
													type="submit"
													className="w-full h-12 bg-gradient-to-r from-[#76ABAE] to-[#5A8B8F] hover:from-[#5A8B8F] hover:to-[#76ABAE] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 rounded-xl font-medium text-lg"
													disabled={isLoading}
												>
													{isLoading && <Loader variant="spinner" size="sm" />}
													{isLoading ? "Signing in..." : "Sign In"}
												</Button>
											</form>
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent value="register">
									<Card className="backdrop-blur-lg bg-white/5 border border-white/10 shadow-2xl rounded-xl">
										<CardHeader className="text-center pb-6">
											<CardTitle className="text-2xl font-bold text-[#EEEEEE] mb-2">
												Create Your Account
											</CardTitle>
											<CardDescription className="text-[#EEEEEE]/60 text-base">
												Join thousands of professionals accelerating their
												careers
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-6">
											{/* OAuth Buttons First */}
											<div className="space-y-3">
												<Button
													onClick={() => handleOAuthSignIn("google")}
													disabled={isLoading}
													type="button"
													className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 rounded-xl font-medium"
												>
													{isLoading ? (
														<Loader variant="spinner" size="sm" />
													) : (
														<svg className="h-5 w-5" viewBox="0 0 24 24">
															<path
																fill="#4285F4"
																d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
															/>
															<path
																fill="#34A853"
																d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
															/>
															<path
																fill="#FBBC05"
																d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
															/>
															<path
																fill="#EA4335"
																d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
															/>
														</svg>
													)}
													Sign up with Google
												</Button>

												<Button
													onClick={() => handleOAuthSignIn("github")}
													disabled={isLoading}
													type="button"
													className="w-full h-12 bg-[#24292F] hover:bg-[#1C2128] text-white border border-gray-600 hover:border-gray-500 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 rounded-xl font-medium"
												>
													{isLoading ? (
														<Loader variant="spinner" size="sm" />
													) : (
														<Github className="h-5 w-5" />
													)}
													Sign up with GitHub
												</Button>
											</div>

											<div className="relative">
												<div className="absolute inset-0 flex items-center">
													<span className="w-full border-t border-white/20" />
												</div>
												<div className="relative flex justify-center text-sm uppercase">
													<span className="bg-white/10 backdrop-blur-sm px-4 py-1 text-[#EEEEEE]/60 rounded-full border border-white/10">
														Or create account with email
													</span>
												</div>
											</div>

											<form onSubmit={handleRegister} className="space-y-5">
												<div className="grid grid-cols-1 gap-5">
													<div className="space-y-2">
														<Label
															htmlFor="register-name"
															className="text-[#EEEEEE] font-medium"
														>
															Full Name
														</Label>
														<div className="relative">
															<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
															<Input
																id="register-name"
																type="text"
																placeholder="Enter your full name"
																value={registerForm.name}
																onChange={(e) =>
																	setRegisterForm((prev) => ({
																		...prev,
																		name: e.target.value,
																	}))
																}
																required
																className="pl-10 h-12 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 focus:border-[#76ABAE]/50 transition-all duration-300 rounded-xl"
															/>
														</div>
													</div>

													<div className="space-y-2">
														<Label
															htmlFor="register-email"
															className="text-[#EEEEEE] font-medium"
														>
															Email Address
														</Label>
														<div className="relative">
															<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
															<Input
																id="register-email"
																type="email"
																placeholder="Enter your email"
																value={registerForm.email}
																onChange={(e) =>
																	setRegisterForm((prev) => ({
																		...prev,
																		email: e.target.value,
																	}))
																}
																required
																className="pl-10 h-12 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 focus:border-[#76ABAE]/50 transition-all duration-300 rounded-xl"
															/>
														</div>
													</div>

													<div className="space-y-2">
														<Label
															htmlFor="register-role"
															className="text-[#EEEEEE] font-medium"
														>
															Role
														</Label>
														<select
															id="register-role"
															value={registerForm.roleId}
															onChange={(e) =>
																setRegisterForm((prev) => ({
																	...prev,
																	roleId: e.target.value,
																}))
															}
															required
															className="w-full h-12 bg-white/10 border border-white/20 text-[#EEEEEE] focus:bg-white/15 focus:border-[#76ABAE]/50 transition-all duration-300 rounded-xl px-3 cursor-pointer"
														>
															<option
																value=""
																disabled
																className="bg-[#31363F] text-[#EEEEEE]"
															>
																Select your role
															</option>
															{roles.map((role) => (
																<option
																	key={role.id}
																	value={role.id}
																	className="bg-[#31363F] text-[#EEEEEE]"
																>
																	{role.name}
																</option>
															))}
														</select>
													</div>
												</div>

												{/* Avatar Upload Section */}
												<div className="space-y-3">
													<Label className="text-[#EEEEEE] font-medium">
														Profile Picture (Optional)
													</Label>
													<div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
														<Avatar
															src={avatarPreview}
															alt="Avatar Preview"
															size="lg"
														/>
														<div className="flex-1 space-y-2">
															<Input
																type="url"
																placeholder="https://example.com/your-avatar.jpg"
																value={registerForm.avatarUrl}
																onChange={(e) =>
																	handleAvatarUrlChange(e.target.value)
																}
																className="bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/40 focus:bg-white/15 focus:border-[#76ABAE]/50 transition-all duration-300 rounded-lg"
															/>
															<p className="text-xs text-[#EEEEEE]/60">
																Paste a URL to your profile picture
															</p>
															{avatarError && (
																<div className="flex items-center space-x-1 text-red-400 text-xs">
																	<AlertCircle className="h-3 w-3" />
																	<span>{avatarError}</span>
																</div>
															)}
														</div>
													</div>
												</div>

												<div className="grid grid-cols-1 gap-5">
													<div className="space-y-2">
														<Label
															htmlFor="register-password"
															className="text-[#EEEEEE] font-medium"
														>
															Password
														</Label>
														<div className="relative">
															<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
															<Input
																id="register-password"
																type={showPassword ? "text" : "password"}
																placeholder="Choose a strong password"
																value={registerForm.password}
																onChange={(e) =>
																	setRegisterForm((prev) => ({
																		...prev,
																		password: e.target.value,
																	}))
																}
																required
																className="pl-10 pr-12 h-12 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 focus:border-[#76ABAE]/50 transition-all duration-300 rounded-xl"
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
														<Label
															htmlFor="register-confirm-password"
															className="text-[#EEEEEE] font-medium"
														>
															Confirm Password
														</Label>
														<div className="relative">
															<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
															<Input
																id="register-confirm-password"
																type={showConfirmPassword ? "text" : "password"}
																placeholder="Confirm your password"
																value={registerForm.confirmPassword}
																onChange={(e) =>
																	setRegisterForm((prev) => ({
																		...prev,
																		confirmPassword: e.target.value,
																	}))
																}
																required
																className="pl-10 pr-12 h-12 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 focus:border-[#76ABAE]/50 transition-all duration-300 rounded-xl"
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
												</div>

												<div className="flex items-start space-x-3 pt-2">
													<input
														type="checkbox"
														id="terms"
														required
														className="accent-[#76ABAE] w-4 h-4 rounded mt-0.5"
													/>
													<Label
														htmlFor="terms"
														className="text-sm text-[#EEEEEE]/70 leading-relaxed"
													>
														I agree to the{" "}
														<Link
															href="/terms"
															className="text-[#76ABAE] hover:text-[#76ABAE]/80 underline font-medium"
														>
															Terms of Service
														</Link>{" "}
														and{" "}
														<Link
															href="/privacy"
															className="text-[#76ABAE] hover:text-[#76ABAE]/80 underline font-medium"
														>
															Privacy Policy
														</Link>
													</Label>
												</div>

												<Button
													type="submit"
													className="w-full h-12 bg-gradient-to-r from-[#76ABAE] to-[#5A8B8F] hover:from-[#5A8B8F] hover:to-[#76ABAE] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 rounded-xl font-medium text-lg mt-6"
													disabled={isLoading}
												>
													{isLoading && <Loader variant="spinner" size="sm" />}
													{isLoading ? "Creating Account..." : "Create Account"}
												</Button>
											</form>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>
						</motion.div>
					</div>
				</div>
			)}
		</>
	);
}

export default function AuthPage() {
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
			<AuthContent />
		</Suspense>
	);
}
