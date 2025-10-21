import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeData } from "@/types/resume";

interface ResumePreviewProps {
	parsedData: ResumeData | null;
}

export default function ResumePreview({ parsedData }: ResumePreviewProps) {
	if (!parsedData) {
		return null;
	}

	return (
		<Card className="relative backdrop-blur-lg bg-white/5 border-white/10 shadow-2xl overflow-hidden">
			<CardHeader className="pb-4">
				<CardTitle className="text-[#EEEEEE] text-xl font-semibold flex items-center gap-2">
					<Eye className="h-5 w-5 text-[#76ABAE]" />
					Resume Preview
				</CardTitle>
				<p className="text-[#EEEEEE]/60 text-sm">Preview of your resume data</p>
			</CardHeader>
			<CardContent className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
				{/* Header */}
				<div className="text-center border-b border-white/10 pb-4">
					<h2 className="text-xl font-bold text-[#EEEEEE]">
						{parsedData.name}
					</h2>
					<p className="text-[#EEEEEE]/70">
						{parsedData.email} • {parsedData.contact}
					</p>
					{parsedData.predicted_field && (
						<span className="inline-block mt-2 px-3 py-1 bg-[#76ABAE]/20 text-[#76ABAE] text-xs rounded-full border border-[#76ABAE]/30">
							{parsedData.predicted_field}
						</span>
					)}
				</div>

				{/* Main content sections */}
				<div className="space-y-4 text-sm">
					{/* Education */}
					{parsedData.education?.length > 0 && (
						<div>
							<h3 className="font-semibold text-[#EEEEEE] mb-2">Education</h3>
							{parsedData.education.map((edu: any, index: number) => (
								<div key={index} className="text-[#EEEEEE]/70 mb-2">
									{edu.education_detail || edu.degree}
								</div>
							))}
						</div>
					)}

					{/* Skills */}
					{parsedData.skills_analysis?.length > 0 && (
						<div>
							<h3 className="font-semibold text-[#EEEEEE] mb-2">Skills</h3>
							<div className="flex flex-wrap gap-2">
								{parsedData.skills_analysis.map((skill: any, index: number) => (
									<span
										key={index}
										className="px-2 py-1 bg-white/10 text-[#EEEEEE]/80 text-xs rounded border border-white/20"
									>
										{skill.skill_name}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Languages */}
					{parsedData.languages?.length > 0 && (
						<div>
							<h3 className="font-semibold text-[#EEEEEE] mb-2">Languages</h3>
							<div className="flex flex-wrap gap-2">
								{parsedData.languages.map((lang: any, i: number) => (
									<span
										key={i}
										className="px-2 py-1 bg-white/10 text-[#EEEEEE]/80 text-xs rounded border border-white/20"
									>
										{lang.language || lang}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Work Experience */}
					{parsedData.work_experience?.length > 0 && (
						<div>
							<h3 className="font-semibold text-[#EEEEEE] mb-2">Experience</h3>
							{parsedData.work_experience.map((exp: any, index: number) => (
								<div key={index} className="mb-3">
									<p className="font-medium text-sm text-[#EEEEEE]">
										{exp.role} - {exp.company_and_duration || exp.company}
									</p>
									{exp.bullet_points && (
										<ul className="list-disc list-inside text-[#EEEEEE]/70 text-xs mt-1 space-y-1">
											{exp.bullet_points.map((bp: string, bi: number) => (
												<li key={bi}>{bp}</li>
											))}
										</ul>
									)}
								</div>
							))}
						</div>
					)}

					{/* Projects */}
					{parsedData.projects?.length > 0 && (
						<div>
							<h3 className="font-semibold text-[#EEEEEE] mb-2">Projects</h3>
							{parsedData.projects.map((proj: any, i: number) => (
								<div key={i} className="mb-3 text-[#EEEEEE]/70">
									<p className="font-medium text-sm text-[#EEEEEE]">
										{proj.title || proj.project_name}
									</p>
									{proj.technologies_used && (
										<p className="text-xs mt-1">
											{Array.isArray(proj.technologies_used)
												? proj.technologies_used.join(", ")
												: proj.technologies_used}
										</p>
									)}
									{proj.description && (
										<p className="text-xs mt-1">{proj.description}</p>
									)}
								</div>
							))}
						</div>
					)}

					{/* Publications */}
					{parsedData.publications?.length > 0 && (
						<div>
							<h3 className="font-semibold text-[#EEEEEE] mb-2">
								Publications
							</h3>
							{parsedData.publications.map((pub: any, i: number) => (
								<div key={i} className="mb-2 text-[#EEEEEE]/70">
									<p className="font-medium text-sm text-[#EEEEEE]">
										{pub.title}
									</p>
									<p className="text-xs">
										{pub.authors} — {pub.journal_conference || pub.venue} (
										{pub.year})
									</p>
									{pub.doi && <p className="text-xs">DOI: {pub.doi}</p>}
									{pub.url && (
										<a
											href={pub.url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-[#76ABAE] text-xs hover:underline"
										>
											Link
										</a>
									)}
								</div>
							))}
						</div>
					)}

					{/* Positions of responsibility */}
					{parsedData.positions_of_responsibility?.length > 0 && (
						<div>
							<h3 className="font-semibold text-[#EEEEEE] mb-2">Positions</h3>
							{parsedData.positions_of_responsibility.map(
								(pos: any, i: number) => (
									<div key={i} className="mb-2 text-[#EEEEEE]/70">
										<p className="font-medium text-sm text-[#EEEEEE]">
											{pos.title || pos.role} — {pos.organization}
										</p>
										{pos.duration && <p className="text-xs">{pos.duration}</p>}
										{pos.description && (
											<p className="text-xs mt-1">{pos.description}</p>
										)}
									</div>
								)
							)}
						</div>
					)}

					{/* Certifications */}
					{parsedData.certifications?.length > 0 && (
						<div>
							<h3 className="font-semibold text-[#EEEEEE] mb-2">
								Certifications
							</h3>
							{parsedData.certifications.map((cert: any, i: number) => (
								<div key={i} className="mb-2 text-[#EEEEEE]/70">
									<p className="font-medium text-sm text-[#EEEEEE]">
										{cert.name}
									</p>
									<p className="text-xs">
										{cert.issuing_organization || cert.issuer} —{" "}
										{cert.issue_date}
										{cert.expiry_date ? ` to ${cert.expiry_date}` : ""}
									</p>
									{cert.credential_id && (
										<p className="text-xs">ID: {cert.credential_id}</p>
									)}
								</div>
							))}
						</div>
					)}

					{/* Achievements */}
					{parsedData.achievements?.length > 0 && (
						<div>
							<h3 className="font-semibold text-[#EEEEEE] mb-2">
								Achievements
							</h3>
							{parsedData.achievements.map((ach: any, i: number) => (
								<div key={i} className="mb-2 text-[#EEEEEE]/70">
									<p className="font-medium text-sm text-[#EEEEEE]">
										{typeof ach === "string" ? ach : ach.title}
										{ach.year ? ` — ${ach.year}` : ""}
									</p>
									{ach.description && (
										<p className="text-xs">{ach.description}</p>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
