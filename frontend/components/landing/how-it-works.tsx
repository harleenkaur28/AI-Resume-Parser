"use client";
import { motion } from "framer-motion";
import { FileUp, Brain, Sparkles, Target } from "lucide-react";

const steps = [
	{
		icon: FileUp,
		title: "Upload or Import",
		body: "Add a resume (PDF, DOCX, or text) or pull structured data you already have.",
	},
	{
		icon: Brain,
		title: "Deep Parsing",
		body: "We extract roles, skills, impact statements & hidden intent—not just keywords.",
	},
	{
		icon: Sparkles,
		title: "AI Generation",
		body: "Generate tailored resume versions, outreach copy, interview prep & more.",
	},
	{
		icon: Target,
		title: "Match & Act",
		body: "See alignment to opportunities or candidate profiles. Act instantly with context.",
	},
];

export function HowItWorks() {
	return (
		<section className="relative py-24 md:py-32">
			<div className="container mx-auto px-6 max-w-5xl">
				<div className="mb-14 md:mb-20 text-center">
					<motion.h2
						initial={{ opacity: 0, y: 18 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.4 }}
						transition={{ duration: 0.55 }}
						className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#EEEEEE] to-[#76ABAE]"
					>
						How It Works
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.4 }}
						transition={{ duration: 0.55, delay: 0.1 }}
						className="mt-4 text-base md:text-lg text-[#EEEEEE]/70 max-w-2xl mx-auto"
					>
						A simple flow optimized for clarity & velocity.
					</motion.p>
				</div>

				<div className="relative">
					<div className="absolute left-8 sm:left-1/2 sm:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#76ABAE]/40 via-white/10 to-transparent pointer-events-none" />
					<ul className="space-y-12 sm:space-y-20">
						{steps.map((s, i) => (
							<li key={s.title} className="relative">
								<motion.div
									initial={{ opacity: 0, y: 24 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true, amount: 0.5 }}
									transition={{ duration: 0.55, delay: i * 0.07 }}
									className="grid sm:grid-cols-12 gap-6 sm:gap-10 items-start"
								>
									<div className="sm:col-span-5 flex sm:justify-end">
										<div className="flex items-center gap-4 sm:gap-6">
											<div className="relative">
												<div className="absolute inset-0 rounded-xl bg-[#76ABAE]/40 blur-lg opacity-0 sm:group-hover:opacity-60 transition" />
												<div className="h-14 w-14 rounded-xl flex items-center justify-center bg-[#76ABAE]/15 ring-1 ring-inset ring-[#76ABAE]/40 text-[#76ABAE]">
													<s.icon className="h-7 w-7" />
												</div>
											</div>
											<div className="sm:hidden">
												<h3 className="text-lg font-semibold text-[#EEEEEE] leading-tight">
													{s.title}
												</h3>
												<p className="mt-1 text-sm text-[#EEEEEE]/60 leading-relaxed">
													{s.body}
												</p>
											</div>
										</div>
									</div>
									<div className="hidden sm:block sm:col-span-2">
										<div className="relative h-full flex items-center justify-center">
											<div className="h-4 w-4 rounded-full bg-[#76ABAE] ring-4 ring-[#76ABAE]/30 shadow-[0_0_0_4px_#76ABAE20]" />
										</div>
									</div>
									<div className="sm:col-span-5 hidden sm:block">
										<h3 className="text-xl font-semibold text-[#EEEEEE] leading-tight">
											{s.title}
										</h3>
										<p className="mt-3 text-sm md:text-base text-[#EEEEEE]/60 leading-relaxed">
											{s.body}
										</p>
									</div>
								</motion.div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
