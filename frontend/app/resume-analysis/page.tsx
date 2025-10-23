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

											{/* Links */}
											{(analysisResult.data.analysis.linkedin ||
												analysisResult.data.analysis.github ||
												analysisResult.data.analysis.blog ||
												analysisResult.data.analysis.portfolio) && (
												<div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
													{analysisResult.data.analysis.linkedin && (
														<div>
															<p className="text-sm text-gray-600">LinkedIn</p>
															<a
																href={analysisResult.data.analysis.linkedin}
																target="_blank"
																rel="noopener noreferrer"
																className="font-medium text-blue-600 hover:underline break-all"
															>
																{analysisResult.data.analysis.linkedin}
															</a>
														</div>
													)}
													{analysisResult.data.analysis.github && (
														<div>
															<p className="text-sm text-gray-600">GitHub</p>
															<a
																href={analysisResult.data.analysis.github}
																target="_blank"
																rel="noopener noreferrer"
																className="font-medium text-blue-600 hover:underline break-all"
															>
																{analysisResult.data.analysis.github}
															</a>
														</div>
													)}
													{analysisResult.data.analysis.blog && (
														<div>
															<p className="text-sm text-gray-600">Blog</p>
															<a
																href={analysisResult.data.analysis.blog}
																target="_blank"
																rel="noopener noreferrer"
																className="font-medium text-blue-600 hover:underline break-all"
															>
																{analysisResult.data.analysis.blog}
															</a>
														</div>
													)}
													{analysisResult.data.analysis.portfolio && (
														<div>
															<p className="text-sm text-gray-600">Portfolio</p>
															<a
																href={analysisResult.data.analysis.portfolio}
																target="_blank"
																rel="noopener noreferrer"
																className="font-medium text-blue-600 hover:underline break-all"
															>
																{analysisResult.data.analysis.portfolio}
															</a>
														</div>
													)}
												</div>
											)}
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
																{/* Project Links */}
																{(project.live_link || project.repo_link) && (
																	<div className="flex flex-wrap gap-3 mb-2">
																		{project.live_link && (
																			<a
																				href={project.live_link}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
																			>
																				Live Demo
																			</a>
																		)}
																		{project.repo_link && (
																			<a
																				href={project.repo_link}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-gray-800 rounded hover:bg-gray-900"
																			>
																				Source Code
																			</a>
																		)}
																	</div>
																)}
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

									{/* Publications */}
									{analysisResult.data.analysis.publications &&
										analysisResult.data.analysis.publications.length > 0 && (
											<div>
												<h3 className="text-lg font-semibold mb-3">
													Publications
												</h3>
												<div className="space-y-4">
													{analysisResult.data.analysis.publications.map(
														(publication: any, index: number) => (
															<div
																key={index}
																className="p-4 border border-gray-200 rounded-lg"
															>
																<h4 className="font-semibold">
																	{publication.title}
																</h4>
																<div className="text-sm text-gray-600 space-y-1">
																	{publication.authors && (
																		<p>
																			<strong>Authors:</strong>{" "}
																			{publication.authors}
																		</p>
																	)}
																	{publication.journal_conference && (
																		<p>
																			<strong>Journal/Conference:</strong>{" "}
																			{publication.journal_conference}
																		</p>
																	)}
																	{publication.year && (
																		<p>
																			<strong>Year:</strong> {publication.year}
																		</p>
																	)}
																	{publication.doi && (
																		<p>
																			<strong>DOI:</strong> {publication.doi}
																		</p>
																	)}
																	{publication.url && (
																		<a
																			href={publication.url}
																			target="_blank"
																			rel="noopener noreferrer"
																			className="text-blue-600 hover:underline"
																		>
																			View Publication
																		</a>
																	)}
																</div>
															</div>
														)
													)}
												</div>
											</div>
										)}

									{/* Positions of Responsibility */}
									{analysisResult.data.analysis.positionsOfResponsibility &&
										analysisResult.data.analysis.positionsOfResponsibility
											.length > 0 && (
											<div>
												<h3 className="text-lg font-semibold mb-3">
													Positions of Responsibility
												</h3>
												<div className="space-y-4">
													{analysisResult.data.analysis.positionsOfResponsibility.map(
														(position: any, index: number) => (
															<div
																key={index}
																className="p-4 border border-gray-200 rounded-lg"
															>
																<h4 className="font-semibold">
																	{position.title}
																</h4>
																<div className="text-sm text-gray-600 space-y-1">
																	<p>
																		<strong>Organization:</strong>{" "}
																		{position.organization}
																	</p>
																	{position.duration && (
																		<p>
																			<strong>Duration:</strong>{" "}
																			{position.duration}
																		</p>
																	)}
																	{position.description && (
																		<p>
																			<strong>Description:</strong>{" "}
																			{position.description}
																		</p>
																	)}
																</div>
															</div>
														)
													)}
												</div>
											</div>
										)}

									{/* Certifications */}
									{analysisResult.data.analysis.certifications &&
										analysisResult.data.analysis.certifications.length > 0 && (
											<div>
												<h3 className="text-lg font-semibold mb-3">
													Certifications
												</h3>
												<div className="space-y-4">
													{analysisResult.data.analysis.certifications.map(
														(certification: any, index: number) => (
															<div
																key={index}
																className="p-4 border border-gray-200 rounded-lg"
															>
																<h4 className="font-semibold">
																	{certification.name}
																</h4>
																<div className="text-sm text-gray-600 space-y-1">
																	<p>
																		<strong>Issuing Organization:</strong>{" "}
																		{certification.issuing_organization}
																	</p>
																	{certification.issue_date && (
																		<p>
																			<strong>Issue Date:</strong>{" "}
																			{certification.issue_date}
																		</p>
																	)}
																	{certification.expiry_date && (
																		<p>
																			<strong>Expiry Date:</strong>{" "}
																			{certification.expiry_date}
																		</p>
																	)}
																	{certification.credential_id && (
																		<p>
																			<strong>Credential ID:</strong>{" "}
																			{certification.credential_id}
																		</p>
																	)}
																	{certification.url && (
																		<a
																			href={certification.url}
																			target="_blank"
																			rel="noopener noreferrer"
																			className="text-blue-600 hover:underline"
																		>
																			View Certificate
																		</a>
																	)}
																</div>
															</div>
														)
													)}
												</div>
											</div>
										)}

									{/* Achievements */}
									{analysisResult.data.analysis.achievements &&
										analysisResult.data.analysis.achievements.length > 0 && (
											<div>
												<h3 className="text-lg font-semibold mb-3">
													Achievements
												</h3>
												<div className="space-y-4">
													{analysisResult.data.analysis.achievements.map(
														(achievement: any, index: number) => (
															<div
																key={index}
																className="p-4 border border-gray-200 rounded-lg"
															>
																<h4 className="font-semibold">
																	{achievement.title}
																</h4>
																<div className="text-sm text-gray-600 space-y-1">
																	{achievement.category && (
																		<span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs mb-2">
																			{achievement.category}
																		</span>
																	)}
																	{achievement.year && (
																		<p>
																			<strong>Year:</strong> {achievement.year}
																		</p>
																	)}
																	{achievement.description && (
																		<p>
																			<strong>Description:</strong>{" "}
																			{achievement.description}
																		</p>
																	)}
																</div>
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
