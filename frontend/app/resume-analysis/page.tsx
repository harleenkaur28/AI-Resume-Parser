"use client";

import React, { useState } from "react";
import UploadResume from "@/components/upload-resume";

export default function ResumeAnalysisPage() {
	const [analysisResult, setAnalysisResult] = useState<any>(null);
	const [error, setError] = useState<string>("");

	const handleUploadSuccess = (result: any) => {
		console.log("Upload successful:", result);
		setAnalysisResult(result);
		setError("");
	};

	const handleUploadError = (errorMessage: string) => {
		console.error("Upload error:", errorMessage);
		setError(errorMessage);
		setAnalysisResult(null);
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-3xl font-bold text-center mb-8">
						Resume Analysis
					</h1>

					{/* Upload Component */}
					<div className="mb-8">
						<UploadResume
							onSuccess={handleUploadSuccess}
							onError={handleUploadError}
						/>
					</div>

					{/* Error Display */}
					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
							<p className="text-red-800 text-sm">{error}</p>
						</div>
					)}

					{/* Analysis Results */}
					{analysisResult && (
						<div className="bg-white rounded-lg shadow-md p-6">
							<h2 className="text-2xl font-bold mb-6">Analysis Results</h2>

							{analysisResult.data.analysis && (
								<div className="space-y-6">
									{/* Basic Information */}
									<div>
										<h3 className="text-lg font-semibold mb-3">
											Basic Information
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<p className="text-sm text-gray-600">Name</p>
												<p className="font-medium">
													{analysisResult.data.analysis.name || "Not specified"}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-600">Email</p>
												<p className="font-medium">
													{analysisResult.data.analysis.email ||
														"Not specified"}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-600">Contact</p>
												<p className="font-medium">
													{analysisResult.data.analysis.contact ||
														"Not specified"}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-600">Predicted Field</p>
												<p className="font-medium">
													{analysisResult.data.analysis.predictedField ||
														"Not specified"}
												</p>
											</div>
										</div>
									</div>

									{/* Skills Analysis */}
									{analysisResult.data.analysis.skillsAnalysis &&
										analysisResult.data.analysis.skillsAnalysis.length > 0 && (
											<div>
												<h3 className="text-lg font-semibold mb-3">
													Skills Analysis
												</h3>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{analysisResult.data.analysis.skillsAnalysis.map(
														(skill: any, index: number) => (
															<div
																key={index}
																className="flex justify-between items-center p-3 bg-gray-50 rounded"
															>
																<span className="font-medium">
																	{skill.skill_name}
																</span>
																<span className="text-sm text-gray-600">
																	{skill.percentage}%
																</span>
															</div>
														)
													)}
												</div>
											</div>
										)}

									{/* Recommended Roles */}
									{analysisResult.data.analysis.recommendedRoles &&
										analysisResult.data.analysis.recommendedRoles.length >
											0 && (
											<div>
												<h3 className="text-lg font-semibold mb-3">
													Recommended Roles
												</h3>
												<div className="flex flex-wrap gap-2">
													{analysisResult.data.analysis.recommendedRoles.map(
														(role: string, index: number) => (
															<span
																key={index}
																className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
															>
																{role}
															</span>
														)
													)}
												</div>
											</div>
										)}

									{/* Work Experience */}
									{analysisResult.data.analysis.workExperience &&
										analysisResult.data.analysis.workExperience.length > 0 && (
											<div>
												<h3 className="text-lg font-semibold mb-3">
													Work Experience
												</h3>
												<div className="space-y-4">
													{analysisResult.data.analysis.workExperience.map(
														(exp: any, index: number) => (
															<div
																key={index}
																className="p-4 border border-gray-200 rounded-lg"
															>
																<h4 className="font-semibold">{exp.role}</h4>
																<p className="text-sm text-gray-600 mb-2">
																	{exp.company_and_duration}
																</p>
																{exp.bullet_points &&
																	exp.bullet_points.length > 0 && (
																		<ul className="list-disc list-inside text-sm space-y-1">
																			{exp.bullet_points.map(
																				(point: string, pointIndex: number) => (
																					<li key={pointIndex}>{point}</li>
																				)
																			)}
																		</ul>
																	)}
															</div>
														)
													)}
												</div>
											</div>
										)}

									{/* Projects */}
									{analysisResult.data.analysis.projects &&
										analysisResult.data.analysis.projects.length > 0 && (
											<div>
												<h3 className="text-lg font-semibold mb-3">Projects</h3>
												<div className="space-y-4">
													{analysisResult.data.analysis.projects.map(
														(project: any, index: number) => (
															<div
																key={index}
																className="p-4 border border-gray-200 rounded-lg"
															>
																<h4 className="font-semibold">
																	{project.title}
																</h4>
																<p className="text-sm text-gray-700 mb-2">
																	{project.description}
																</p>
																{project.technologies_used &&
																	project.technologies_used.length > 0 && (
																		<div className="flex flex-wrap gap-1">
																			{project.technologies_used.map(
																				(tech: string, techIndex: number) => (
																					<span
																						key={techIndex}
																						className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
																					>
																						{tech}
																					</span>
																				)
																			)}
																		</div>
																	)}
															</div>
														)
													)}
												</div>
											</div>
										)}
								</div>
							)}

							{/* Raw Response (for debugging) */}
							<details className="mt-6">
								<summary className="cursor-pointer text-sm text-gray-600">
									View Raw Response
								</summary>
								<pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
									{JSON.stringify(analysisResult, null, 2)}
								</pre>
							</details>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
