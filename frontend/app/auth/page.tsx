"use client";

import { useState } from "react";
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
import { ArrowLeft, Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		// TODO: Implement authentication
		setTimeout(() => setIsLoading(false), 1000);
	};

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
					<Tabs defaultValue="login" className="w-full">
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
						<TabsContent value="login">
							<Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
								<CardHeader>
									<CardTitle className="text-[#EEEEEE]">Welcome back</CardTitle>
									<CardDescription className="text-[#EEEEEE]/60">
										Login to access your dashboard
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form onSubmit={handleSubmit} className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="email" className="text-[#EEEEEE]">
												Email
											</Label>
											<div className="relative">
												<Mail className="absolute left-3 top-3 h-4 w-4 text-[#76ABAE]" />
												<Input
													id="email"
													type="email"
													placeholder="name@example.com"
													className="pl-10 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 transition-all duration-300"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="password" className="text-[#EEEEEE]">
												Password
											</Label>
											<div className="relative">
												<Lock className="absolute left-3 top-3 h-4 w-4 text-[#76ABAE]" />
												<Input
													id="password"
													type="password"
													className="pl-10 bg-white/10 border-white/20 text-[#EEEEEE] focus:bg-white/15 transition-all duration-300"
												/>
											</div>
										</div>
										<Button
											type="submit"
											className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/90 backdrop-blur-sm shadow-lg transition-all duration-300"
											disabled={isLoading}
										>
											{isLoading ? "Loading..." : "Login"}
										</Button>
									</form>
								</CardContent>
							</Card>
						</TabsContent>
						<TabsContent value="register">
							<Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
								<CardHeader>
									<CardTitle className="text-[#EEEEEE]">
										Create an account
									</CardTitle>
									<CardDescription className="text-[#EEEEEE]/60">
										Enter your details to get started
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form onSubmit={handleSubmit} className="space-y-4">
										<div className="space-y-2">
											<Label
												htmlFor="register-email"
												className="text-[#EEEEEE]"
											>
												Email
											</Label>
											<div className="relative">
												<Mail className="absolute left-3 top-3 h-4 w-4 text-[#76ABAE]" />
												<Input
													id="register-email"
													type="email"
													placeholder="name@example.com"
													className="pl-10 bg-white/10 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:bg-white/15 transition-all duration-300"
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="register-password"
												className="text-[#EEEEEE]"
											>
												Password
											</Label>
											<div className="relative">
												<Lock className="absolute left-3 top-3 h-4 w-4 text-[#76ABAE]" />
												<Input
													id="register-password"
													type="password"
													className="pl-10 bg-white/10 border-white/20 text-[#EEEEEE] focus:bg-white/15 transition-all duration-300"
												/>
											</div>
										</div>
										<Button
											type="submit"
											className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/90 backdrop-blur-sm shadow-lg transition-all duration-300"
											disabled={isLoading}
										>
											{isLoading ? "Loading..." : "Register"}
										</Button>
									</form>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</motion.div>
			</div>
		</div>
	);
}
