import { Settings } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ConfigurationFormProps {
	selectedTemplate: string;
	setSelectedTemplate: (value: string) => void;
	fontSize: number;
	setFontSize: (value: number) => void;
	colorScheme: string;
	setColorScheme: (value: string) => void;
}

export default function ConfigurationForm({
	selectedTemplate,
	setSelectedTemplate,
	fontSize,
	setFontSize,
	colorScheme,
	setColorScheme,
}: ConfigurationFormProps) {
	return (
		<div className="space-y-4">
			{/* Section Header */}
			<div className="flex items-center gap-3 pb-2 border-b border-white/10">
				<div className="flex items-center justify-center w-8 h-8 bg-[#76ABAE]/10 rounded-lg">
					<Settings className="h-4 w-4 text-[#76ABAE]" />
				</div>
				<div>
					<h3 className="text-[#EEEEEE] text-lg font-semibold">
						Configuration
					</h3>
					<p className="text-[#EEEEEE]/60 text-xs">
						Customize your resume appearance
					</p>
				</div>
			</div>

			<div className="space-y-4">
				{/* Template Selection */}
				<div>
					<Label
						htmlFor="template"
						className="text-[#EEEEEE] text-sm font-medium"
					>
						Template
					</Label>
					<Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
						<SelectTrigger className="mt-1 bg-white/5 border-white/20 text-[#EEEEEE] focus:ring-[#76ABAE]/50 focus:border-[#76ABAE]/50">
							<SelectValue placeholder="Select a template" />
						</SelectTrigger>
						<SelectContent className="bg-[#31363F] border-white/20">
							<SelectItem
								value="professional"
								className="text-[#EEEEEE] focus:bg-[#76ABAE]/20"
							>
								<div>
									<div className="font-medium">Professional</div>
									<div className="text-sm text-[#EEEEEE]/60">
										Clean, ATS-friendly design
									</div>
								</div>
							</SelectItem>
							<SelectItem
								value="modern"
								className="text-[#EEEEEE] focus:bg-[#76ABAE]/20"
							>
								<div>
									<div className="font-medium">Modern</div>
									<div className="text-sm text-[#EEEEEE]/60">
										Contemporary with visual elements
									</div>
								</div>
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Font Size */}
				<div>
					<Label
						htmlFor="fontSize"
						className="text-[#EEEEEE] text-sm font-medium"
					>
						Font Size: {fontSize}pt
					</Label>
					<input
						type="range"
						min="8"
						max="12"
						step="1"
						value={fontSize}
						onChange={(e) => setFontSize(parseInt(e.target.value))}
						className="mt-2 w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
					/>
				</div>

				{/* Color Scheme */}
				<div>
					<Label
						htmlFor="colorScheme"
						className="text-[#EEEEEE] text-sm font-medium"
					>
						Color Scheme
					</Label>
					<Select value={colorScheme} onValueChange={setColorScheme}>
						<SelectTrigger className="mt-1 bg-white/5 border-white/20 text-[#EEEEEE] focus:ring-[#76ABAE]/50 focus:border-[#76ABAE]/50">
							<SelectValue placeholder="Select color scheme" />
						</SelectTrigger>
						<SelectContent className="bg-[#31363F] border-white/20">
							<SelectItem
								value="default"
								className="text-[#EEEEEE] focus:bg-[#76ABAE]/20"
							>
								Default (Gray)
							</SelectItem>
							<SelectItem
								value="blue"
								className="text-[#EEEEEE] focus:bg-[#76ABAE]/20"
							>
								Professional Blue
							</SelectItem>
							<SelectItem
								value="green"
								className="text-[#EEEEEE] focus:bg-[#76ABAE]/20"
							>
								Modern Green
							</SelectItem>
							<SelectItem
								value="red"
								className="text-[#EEEEEE] focus:bg-[#76ABAE]/20"
							>
								Bold Red
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}
