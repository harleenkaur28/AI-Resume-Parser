"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building } from "lucide-react";
import { motion } from "framer-motion";

interface InterviewDetailsFormProps {
	formData: any;
	handleInputChange: (field: string, value: string | number) => void;
}

export default function InterviewDetailsForm({
	formData,
	handleInputChange,
}: InterviewDetailsFormProps) {
	return (
		<>
			{/* Role & Company */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<Label
						htmlFor="role"
						className="text-[#EEEEEE] mb-2 block font-medium text-sm"
					>
						Role *
					</Label>
					<Input
						id="role"
						placeholder="Software Engineer"
						value={formData.role}
						onChange={(e) => handleInputChange("role", e.target.value)}
						className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 hover:bg-white/10 transition-all duration-300 focus:border-[#76ABAE] focus:ring-2 focus:ring-[#76ABAE]/20 text-sm"
					/>
				</div>
				<div>
					<Label
						htmlFor="company"
						className="text-[#EEEEEE] mb-2 flex items-center font-medium text-sm"
					>
						<Building className="mr-1 h-3 w-3 text-[#76ABAE]" />
						Company *
					</Label>
					<Input
						id="company"
						placeholder="Tech Corp"
						value={formData.company}
						onChange={(e) => handleInputChange("company", e.target.value)}
						className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 hover:bg-white/10 transition-all duration-300 focus:border-[#76ABAE] focus:ring-2 focus:ring-[#76ABAE]/20 text-sm"
					/>
				</div>
			</div>
			{/* Word Limit */}
			<div>
				<Label
					htmlFor="word_limit"
					className="text-[#EEEEEE] mb-2 block font-medium text-sm"
				>
					Word Limit ({formData.word_limit} words)
				</Label>
				<Input
					id="word_limit"
					type="number"
					min="50"
					max="500"
					value={formData.word_limit}
					onChange={(e) =>
						handleInputChange("word_limit", parseInt(e.target.value) || 150)
					}
					className="bg-white/5 border-white/20 text-[#EEEEEE] hover:bg-white/10 transition-all duration-300 focus:border-[#76ABAE] focus:ring-2 focus:ring-[#76ABAE]/20 text-sm"
				/>
			</div>
			{/* Company Knowledge */}
			<div>
				<Label
					htmlFor="user_company_knowledge"
					className="text-[#EEEEEE] mb-2 block font-medium text-sm"
				>
					Company Knowledge{" "}
					<span className="text-[#EEEEEE]/60">(Optional)</span>
				</Label>
				<textarea
					id="user_company_knowledge"
					placeholder="What you know about the company..."
					value={formData.user_company_knowledge}
					onChange={(e) =>
						handleInputChange("user_company_knowledge", e.target.value)
					}
					className="w-full h-20 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 resize-none hover:bg-white/10 transition-all duration-300 focus:border-[#76ABAE] focus:ring-2 focus:ring-[#76ABAE]/20 text-sm"
				/>
			</div>
			{/* Company URL */}
			<div>
				<Label
					htmlFor="company_url"
					className="text-[#EEEEEE] mb-2 block font-medium text-sm"
				>
					Company Website <span className="text-[#EEEEEE]/60">(Optional)</span>
				</Label>
				<Input
					id="company_url"
					placeholder="https://company.com"
					value={formData.company_url}
					onChange={(e) => handleInputChange("company_url", e.target.value)}
					className="bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 hover:bg-white/10 transition-all duration-300 focus:border-[#76ABAE] focus:ring-2 focus:ring-[#76ABAE]/20 text-sm"
				/>
			</div>
		</>
	);
}
