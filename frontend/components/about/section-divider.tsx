"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SectionDivider({
	subtle = false,
}: {
	subtle?: boolean;
}) {
	return (
		<div className="relative">
			<motion.div
				initial={{ opacity: 0, scaleX: 0.85 }}
				whileInView={{ opacity: 1, scaleX: 1 }}
				viewport={{ once: true, amount: 0.4 }}
				transition={{ duration: 0.6 }}
				className={cn(
					"mx-auto w-full max-w-5xl h-px my-4 md:my-10 bg-gradient-to-r from-transparent via-[#76ABAE33] to-transparent",
					subtle && "via-[#76ABAE22]"
				)}
			/>
		</div>
	);
}
