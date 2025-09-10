"use client";
import { motion } from "framer-motion";
import { Brain, Sparkles, Users2, FileSearch, Gauge } from "lucide-react";

const valuePoints = [
	{
		icon: Brain,
		title: "AI That Understands Context",
		desc: "Goes beyond keyword matching to understand narrative, achievements & career trajectory.",
	},
	{
		icon: FileSearch,
		title: "Unified Talent Workspace",
		desc: "Resumes, analysis, cold outreach & interview prep—together, not in 5 different tabs.",
	},
	{
		icon: Gauge,
		title: "Fast & Insightful",
		desc: "Seconds to parse. Instant gaps, strengths & matching insights for seekers & recruiters.",
	},
	{
		icon: Users2,
		title: "Built For Both Sides",
		desc: "Job seekers sharpen positioning. Recruiters surface signal & reduce screening time.",
	},
	{
		icon: Sparkles,
		title: "Actionable Output",
		desc: "Cold emails, interview questions, tailored resume versions—auto generated from context.",
	},
];

export function ValueProps() {
	return (
		<section className="relative py-24 md:py-32">
			<div className="container mx-auto px-6 max-w-6xl">
				<div className="text-center mb-14 md:mb-20">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.4 }}
						transition={{ duration: 0.6 }}
						className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#EEEEEE] to-[#76ABAE]"
					>
						Why TalentSync?
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="mt-4 text-base md:text-lg text-[#EEEEEE]/70 max-w-2xl mx-auto"
					>
						A focused platform that turns raw career data into decisions,
						positioning & outreach.
					</motion.p>
				</div>

				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
					{valuePoints.map((p, i) => (
						<motion.div
							key={p.title}
							initial={{ opacity: 0, y: 24 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.4 }}
							transition={{ duration: 0.55, delay: i * 0.05 }}
							className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 backdrop-blur-sm hover:border-[#76ABAE]/40 hover:shadow-[0_0_0_1px_#76ABAE40,0_4px_40px_-8px_#76ABAE40] transition-all"
						>
							<div className="flex items-start gap-4">
								<div className="relative">
									<div className="absolute inset-0 rounded-xl bg-[#76ABAE]/30 blur-xl opacity-0 group-hover:opacity-60 transition" />
									<div className="h-12 w-12 rounded-xl flex items-center justify-center bg-[#76ABAE]/15 ring-1 ring-inset ring-[#76ABAE]/40 text-[#76ABAE]">
										<p.icon className="h-6 w-6" />
									</div>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-[#EEEEEE] mb-1 leading-tight">
										{p.title}
									</h3>
									<p className="text-sm text-[#EEEEEE]/60 leading-relaxed">
										{p.desc}
									</p>
								</div>
							</div>
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_80%_120%,#76ABAE22,transparent_60%)]" />
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
