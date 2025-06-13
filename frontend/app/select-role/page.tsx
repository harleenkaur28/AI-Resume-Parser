"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Users, UserCheck } from "lucide-react";

export default function SelectRolePage() {
	const { data: session, update } = useSession();
	const [selectedRole, setSelectedRole] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	useEffect(() => {
		// If user already has a role, redirect to dashboard
		if (session?.user && (session.user as any).role) {
			router.push("/dashboard");
		}
	}, [session, router]);

	const handleRoleSelection = async () => {
		if (!selectedRole) {
			setError("Please select a role");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const response = await fetch("/api/auth/update-role", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ roleId: selectedRole }),
			});

			if (response.ok) {
				// Update the session with trigger to force token refresh
				await update({ trigger: "update" });
				// Small delay to ensure session is updated
				setTimeout(() => {
					router.push("/dashboard");
				}, 100);
			} else {
				const errorData = await response.json();
				setError(errorData.error || "Failed to update role");
			}
		} catch (error) {
			setError("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (!session) {
		router.push("/auth");
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] flex items-center justify-center">
			<div className="container mx-auto px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="max-w-md mx-auto"
				>
					<Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
						<CardHeader>
							<CardTitle className="text-[#EEEEEE] text-center">
								Select Your Role
							</CardTitle>
							<CardDescription className="text-[#EEEEEE]/60 text-center">
								Choose how you'll be using the platform
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
								<div className="space-y-4">
									<div className="flex items-start space-x-3 cursor-pointer group">
										<RadioGroupItem
											value="user"
											id="user-role"
											className="border-[#76ABAE] text-[#76ABAE] mt-1"
										/>
										<div className="flex-1">
											<Label
												htmlFor="user-role"
												className="text-[#EEEEEE] group-hover:text-[#76ABAE] transition-colors cursor-pointer flex items-center gap-2"
											>
												<Users className="h-4 w-4" />
												User
											</Label>
											<p className="text-sm text-[#EEEEEE]/60 mt-1">
												Looking for job opportunities, resume analysis, and
												career guidance
											</p>
										</div>
									</div>

									<div className="flex items-start space-x-3 cursor-pointer group">
										<RadioGroupItem
											value="admin"
											id="admin-role"
											className="border-[#76ABAE] text-[#76ABAE] mt-1"
										/>
										<div className="flex-1">
											<Label
												htmlFor="admin-role"
												className="text-[#EEEEEE] group-hover:text-[#76ABAE] transition-colors cursor-pointer flex items-center gap-2"
											>
												<UserCheck className="h-4 w-4" />
												Recruiter
											</Label>
											<p className="text-sm text-[#EEEEEE]/60 mt-1">
												Hiring talent, managing recruitment processes, and
												accessing candidate profiles
											</p>
										</div>
									</div>
								</div>
							</RadioGroup>

							{error && (
								<p className="text-red-400 text-sm text-center">{error}</p>
							)}

							<Button
								onClick={handleRoleSelection}
								disabled={isLoading || !selectedRole}
								className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/90 backdrop-blur-sm shadow-lg transition-all duration-300"
							>
								{isLoading ? "Saving..." : "Continue"}
							</Button>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}
