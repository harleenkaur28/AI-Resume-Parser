"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
	Upload,
	FileText,
	CheckCircle,
	AlertCircle,
	Eye,
	Lightbulb,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader, LoaderOverlay } from "./ui/loader";
import { useRouter } from "next/navigation";

interface AnalysisResult {
	success: boolean;
	message: string;
	data: {
		name: string;
		email: string;
		contact?: string;
		predicted_field: string;
		college?: string;
		skills: string[];
		upload_date: string;
	};
}

export function FileUpload() {
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [isGettingDetailedAnalysis, setIsGettingDetailedAnalysis] =
		useState(false);
	const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
		null
	);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const selectedFile = acceptedFiles[0];
		if (selectedFile) {
			setFile(selectedFile);
			setError(null);
			setAnalysisResult(null);
		}
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"application/pdf": [".pdf"],
			"text/plain": [".txt"],
		},
		maxFiles: 1,
	});

	const handleUpload = async () => {
		if (!file) return;

		setIsUploading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/analyze-resume/`,
				{
					method: "POST",
					body: formData,
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result: AnalysisResult = await response.json();
			setAnalysisResult(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to analyze resume");
		} finally {
			setIsUploading(false);
		}
	};

	const handleDetailedAnalysis = async () => {
		if (!file) return;

		setIsGettingDetailedAnalysis(true);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/comprehensive-analysis/`,
				{
					method: "POST",
					body: formData,
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			// Store the analysis data in localStorage to pass to the analysis page
			localStorage.setItem("analysisData", JSON.stringify(result.data));
			router.push("/dashboard/analysis/detailed");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to get detailed analysis"
			);
			setIsGettingDetailedAnalysis(false);
		}
	};

	const handleGetTips = () => {
		const jobCategory = analysisResult?.data.predicted_field || "";
		const skills = analysisResult?.data.skills.join(",") || "";
		router.push(
			`/dashboard/tips?category=${encodeURIComponent(
				jobCategory
			)}&skills=${encodeURIComponent(skills)}`
		);
	};

	return (
		<>
			<AnimatePresence>
				{isGettingDetailedAnalysis && (
					<LoaderOverlay
						text="Performing detailed analysis..."
						variant="default"
						size="xl"
					/>
				)}
			</AnimatePresence>

			<div className="w-full max-w-2xl mx-auto space-y-6">
				{!analysisResult && (
					<Card className="backdrop-blur-lg bg-white/5 border-white/10">
						<CardContent className="p-8">
							<div
								{...getRootProps()}
								className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
									isDragActive
										? "border-[#76ABAE] bg-[#76ABAE]/10"
										: "border-white/20 hover:border-[#76ABAE]/50"
								}`}
							>
								<input {...getInputProps()} />
								<Upload className="mx-auto h-12 w-12 text-[#76ABAE] mb-4" />
								{isDragActive ? (
									<p className="text-[#EEEEEE]">Drop the file here...</p>
								) : (
									<div>
										<p className="text-[#EEEEEE] text-lg mb-2">
											Drag & drop your resume here
										</p>
										<p className="text-[#EEEEEE]/60">
											or click to select a file
										</p>
										<p className="text-[#EEEEEE]/40 text-sm mt-2">
											Supports PDF and TXT files
										</p>
									</div>
								)}
							</div>

							{file && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className="mt-4 p-4 bg-white/5 rounded-lg"
								>
									<div className="flex items-center space-x-3">
										<FileText className="h-8 w-8 text-[#76ABAE]" />
										<div>
											<p className="text-[#EEEEEE] font-medium">{file.name}</p>
											<p className="text-[#EEEEEE]/60 text-sm">
												{(file.size / 1024).toFixed(1)} KB
											</p>
										</div>
									</div>
									<Button
										onClick={handleUpload}
										disabled={isUploading}
										className="w-full mt-4 bg-[#76ABAE] hover:bg-[#76ABAE]/90"
									>
										{isUploading ? (
											<div className="flex items-center space-x-2">
												<Loader variant="spinner" size="sm" />
												<span>Analyzing...</span>
											</div>
										) : (
											"Analyze Resume"
										)}
									</Button>
								</motion.div>
							)}

							{error && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-2"
								>
									<AlertCircle className="h-5 w-5 text-red-400" />
									<p className="text-red-400">{error}</p>
								</motion.div>
							)}
						</CardContent>
					</Card>
				)}

				{analysisResult && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-6"
					>
						<Card className="backdrop-blur-lg bg-white/5 border-white/10">
							<CardContent className="p-6">
								<div className="flex items-center space-x-3 mb-4">
									<CheckCircle className="h-6 w-6 text-green-400" />
									<h3 className="text-xl font-semibold text-[#EEEEEE]">
										Analysis Complete!
									</h3>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
									<div>
										<p className="text-[#EEEEEE]/60 text-sm">Name</p>
										<p className="text-[#EEEEEE] font-medium">
											{analysisResult.data.name}
										</p>
									</div>
									<div>
										<p className="text-[#EEEEEE]/60 text-sm">Email</p>
										<p className="text-[#EEEEEE] font-medium">
											{analysisResult.data.email}
										</p>
									</div>
									<div>
										<p className="text-[#EEEEEE]/60 text-sm">Predicted Field</p>
										<Badge className="bg-[#76ABAE]/20 text-[#76ABAE] hover:bg-[#76ABAE]/30">
											{analysisResult.data.predicted_field}
										</Badge>
									</div>
									{analysisResult.data.contact && (
										<div>
											<p className="text-[#EEEEEE]/60 text-sm">Contact</p>
											<p className="text-[#EEEEEE] font-medium">
												{analysisResult.data.contact}
											</p>
										</div>
									)}
								</div>

								{analysisResult.data.skills.length > 0 && (
									<div className="mb-6">
										<p className="text-[#EEEEEE]/60 text-sm mb-2">
											Skills Detected
										</p>
										<div className="flex flex-wrap gap-2">
											{analysisResult.data.skills
												.slice(0, 6)
												.map((skill, index) => (
													<Badge
														key={index}
														className="bg-[#76ABAE]/10 text-[#76ABAE] border border-[#76ABAE]/30"
													>
														{skill}
													</Badge>
												))}
											{analysisResult.data.skills.length > 6 && (
												<Badge className="bg-white/10 text-[#EEEEEE]/60">
													+{analysisResult.data.skills.length - 6} more
												</Badge>
											)}
										</div>
									</div>
								)}

								<div className="flex flex-col sm:flex-row gap-3">
									<Button
										onClick={handleDetailedAnalysis}
										disabled={isGettingDetailedAnalysis}
										className="flex-1 bg-[#76ABAE] hover:bg-[#76ABAE]/90"
									>
										{isGettingDetailedAnalysis ? (
											<div className="flex items-center space-x-2">
												<Loader variant="spinner" size="sm" />
												<span>Loading...</span>
											</div>
										) : (
											<>
												<Eye className="mr-2 h-4 w-4" />
												View Detailed Analysis
											</>
										)}
									</Button>
									<Button
										onClick={handleGetTips}
										variant="outline"
										className="flex-1 border-[#76ABAE]/30 text-[#76ABAE] hover:bg-[#76ABAE]/10"
									>
										<Lightbulb className="mr-2 h-4 w-4" />
										Get Career Tips
									</Button>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}
			</div>
		</>
	);
}
