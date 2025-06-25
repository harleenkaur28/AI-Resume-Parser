"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailDetailsFormProps {
	formData: any;
	handleInputChange: (field: string, value: string) => void;
}

export default function EmailDetailsForm({
	formData,
	handleInputChange,
}: EmailDetailsFormProps) {
	return (
		<div className="space-y-6">
			{/* Recipient Section */}
			<div className="space-y-4">
				<h3 className="text-[#EEEEEE] font-medium text-base border-b border-white/10 pb-2">
					Recipient Information
				</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label className="text-[#EEEEEE] text-sm font-medium">
							Recipient Name *
						</Label>
						<Input
							placeholder="Harleen Kaur"
							value={formData.recipient_name}
							onChange={(e) =>
								handleInputChange("recipient_name", e.target.value)
							}
							className="h-11 bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
						/>
					</div>
					<div className="space-y-2">
						<Label className="text-[#EEEEEE] text-sm font-medium">
							Position
						</Label>
						<Input
							placeholder="CEO"
							value={formData.recipient_designation}
							onChange={(e) =>
								handleInputChange("recipient_designation", e.target.value)
							}
							className="h-11 bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
						/>
					</div>
				</div>
			</div>

			{/* Company & Sender Section */}
			<div className="space-y-4">
				<h3 className="text-[#EEEEEE] font-medium text-base border-b border-white/10 pb-2">
					Company & Personal Details
				</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label className="text-[#EEEEEE] text-sm font-medium">
							Company Name *
						</Label>
						<Input
							placeholder="Tech Corp Inc."
							value={formData.company_name}
							onChange={(e) =>
								handleInputChange("company_name", e.target.value)
							}
							className="h-11 bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
						/>
					</div>
					<div className="space-y-2">
						<Label className="text-[#EEEEEE] text-sm font-medium">
							Your Name *
						</Label>
						<Input
							placeholder="Tashif"
							value={formData.sender_name}
							onChange={(e) =>
								handleInputChange("sender_name", e.target.value.toLowerCase())
							}
							className="h-11 bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label className="text-[#EEEEEE] text-sm font-medium">
						Your Goal/Desired Role
					</Label>
					<Input
						placeholder="Software Engineer Internship"
						value={formData.sender_role_or_goal}
						onChange={(e) =>
							handleInputChange("sender_role_or_goal", e.target.value)
						}
						className="h-11 bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
					/>
				</div>

				<div className="space-y-2">
					<Label className="text-[#EEEEEE] text-sm font-medium">
						Company Website (Optional)
					</Label>
					<Input
						placeholder="https://talentsync.ai"
						value={formData.company_url}
						onChange={(e) => handleInputChange("company_url", e.target.value)}
						className="h-11 bg-white/5 border-white/20 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
					/>
				</div>
			</div>

			{/* Content Section */}
			<div className="space-y-4">
				<h3 className="text-[#EEEEEE] font-medium text-base border-b border-white/10 pb-2">
					Email Content
				</h3>

				<div className="space-y-2">
					<Label className="text-[#EEEEEE] text-sm font-medium">
						Key Points to Highlight
					</Label>
					<textarea
						placeholder="Previous internship experience, relevant projects, specific skills..."
						value={formData.key_points_to_include}
						onChange={(e) =>
							handleInputChange("key_points_to_include", e.target.value)
						}
						className="w-full h-24 px-3 py-3 bg-white/5 border border-white/20 rounded-lg text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 resize-none focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
					/>
				</div>

				<div className="space-y-2">
					<Label className="text-[#EEEEEE] text-sm font-medium">
						Additional Context
					</Label>
					<textarea
						placeholder="Any specific requirements or context for the email..."
						value={formData.additional_info_for_llm}
						onChange={(e) =>
							handleInputChange("additional_info_for_llm", e.target.value)
						}
						className="w-full h-24 px-3 py-3 bg-white/5 border border-white/20 rounded-lg text-[#EEEEEE] placeholder:text-[#EEEEEE]/50 resize-none focus:border-[#76ABAE] focus:ring-1 focus:ring-[#76ABAE] transition-all"
					/>
				</div>
			</div>
		</div>
	);
}
