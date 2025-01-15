"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function AnimatedBackButton() {
	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5 }}
		>
			<Link href="/">
				<Button variant="ghost" className="text-[#EEEEEE] hover:text-[#76ABAE]">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Home
				</Button>
			</Link>
		</motion.div>
	);
}

export function AnimatedContent({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, delay: 0.2 }}
			className="mt-12"
		>
			{children}
		</motion.div>
	);
}
