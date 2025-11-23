"use client";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
	{
		quote:
			"Generated 3 tailored resume variants and a cold email sequence in under 2 minutes. Landed two callbacks same week.",
		name: "Elena P.",
		role: "Product Manager",
	},
	{
		quote:
			"Cuts my screening time dramatically. I focus on signal instead of cleaning inconsistent resumes.",
		name: "Ravi S.",
		role: "Technical Recruiter",
	},
	{
		quote:
			"The AI actually understands impact statements. Way better than generic keyword scanners.",
		name: "Marta G.",
		role: "Hiring Lead",
	},
];

export function Testimonials() {
	return (
		<section className="relative py-24 md:py-32">
			<div className="container mx-auto px-6 max-w-6xl">
				<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14">
					<div className="max-w-xl">
						<motion.h2
							initial={{ opacity: 0, y: 18 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.4 }}
							transition={{ duration: 0.55 }}
							className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#EEEEEE] to-[#76ABAE]"
						>
							Real Outcomes
						</motion.h2>
						<motion.p
							initial={{ opacity: 0, y: 18 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.4 }}
							transition={{ duration: 0.55, delay: 0.1 }}
							className="mt-4 text-base md:text-lg text-[#EEEEEE]/70"
						>
							Individuals and teams use TalentSync to accelerate progress—not
							just create files.
						</motion.p>
					</div>
				</div>
				<div className="grid md:grid-cols-3 gap-6 md:gap-8">
					{testimonials.map((t, i) => (
						<motion.div
							key={t.name}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.55, delay: i * 0.08 }}
							className="relative group rounded-2xl p-6 bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md hover:border-[#76ABAE]/40 hover:shadow-[0_0_0_1px_#76ABAE40,0_4px_40px_-8px_#76ABAE40] transition"
						>
							<Quote className="h-8 w-8 text-[#76ABAE] mb-4 opacity-80" />
							<p className="text-sm md:text-base text-[#EEEEEE]/80 leading-relaxed">
								{t.quote}
							</p>
							<div className="mt-6 pt-4 border-t border-white/10">
								<p className="text-[#EEEEEE] font-medium text-sm">{t.name}</p>
								<p className="text-[#EEEEEE]/50 text-xs">{t.role}</p>
							</div>
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_0%_0%,#76ABAE22,transparent_70%)]" />
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
