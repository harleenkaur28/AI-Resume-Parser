"use client";
import { useScroll, motion } from "framer-motion";

export default function ScrollProgress() {
	const { scrollYProgress } = useScroll();
	return (
		<motion.div
			style={{ scaleX: scrollYProgress }}
			className="fixed left-0 top-0 h-1 origin-left bg-gradient-to-r from-[#76ABAE] via-[#76ABAE] to-transparent z-50"
		/>
	);
}
