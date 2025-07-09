"use client";

import { motion } from "framer-motion";
import { Loader } from "@/components/ui/loader";

interface LoadingOverlayProps {
	isGenerating: boolean;
	generationType: "pdf" | "latex";
}

export default function LoadingOverlay({
	isGenerating,
	generationType,
}: LoadingOverlayProps) {
	if (!isGenerating) return null;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center"
		>
			<motion.div
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.8, opacity: 0 }}
				className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 text-center max-w-sm mx-4"
			>
				<div className="relative mb-6">
					<Loader variant="pulse" size="xl" className="text-[#76ABAE]" />
				</div>
				<h3 className="text-[#EEEEEE] font-semibold text-xl mb-3">
					{generationType === "pdf"
						? "Generating PDF Resume"
						: "Generating LaTeX Code"}
				</h3>
				<p className="text-[#EEEEEE]/70 text-sm leading-relaxed">
					{generationType === "pdf"
						? "AI is processing your resume data and creating a professional PDF document..."
						: "AI is converting your resume data into LaTeX format for professional typesetting..."}
				</p>
				<div className="mt-6 flex justify-center space-x-2">
					<div className="w-2 h-2 bg-[#76ABAE] rounded-full animate-pulse"></div>
					<div className="w-2 h-2 bg-[#76ABAE] rounded-full animate-pulse delay-75"></div>
					<div className="w-2 h-2 bg-[#76ABAE] rounded-full animate-pulse delay-150"></div>
				</div>
			</motion.div>
		</motion.div>
	);
}
