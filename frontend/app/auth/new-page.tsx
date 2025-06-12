"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ArrowLeft,
	Mail,
	Github,
	Chrome,
	Eye,
	EyeOff,
	User,
	Lock,
} from "lucide-react";
import Link from "next/link";

interface Role {
	id: string;
	name: string;
}

export default function AuthPage() {
	const { data: session, status } = useSession();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [roles, setRoles] = useState<Role[]>([]);
	const [error, setError] = useState("");
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
	});

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

	// Redirect if session exists
	useEffect(() => {
		if (session) {
			router.push("/dashboard");
		}
	}, [session, router]);

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
			setError("Invalid email or password");
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
				}),
			});

			const data = await response.json();

			if (response.ok) {
				// Registration successful, now sign in
				const result = await signIn("credentials", {
					email: registerForm.email,
					password: registerForm.password,
					redirect: false,
				});

				if (result?.ok) {
					router.push("/dashboard");
				} else {
					setError(
						"Registration successful but login failed. Please try logging in."
					);
				}
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
		<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] flex items-center justify-center">
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.5 }}
				className="absolute top-4 left-4"
			>
				<Link href="/">
					<Button
						variant="ghost"
						className="text-[#EEEEEE] hover:text-[#76ABAE]"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Home
					</Button>
				</Link>
			</motion.div>

			<div className="container mx-auto px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="max-w-md mx-auto"
				>
					<Tabs defaultValue={defaultTab} className="w-full">
						<TabsList className="grid w-full grid-cols-2 bg-transparent mb-6">
							<TabsTrigger
								value="login"
								className="data-[state=active]:bg-[#76ABAE]/20 data-[state=active]:backdrop-blur-md data-[state=active]:text-[#76ABAE] text-[#EEEEEE] rounded-lg transition-all duration-300"
							>
								Login
							</TabsTrigger>
							<TabsTrigger
								value="register"
								className="data-[state=active]:bg-[#76ABAE]/20 data-[state=active]:backdrop-blur-md data-[state=active]:text-[#76ABAE] text-[#EEEEEE] rounded-lg transition-all duration-300"
							>
								Register
							</TabsTrigger>
						</TabsList>

						{error && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm"
							>
								{error}
							</motion.div>
						)}

						<TabsContent value="login">
							<Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
								<CardHeader>
									<CardTitle className="text-[#EEEEEE]">Welcome back</CardTitle>
									<CardDescription className="text-[#EEEEEE]/60">
										Login to access your dashboard
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<form onSubmit={handleLogin} className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="login-email" className="text-[#EEEEEE]">
												Email Address
											</Label>
											<div className="relative">
												<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
												<Input
													id="login-email"
													type="email"
													placeholder="you@example.com"
													value={loginForm.email}
													onChange={(e) =>
														setLoginForm((prev) => ({
															...prev,
															email: e.target.value,
														}))
													}
													required
													className="pl-10 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 transition-all duration-300"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="login-password"
												className="text-[#EEEEEE]"
											>
												Password
											</Label>
											<div className="relative">
												<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
												<Input
													id="login-password"
													type={showPassword ? "text" : "password"}
													placeholder="Your password"
													value={loginForm.password}
													onChange={(e) =>
														setLoginForm((prev) => ({
															...prev,
															password: e.target.value,
														}))
													}
													required
													className="pl-10 pr-10 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 transition-all duration-300"
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
										<Button
											type="submit"
											className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/90 backdrop-blur-sm shadow-lg transition-all duration-300"
											disabled={isLoading}
										>
											{isLoading ? "Signing in..." : "Sign In"}
										</Button>
									</form>

									<div className="relative">
										<div className="absolute inset-0 flex items-center">
											<span className="w-full border-t border-white/20" />
										</div>
										<div className="relative flex justify-center text-xs uppercase">
											<span className="bg-white/10 px-2 text-[#EEEEEE]/60">
												Or continue with
											</span>
										</div>
									</div>

									<div className="space-y-3">
										<Button
											onClick={() => handleOAuthSignIn("google")}
											disabled={isLoading}
											type="button"
											className="w-full bg-[#4285F4] hover:bg-[#3578E5] text-white py-3 text-lg flex items-center justify-center gap-2"
										>
											<Chrome className="h-5 w-5" />
											Continue with Google
										</Button>
										<Button
											onClick={() => handleOAuthSignIn("github")}
											disabled={isLoading}
											type="button"
											className="w-full bg-[#333] hover:bg-[#444] text-white py-3 text-lg flex items-center justify-center gap-2"
										>
											<Github className="h-5 w-5" />
											Continue with GitHub
										</Button>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="register">
							<Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
								<CardHeader>
									<CardTitle className="text-[#EEEEEE]">
										Create Your Account
									</CardTitle>
									<CardDescription className="text-[#EEEEEE]/60">
										Join us and unlock your potential
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<form onSubmit={handleRegister} className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="register-name" className="text-[#EEEEEE]">
												Full Name
											</Label>
											<div className="relative">
												<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
												<Input
													id="register-name"
													type="text"
													placeholder="Your full name"
													value={registerForm.name}
													onChange={(e) =>
														setRegisterForm((prev) => ({
															...prev,
															name: e.target.value,
														}))
													}
													required
													className="pl-10 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 transition-all duration-300"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="register-email"
												className="text-[#EEEEEE]"
											>
												Email Address
											</Label>
											<div className="relative">
												<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
												<Input
													id="register-email"
													type="email"
													placeholder="you@example.com"
													value={registerForm.email}
													onChange={(e) =>
														setRegisterForm((prev) => ({
															...prev,
															email: e.target.value,
														}))
													}
													required
													className="pl-10 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 transition-all duration-300"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="register-role" className="text-[#EEEEEE]">
												Role
											</Label>
											<Select
												value={registerForm.roleId}
												onValueChange={(value) =>
													setRegisterForm((prev) => ({
														...prev,
														roleId: value,
													}))
												}
												required
											>
												<SelectTrigger className="bg-white/10 border-white/20 text-[#EEEEEE] focus:bg-white/15 transition-all duration-300">
													<SelectValue placeholder="Select your role" />
												</SelectTrigger>
												<SelectContent className="bg-[#31363F] border-white/20 text-[#EEEEEE]">
													{roles.map((role) => (
														<SelectItem
															key={role.id}
															value={role.id}
															className="hover:bg-white/10 focus:bg-white/10"
														>
															{role.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="register-password"
												className="text-[#EEEEEE]"
											>
												Password
											</Label>
											<div className="relative">
												<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#76ABAE]" />
												<Input
													id="register-password"
													type={showPassword ? "text" : "password"}
													placeholder="Choose a password"
													value={registerForm.password}
													onChange={(e) =>
														setRegisterForm((prev) => ({
															...prev,
															password: e.target.value,
														}))
													}
													required
													className="pl-10 pr-10 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 transition-all duration-300"
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
												className="text-[#EEEEEE]"
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
													className="pl-10 pr-10 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 transition-all duration-300"
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
										<div className="flex items-center space-x-2 pt-2">
											<input
												type="checkbox"
												id="terms"
												required
												className="accent-[#76ABAE]"
											/>
											<Label
												htmlFor="terms"
												className="text-xs text-[#EEEEEE]/70"
											>
												I agree to the{" "}
												<Link
													href="/terms"
													className="underline hover:text-[#76ABAE]"
												>
													Terms of Service
												</Link>{" "}
												and{" "}
												<Link
													href="/privacy"
													className="underline hover:text-[#76ABAE]"
												>
													Privacy Policy
												</Link>
												.
											</Label>
										</div>
										<Button
											type="submit"
											className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/90 backdrop-blur-sm shadow-lg transition-all duration-300 mt-2"
											disabled={isLoading}
										>
											{isLoading ? "Creating Account..." : "Create Account"}
										</Button>
									</form>

									<div className="relative">
										<div className="absolute inset-0 flex items-center">
											<span className="w-full border-t border-white/20" />
										</div>
										<div className="relative flex justify-center text-xs uppercase">
											<span className="bg-white/10 px-2 text-[#EEEEEE]/60">
												Or sign up with
											</span>
										</div>
									</div>

									<div className="space-y-3">
										<Button
											onClick={() => handleOAuthSignIn("google")}
											disabled={isLoading}
											type="button"
											className="w-full bg-[#4285F4] hover:bg-[#3578E5] text-white py-3 text-lg flex items-center justify-center gap-2"
										>
											<Chrome className="h-5 w-5" />
											Sign up with Google
										</Button>
										<Button
											onClick={() => handleOAuthSignIn("github")}
											disabled={isLoading}
											type="button"
											className="w-full bg-[#333] hover:bg-[#444] text-white py-3 text-lg flex items-center justify-center gap-2"
										>
											<Github className="h-5 w-5" />
											Sign up with GitHub
										</Button>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</motion.div>
			</div>
		</div>
	);
}
