"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Upload, Save, X, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface AvatarUploadProps {
	currentAvatar?: string | null;
	onAvatarUpdate?: (newAvatarUrl: string) => void;
}

export function AvatarUpload({
	currentAvatar,
	onAvatarUpdate,
}: AvatarUploadProps) {
	const [avatarUrl, setAvatarUrl] = useState("");
	const [previewUrl, setPreviewUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [showForm, setShowForm] = useState(false);
	const { update } = useSession();

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const url = e.target.value;
		setAvatarUrl(url);
		setError("");

		// Update preview if it looks like a valid URL
		if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
			setPreviewUrl(url);
		} else {
			setPreviewUrl("");
		}
	};

	const handleSave = async () => {
		if (!avatarUrl) {
			setError("Please enter an avatar URL");
			return;
		}

		// Validate URL format
		try {
			new URL(avatarUrl);
		} catch {
			setError("Please enter a valid URL");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const response = await fetch("/api/user/update-avatar", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ avatarUrl }),
			});

			if (response.ok) {
				const data = await response.json();
				// Update the session to reflect the new avatar
				await update({ trigger: "update" });
				onAvatarUpdate?.(data.avatarUrl);
				setShowForm(false);
				setAvatarUrl("");
				setPreviewUrl("");
			} else {
				const errorData = await response.json();
				setError(errorData.error || "Failed to update avatar");
			}
		} catch (error) {
			setError("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setShowForm(false);
		setAvatarUrl("");
		setPreviewUrl("");
		setError("");
	};

	if (!showForm) {
		return (
			<div className="flex items-center space-x-4">
				<Avatar src={currentAvatar} alt="Profile" size="lg" />
				<div className="flex flex-col space-y-2">
					<p className="text-[#EEEEEE] font-medium">Profile Picture</p>
					<Button
						onClick={() => setShowForm(true)}
						variant="outline"
						className="border-[#76ABAE] text-[#76ABAE] hover:bg-[#76ABAE]/10"
						size="sm"
					>
						<Upload className="h-4 w-4 mr-2" />
						{currentAvatar ? "Change Avatar" : "Add Avatar"}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
			<CardHeader>
				<CardTitle className="text-[#EEEEEE] flex items-center gap-2">
					<Upload className="h-5 w-5" />
					Update Profile Picture
				</CardTitle>
				<CardDescription className="text-[#EEEEEE]/60">
					Enter a URL for your profile picture
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center space-x-4">
					<Avatar
						src={previewUrl || currentAvatar}
						alt="Profile Preview"
						size="lg"
					/>
					<div className="flex-1 space-y-2">
						<Input
							type="url"
							placeholder="https://example.com/your-avatar.jpg"
							value={avatarUrl}
							onChange={handleUrlChange}
							className="bg-white/10 border-white/20 text-[#EEEEEE] placeholder-[#EEEEEE]/40"
						/>
						<p className="text-xs text-[#EEEEEE]/60">
							Supported formats: JPG, PNG, GIF, WebP
						</p>
					</div>
				</div>

				{error && (
					<div className="flex items-center space-x-2 text-red-400 text-sm">
						<AlertCircle className="h-4 w-4" />
						<span>{error}</span>
					</div>
				)}

				<div className="flex space-x-3">
					<Button
						onClick={handleSave}
						disabled={isLoading || !avatarUrl}
						className="bg-[#76ABAE] hover:bg-[#76ABAE]/90 text-white"
					>
						<Save className="h-4 w-4 mr-2" />
						{isLoading ? "Saving..." : "Save Avatar"}
					</Button>
					<Button
						onClick={handleCancel}
						variant="outline"
						className="border-white/20 text-[#EEEEEE] hover:bg-white/10"
					>
						<X className="h-4 w-4 mr-2" />
						Cancel
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
