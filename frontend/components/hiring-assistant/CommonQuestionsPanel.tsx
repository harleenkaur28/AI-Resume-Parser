"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface CommonQuestionsPanelProps {
	commonQuestions: string[];
	addCommonQuestion: (question: string) => void;
}

export default function CommonQuestionsPanel({
	commonQuestions,
	addCommonQuestion,
}: CommonQuestionsPanelProps) {
	return (
		<Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
			<CardHeader className="pb-3">
				<CardTitle className="text-[#EEEEEE] text-lg font-semibold flex items-center">
					Quick Add Common Questions:
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
					{commonQuestions.slice(0, 5).map((question, index) => (
						<Button
							key={index}
							variant="ghost"
							size="sm"
							onClick={() => addCommonQuestion(question)}
							className="text-left justify-start text-[#EEEEEE]/80 hover:text-[#76ABAE] hover:bg-white/10 text-xs p-2 h-auto rounded-lg transition-all duration-300 border border-transparent hover:border-[#76ABAE]/30"
						>
							<Plus className="mr-2 h-3 w-3 flex-shrink-0" />
							<span className="text-left leading-relaxed truncate">
								{question}
							</span>
						</Button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
