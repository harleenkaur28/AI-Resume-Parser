import {
	Upload,
	CheckCircle,
	FileText,
	ChevronDown,
	User,
	Calendar,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/loader";
import { useState } from "react";

interface UserResume {
	id: string;
	customName: string;
	uploadDate: string;
	candidateName?: string;
	predictedField?: string;
}

interface ResumeSourceSelectorProps {
	inputMode: "file" | "resumeId";
	setInputMode: (mode: "file" | "resumeId") => void;
	resumeFile: File | null;
	handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
	userResumes: UserResume[];
	selectedResumeId: string;
	handleResumeSelection: (resumeId: string) => void;
	isLoadingResumes: boolean;
}

export default function ResumeSourceSelector({
	inputMode,
	setInputMode,
	resumeFile,
	handleFileUpload,
	userResumes,
	selectedResumeId,
	handleResumeSelection,
	isLoadingResumes,
}: ResumeSourceSelectorProps) {
	const [showResumeDropdown, setShowResumeDropdown] = useState(false);

	return (
		<div className="space-y-3">
			{/* Resume Selection Mode Toggle */}
			<div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
				<button
					onClick={() => setInputMode("resumeId")}
					className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
						inputMode === "resumeId"
							? "bg-[#76ABAE] text-white shadow-lg"
							: "text-[#EEEEEE]/70 hover:text-[#EEEEEE] hover:bg-white/10"
					}`}
				>
					Use Existing Resume
				</button>
				<button
					onClick={() => setInputMode("file")}
					className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
						inputMode === "file"
							? "bg-[#76ABAE] text-white shadow-lg"
							: "text-[#EEEEEE]/70 hover:text-[#EEEEEE] hover:bg-white/10"
					}`}
				>
					Upload New Resume
				</button>
			</div>

			{/* Resume Selection */}
			{inputMode === "resumeId" ? (
				<div>
					<Label className="text-[#EEEEEE] text-sm font-medium flex items-center">
						<FileText className="h-4 w-4 mr-2 text-[#76ABAE]" />
						Select Resume *
					</Label>
					<div className="relative mt-2">
						<button
							onClick={() => setShowResumeDropdown(!showResumeDropdown)}
							className="relative flex items-center justify-between w-full h-12 px-4 border border-white/20 rounded-xl bg-gradient-to-br from-white/5 to-white/10 hover:from-[#76ABAE]/10 hover:to-[#76ABAE]/5 transition-all duration-300 cursor-pointer group"
						>
							<div className="flex items-center space-x-3">
								<FileText className="h-4 w-4 text-[#76ABAE]" />
								<div className="text-left">
									{selectedResumeId ? (
										<div>
											<p className="text-[#EEEEEE] text-sm font-medium">
												{
													userResumes.find((r) => r.id === selectedResumeId)
														?.customName
												}
											</p>
											<p className="text-[#EEEEEE]/60 text-xs">
												{userResumes.find((r) => r.id === selectedResumeId)
													?.predictedField || "Resume Selected"}
											</p>
										</div>
									) : (
										<p className="text-[#EEEEEE]/50 text-sm">
											{isLoadingResumes
												? "Loading resumes..."
												: "Choose a resume"}
										</p>
									)}
								</div>
							</div>
							<ChevronDown
								className={`h-4 w-4 text-[#EEEEEE]/60 transition-transform duration-200 ${
									showResumeDropdown ? "rotate-180" : ""
								}`}
							/>
						</button>

						{/* Dropdown */}
						<AnimatePresence>
							{showResumeDropdown && (
								<motion.div
									initial={{ opacity: 0, y: -10, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -10, scale: 0.95 }}
									transition={{ duration: 0.2 }}
									className="absolute top-full mt-2 w-full bg-[#31363F] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
								>
									{isLoadingResumes ? (
										<div className="p-4 text-center">
											<Loader
												variant="spinner"
												size="sm"
												className="text-[#76ABAE]"
											/>
										</div>
									) : userResumes.length > 0 ? (
										<div className="max-h-64 overflow-y-auto">
											{userResumes.map((resume) => (
												<button
													key={resume.id}
													onClick={() => {
														handleResumeSelection(resume.id);
														setShowResumeDropdown(false);
													}}
													className="w-full p-3 text-left hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
												>
													<div className="flex items-center space-x-3">
														<FileText className="h-4 w-4 text-[#76ABAE] flex-shrink-0" />
														<div className="flex-1 min-w-0">
															<p className="text-[#EEEEEE] text-sm font-medium truncate">
																{resume.customName}
															</p>
															<div className="flex items-center space-x-2 mt-1">
																{resume.candidateName && (
																	<div className="flex items-center space-x-1">
																		<User className="h-3 w-3 text-[#EEEEEE]/40" />
																		<span className="text-[#EEEEEE]/60 text-xs">
																			{resume.candidateName}
																		</span>
																	</div>
																)}
																{resume.predictedField && (
																	<span className="px-2 py-0.5 bg-[#76ABAE]/20 text-[#76ABAE] text-xs rounded-full">
																		{resume.predictedField}
																	</span>
																)}
															</div>
															<div className="flex items-center space-x-1 mt-1">
																<Calendar className="h-3 w-3 text-[#EEEEEE]/40" />
																<span className="text-[#EEEEEE]/40 text-xs">
																	{new Date(
																		resume.uploadDate
																	).toLocaleDateString()}
																</span>
															</div>
														</div>
													</div>
												</button>
											))}
										</div>
									) : (
										<div className="p-4 text-center text-[#EEEEEE]/60 text-sm">
											No resumes found. Upload one to get started!
										</div>
									)}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			) : (
				<div>
					<Label
						htmlFor="file-upload"
						className="text-[#EEEEEE] text-sm font-medium flex items-center"
					>
						<FileText className="h-4 w-4 mr-2 text-[#76ABAE]" />
						Resume File *
					</Label>
					<div className="relative mt-2">
						<Input
							id="file-upload"
							type="file"
							accept=".pdf,.doc,.docx,.txt,.md"
							onChange={handleFileUpload}
							className="hidden"
						/>
						<motion.label
							htmlFor="file-upload"
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.99 }}
							className="relative flex items-center justify-center w-full h-28 border-2 border-dashed border-white/20 rounded-xl bg-gradient-to-br from-white/5 to-white/10 hover:from-[#76ABAE]/10 hover:to-[#76ABAE]/5 transition-all duration-500 cursor-pointer group overflow-hidden"
						>
							{/* Animated background gradient */}
							<div className="absolute inset-0 bg-gradient-to-r from-[#76ABAE]/0 via-[#76ABAE]/5 to-[#76ABAE]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

							<div className="relative z-10 text-center">
								{resumeFile ? (
									<motion.div
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										className="flex flex-col items-center"
									>
										<div className="relative mb-2">
											<div className="absolute inset-0 bg-[#76ABAE]/20 rounded-full blur-lg"></div>
											<CheckCircle className="relative h-6 w-6 text-[#76ABAE]" />
										</div>
										<p className="text-[#EEEEEE] text-sm font-medium mb-1 max-w-44 truncate">
											{resumeFile?.name}
										</p>
										<p className="text-[#76ABAE] text-xs font-medium">
											✓ Ready for processing
										</p>
									</motion.div>
								) : (
									<motion.div
										className="flex flex-col items-center"
										whileHover={{ y: -1 }}
										transition={{ duration: 0.2 }}
									>
										<div className="relative mb-2">
											<div className="absolute inset-0 bg-[#76ABAE]/10 rounded-full blur-lg group-hover:bg-[#76ABAE]/20 transition-colors duration-500"></div>
											<Upload className="relative h-6 w-6 text-[#EEEEEE]/60 group-hover:text-[#76ABAE] transition-colors duration-300" />
										</div>
										<p className="text-[#EEEEEE] text-sm font-medium mb-1">
											Upload Resume
										</p>
										<div className="flex items-center space-x-2 text-xs text-[#EEEEEE]/50 mt-2">
											<span className="px-2 py-1 bg-white/10 rounded-full">
												PDF
											</span>
											<span className="px-2 py-1 bg-white/10 rounded-full">
												DOC
											</span>
											<span className="px-2 py-1 bg-white/10 rounded-full">
												TXT
											</span>
											<span className="px-2 py-1 bg-white/10 rounded-full">
												MD
											</span>
										</div>
									</motion.div>
								)}
							</div>
						</motion.label>
					</div>
				</div>
			)}
		</div>
	);
}
