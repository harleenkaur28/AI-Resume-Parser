"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Briefcase, Link as LinkIcon, Building, Globe } from "lucide-react";

interface JobDescriptionFormProps {
	formData: {
		jd_text: string;
		jd_link: string;
		company_name: string;
		company_website: string;
	};
	handleInputChange: (field: string, value: string) => void;
}

export default function JobDescriptionForm({
	formData,
	handleInputChange,
}: JobDescriptionFormProps) {
	return (
		<div className="space-y-4">
			{/* Job Description Text */}
			<div className="space-y-2">
				<Label
					htmlFor="jd_text"
					className="text-[#EEEEEE] text-sm font-medium flex items-center"
				>
					<Briefcase className="h-4 w-4 mr-2 text-[#76ABAE]" />
					Job Description (Text)
				</Label>
				<Textarea
					id="jd_text"
					value={formData.jd_text}
					onChange={(e) => handleInputChange("jd_text", e.target.value)}
					placeholder="Paste the job description here..."
					rows={6}
					className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-[#EEEEEE] placeholder-[#EEEEEE]/30 focus:outline-none focus:ring-2 focus:ring-[#76ABAE] resize-none"
				/>
			</div>

			{/* OR Divider */}
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-white/10"></div>
				</div>
				<div className="relative flex justify-center text-xs">
					<span className="px-2 bg-[#31363F] text-[#EEEEEE]/60">OR</span>
				</div>
			</div>

			{/* Job Description Link */}
			<div className="space-y-2">
				<Label
					htmlFor="jd_link"
					className="text-[#EEEEEE] text-sm font-medium flex items-center"
				>
					<LinkIcon className="h-4 w-4 mr-2 text-[#76ABAE]" />
					Job Description (Link)
				</Label>
				<Input
					id="jd_link"
					type="url"
					value={formData.jd_link}
					onChange={(e) => handleInputChange("jd_link", e.target.value)}
					placeholder="https://example.com/job-posting"
					className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-[#EEEEEE] placeholder-[#EEEEEE]/30 focus:outline-none focus:ring-2 focus:ring-[#76ABAE]"
				/>
			</div>

			{/* Company Name (Optional) */}
			<div className="space-y-2">
				<Label
					htmlFor="company_name"
					className="text-[#EEEEEE] text-sm font-medium flex items-center"
				>
					<Building className="h-4 w-4 mr-2 text-[#76ABAE]" />
					Company Name{" "}
					<span className="text-[#EEEEEE]/40 ml-1">(Optional)</span>
				</Label>
				<Input
					id="company_name"
					type="text"
					value={formData.company_name}
					onChange={(e) => handleInputChange("company_name", e.target.value)}
					placeholder="e.g., Google"
					className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-[#EEEEEE] placeholder-[#EEEEEE]/30 focus:outline-none focus:ring-2 focus:ring-[#76ABAE]"
				/>
			</div>

			{/* Company Website (Optional) */}
			<div className="space-y-2">
				<Label
					htmlFor="company_website"
					className="text-[#EEEEEE] text-sm font-medium flex items-center"
				>
					<Globe className="h-4 w-4 mr-2 text-[#76ABAE]" />
					Company Website{" "}
					<span className="text-[#EEEEEE]/40 ml-1">(Optional)</span>
				</Label>
				<Input
					id="company_website"
					type="url"
					value={formData.company_website}
					onChange={(e) => handleInputChange("company_website", e.target.value)}
					placeholder="https://company.com"
					className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-[#EEEEEE] placeholder-[#EEEEEE]/30 focus:outline-none focus:ring-2 focus:ring-[#76ABAE]"
				/>
			</div>
		</div>
	);
}
