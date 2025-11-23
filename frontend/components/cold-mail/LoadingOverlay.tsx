"use client";

import { motion } from "framer-motion";
import { Loader } from "@/components/ui/loader";

interface LoadingOverlayProps {
	isGenerating: boolean;
	isEditing: boolean;
	generateTitle?: string;
	generateDescription?: string;
	editTitle?: string;
	editDescription?: string;
}

export default function LoadingOverlay({
	isGenerating,
	isEditing,
	generateTitle,
	generateDescription,
	editTitle,
	editDescription,
}: LoadingOverlayProps) {
	if (!isGenerating && !isEditing) return null;

	const title = isEditing
		? editTitle || "Editing Your Email"
		: generateTitle || "Crafting Your Email";

	const description = isEditing
		? editDescription || "AI is applying your edits and improving the email..."
		: generateDescription ||
		  "AI is analyzing your resume and generating a personalized cold email...";

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
				<h3 className="text-[#EEEEEE] font-semibold text-xl mb-3">{title}</h3>
				<p className="text-[#EEEEEE]/70 text-sm leading-relaxed">
					{description}
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
