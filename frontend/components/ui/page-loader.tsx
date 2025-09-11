"use client";

import { motion } from "framer-motion";
import { Loader } from "@/components/ui/loader";

interface GenericPageLoaderProps {
	isPageLoading: boolean;
	text?: string;
}

export function PageLoader({ isPageLoading, text }: GenericPageLoaderProps) {
	if (!isPageLoading) return null;
	return (
		<motion.div
			initial={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] flex items-center justify-center z-50"
		>
			<Loader variant="pulse" size="xl" text={text || "Loading..."} />
		</motion.div>
	);
}
