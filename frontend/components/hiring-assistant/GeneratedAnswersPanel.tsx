"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Download, Copy } from "lucide-react";
import { motion } from "framer-motion";

interface GeneratedAnswersPanelProps {
	generatedAnswers: { [key: string]: string } | null;
	formData: any;
	copyToClipboard: (text: string) => void;
	downloadAsText: () => void;
}

export default function GeneratedAnswersPanel({
	generatedAnswers,
	formData,
	copyToClipboard,
	downloadAsText,
}: GeneratedAnswersPanelProps) {
	return (
		<Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500 flex-1 flex flex-col max-h-[calc(100vh-16rem)]">
			<CardHeader className="pb-4 flex-shrink-0">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-[#EEEEEE] text-lg md:text-xl font-semibold flex items-center">
							<Users className="mr-2 h-5 w-5 text-[#76ABAE]" />
							Generated Answers
						</CardTitle>
						<p className="text-[#EEEEEE]/60 text-sm mt-1">
							Your personalized interview answers will appear here
						</p>
					</div>
					{generatedAnswers && (
						<Button
							size="sm"
							variant="ghost"
							onClick={downloadAsText}
							className="text-[#76ABAE] hover:text-[#76ABAE]/80 hover:bg-[#76ABAE]/20 border border-[#76ABAE]/20 hover:border-[#76ABAE]/40 transition-all duration-300 h-8 w-8 p-0"
						>
							<Download className="h-3 w-3" />
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent className="flex-1 flex flex-col overflow-hidden">
				{generatedAnswers ? (
					<div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
						{Object.entries(generatedAnswers).map(
							([question, answer], index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: index * 0.1 }}
									className="border-b border-white/10 pb-4 last:border-b-0"
								>
									<div className="flex items-start justify-between mb-2">
										<h4 className="text-[#EEEEEE] font-medium text-sm leading-relaxed pr-2">
											<span className="inline-block bg-gradient-to-r from-[#76ABAE] to-[#76ABAE]/80 text-white text-xs px-2 py-1 rounded-full mr-2 font-medium">
												Q{index + 1}
											</span>
											{question}
										</h4>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => copyToClipboard(answer)}
											className="text-[#76ABAE] hover:text-[#76ABAE]/80 hover:bg-[#76ABAE]/20 border border-[#76ABAE]/20 hover:border-[#76ABAE]/40 transition-all duration-300 flex-shrink-0 h-6 w-6 p-0"
										>
											<Copy className="h-3 w-3" />
										</Button>
									</div>
									<div className="p-3 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg backdrop-blur-sm">
										<p className="text-[#EEEEEE]/90 text-sm leading-relaxed">
											{answer}
										</p>
									</div>
								</motion.div>
							)
						)}
					</div>
				) : (
					<div className="flex-1 flex items-center justify-center">
						<div className="text-center">
							<motion.div
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: 0.5 }}
								className="mb-4"
							>
								<Users className="h-12 w-12 text-[#EEEEEE]/30 mx-auto" />
							</motion.div>
							<h3 className="text-[#EEEEEE]/80 text-base font-medium mb-2">
								Ready to Generate?
							</h3>
							<p className="text-[#EEEEEE]/60 text-sm leading-relaxed max-w-xs mx-auto">
								Upload your resume, add questions, and generate personalized
								answers.
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
