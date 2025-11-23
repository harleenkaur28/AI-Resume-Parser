"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const sections = [
	{ id: "problem", label: "Problem" },
	{ id: "market", label: "Market" },
	{ id: "pipeline", label: "Pipeline" },
	{ id: "pillars", label: "Pillars" },
	{ id: "stack", label: "Stack" },
	{ id: "value", label: "Value" },
	{ id: "edge", label: "Edge" },
	{ id: "industries", label: "Industries" },
	{ id: "data", label: "Data" },
	{ id: "flow", label: "Flow" },
];

export default function SectionNav() {
	const [active, setActive] = useState<string>("");

	useEffect(() => {
		const obs = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						setActive(e.target.id);
					}
				});
			},
			{ rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
		);
		sections.forEach((s) => {
			const el = document.getElementById(s.id);
			if (el) obs.observe(el);
		});
		return () => obs.disconnect();
	}, []);

	return (
		<nav className="sticky top-4 z-30 mx-auto mt-4 w-full max-w-5xl px-4 hidden xl:block">
			<div className="backdrop-blur-xl bg-[#12181b]/70 border border-white/10 rounded-full shadow-lg flex items-center overflow-x-auto scrollbar-none">
				<ul className="flex gap-1 px-2 py-2 w-full">
					{sections.map((s) => (
						<li key={s.id}>
							<a
								href={`#${s.id}`}
								className={cn(
									"relative rounded-full text-xs tracking-wide px-3 py-2 font-medium text-[#cccccc] hover:text-white transition",
									active === s.id && "text-white"
								)}
							>
								{active === s.id && (
									<motion.span
										layoutId="pill"
										className="absolute inset-0 rounded-full bg-[#76ABAE]/15 ring-1 ring-[#76ABAE]/30"
										transition={{ type: "spring", stiffness: 350, damping: 30 }}
									/>
								)}
								<span className="relative z-10">{s.label}</span>
							</a>
						</li>
					))}
				</ul>
			</div>
		</nav>
	);
}
