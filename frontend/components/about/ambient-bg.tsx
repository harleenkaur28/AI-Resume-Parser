"use client";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function AmbientBackground() {
	const ref = useRef<HTMLDivElement | null>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end end"],
	});
	const opacity = useTransform(scrollYProgress, [0, 1], [0.4, 0.7]);
	const rotate = useTransform(scrollYProgress, [0, 1], [0, 25]);

	return (
		<div
			ref={ref}
			aria-hidden
			className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
		>
			<motion.div
				style={{ opacity, rotate }}
				className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[160vmax] h-[160vmax] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#76ABAE10_0deg,transparent_120deg,#76ABAE08_240deg,#76ABAE10_360deg)] blur-[120px]"
			/>
			<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px] mix-blend-overlay" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#76ABAE11,transparent_55%),radial-gradient(circle_at_80%_70%,#76ABAE0d,transparent_60%)]" />
		</div>
	);
}
