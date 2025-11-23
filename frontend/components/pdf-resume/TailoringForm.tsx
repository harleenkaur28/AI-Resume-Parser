import { Briefcase } from "lucide-react";
import { Label } from "@/components/ui/label";

interface TailoringFormProps {
	useTailoring: boolean;
	setUseTailoring: (value: boolean) => void;
	jobRole: string;
	setJobRole: (value: string) => void;
	companyName: string;
	setCompanyName: (value: string) => void;
	companyWebsite: string;
	setCompanyWebsite: (value: string) => void;
	jobDescription: string;
	setJobDescription: (value: string) => void;
}

export default function TailoringForm({
	useTailoring,
	setUseTailoring,
	jobRole,
	setJobRole,
	companyName,
	setCompanyName,
	companyWebsite,
	setCompanyWebsite,
	jobDescription,
	setJobDescription,
}: TailoringFormProps) {
	return (
		<div className="space-y-4">
			{/* Section Header */}
			<div className="flex items-center gap-3 pb-2 border-b border-white/10">
				<div className="flex items-center justify-center w-8 h-8 bg-[#76ABAE]/10 rounded-lg">
					<Briefcase className="h-4 w-4 text-[#76ABAE]" />
				</div>
				<div>
					<h3 className="text-[#EEEEEE] text-lg font-semibold">
						Tailor Resume (Optional)
					</h3>
					<p className="text-[#EEEEEE]/60 text-xs">
						Customize your resume for a specific job
					</p>
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="use-tailoring"
						checked={useTailoring}
						onChange={(e) => setUseTailoring(e.target.checked)}
						className="w-4 h-4 text-[#76ABAE] bg-white/5 border-white/20 rounded focus:ring-[#76ABAE]"
					/>
					<Label
						htmlFor="use-tailoring"
						className="text-[#EEEEEE] text-sm cursor-pointer"
					>
						Enable resume tailoring for this job
					</Label>
				</div>

				{useTailoring && (
					<>
						<div>
							<Label
								htmlFor="job-role"
								className="text-[#EEEEEE] text-sm font-medium"
							>
								Job Role <span className="text-red-400">*</span>
							</Label>
							<input
								id="job-role"
								type="text"
								value={jobRole}
								onChange={(e) => setJobRole(e.target.value)}
								placeholder="e.g., Senior Software Engineer"
								className="mt-1 w-full px-4 py-3 text-sm bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#76ABAE]/50 text-[#EEEEEE] placeholder-[#EEEEEE]/40"
							/>
						</div>

						<div>
							<Label
								htmlFor="company-name"
								className="text-[#EEEEEE] text-sm font-medium"
							>
								Company Name{" "}
								<span className="text-[#EEEEEE]/40">(Optional)</span>
							</Label>
							<input
								id="company-name"
								type="text"
								value={companyName}
								onChange={(e) => setCompanyName(e.target.value)}
								placeholder="e.g., Tech Corp"
								className="mt-1 w-full px-4 py-3 text-sm bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#76ABAE]/50 text-[#EEEEEE] placeholder-[#EEEEEE]/40"
							/>
						</div>

						<div>
							<Label
								htmlFor="company-website"
								className="text-[#EEEEEE] text-sm font-medium"
							>
								Company Website{" "}
								<span className="text-[#EEEEEE]/40">(Optional)</span>
							</Label>
							<input
								id="company-website"
								type="text"
								value={companyWebsite}
								onChange={(e) => setCompanyWebsite(e.target.value)}
								placeholder="e.g., https://techcorp.com"
								className="mt-1 w-full px-4 py-3 text-sm bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#76ABAE]/50 text-[#EEEEEE] placeholder-[#EEEEEE]/40"
							/>
						</div>

						<div>
							<Label
								htmlFor="job-description"
								className="text-[#EEEEEE] text-sm font-medium"
							>
								Job Description{" "}
								<span className="text-[#EEEEEE]/40">(Optional)</span>
							</Label>
							<textarea
								id="job-description"
								value={jobDescription}
								onChange={(e) => setJobDescription(e.target.value)}
								placeholder="Paste the job description here for better tailoring..."
								className="mt-1 w-full h-32 px-4 py-3 text-sm bg-white/5 border border-white/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#76ABAE]/50 text-[#EEEEEE] placeholder-[#EEEEEE]/40"
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
