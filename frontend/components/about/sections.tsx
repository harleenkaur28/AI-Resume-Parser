"use client";
import { motion } from "framer-motion";
import {
	Sparkles,
	Target,
	Users,
	Zap,
	Brain,
	CheckCircle2,
} from "lucide-react";
import Image from "next/image";

export function AboutHero() {
	return (
		<section className="relative pt-36 pb-24 overflow-hidden">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-40 -right-20 w-[40rem] h-[40rem] bg-[#76ABAE]/15 blur-[140px] rounded-full" />
				<div className="absolute -bottom-40 -left-20 w-[30rem] h-[30rem] bg-[#76ABAE]/10 blur-[120px] rounded-full" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(118,171,174,0.15),transparent_70%)]" />
			</div>
			<div className="relative z-10 container mx-auto max-w-6xl px-6">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7 }}
					className="text-center max-w-3xl mx-auto"
				>
					<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur text-xs text-[#EEEEEE]/70 mb-6">
						<Sparkles className="h-3.5 w-3.5 text-[#76ABAE]" />{" "}
						<span>About TalentSync</span>
					</div>
					<h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-[#F5F7F7] via-[#E5EFEF] to-[#76ABAE] leading-[1.05]">
						Building Signal For Hiring
					</h1>
					<p className="mt-6 text-lg md:text-xl text-[#EEEEEE]/70 leading-relaxed">
						We transform unstructured career data into structured, contextual
						intelligence for seekers & teams. Faster decisions. Better matches.
						Less noise.
					</p>
				</motion.div>
			</div>
		</section>
	);
}

const pillars = [
	{
		title: "Context > Keywords",
		desc: "We care about trajectory, scope, domain & impact—not buzzwords.",
		icon: Brain,
	},
	{
		title: "Actionable Output",
		desc: "Feedback becomes resumes, outreach, interview prep & prioritization.",
		icon: Zap,
	},
	{
		title: "Dual-Sided",
		desc: "Seamless workflows for both seekers and hiring teams create compounding value.",
		icon: Users,
	},
	{
		title: "Signal Preservation",
		desc: "Reduce loss across parsing, matching & evaluation pipelines.",
		icon: Target,
	},
];

export function Pillars() {
	return (
		<section className="relative py-24">
			<div className="container mx-auto px-6 max-w-6xl">
				<motion.h2
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.4 }}
					transition={{ duration: 0.6 }}
					className="text-3xl md:text-5xl font-bold tracking-tight text-[#EEEEEE] text-center mb-14"
				>
					Principles We Build Around
				</motion.h2>
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
					{pillars.map((p, i) => (
						<motion.div
							key={p.title}
							initial={{ opacity: 0, y: 24 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.4 }}
							transition={{ duration: 0.55, delay: i * 0.05 }}
							className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 backdrop-blur-sm hover:border-[#76ABAE]/40 hover:shadow-[0_0_0_1px_#76ABAE40,0_4px_40px_-8px_#76ABAE40] transition-all"
						>
							<div className="flex flex-col gap-4">
								<div className="h-12 w-12 rounded-xl flex items-center justify-center bg-[#76ABAE]/15 ring-1 ring-inset ring-[#76ABAE]/40 text-[#76ABAE]">
									<p.icon className="h-6 w-6" />
								</div>
								<h3 className="text-lg font-semibold text-[#EEEEEE] leading-tight">
									{p.title}
								</h3>
								<p className="text-sm text-[#EEEEEE]/60 leading-relaxed">
									{p.desc}
								</p>
							</div>
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_80%_120%,#76ABAE22,transparent_60%)]" />
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

const timeline = [
	{
		phase: "Capture",
		points: ["Upload or bulk ZIP", "Multi-format parsing", "Auto validation"],
	},
	{
		phase: "Structure",
		points: ["Entity extraction", "Timeline building", "Skill normalization"],
	},
	{
		phase: "Intelligence",
		points: [
			"Gap & strength detection",
			"Role alignment scoring",
			"Career trajectory modeling",
		],
	},
	{
		phase: "Generate",
		points: ["Resume variants", "Cold outreach drafts", "Interview prep Q&A"],
	},
	{
		phase: "Decide",
		points: ["Signal ranking", "Prioritized actions", "Share / export"],
	},
];

export function WorkflowStrip() {
	return (
		<section className="relative py-20">
			<div className="container mx-auto px-6 max-w-7xl">
				<motion.h2
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.4 }}
					transition={{ duration: 0.6 }}
					className="text-3xl md:text-5xl font-bold tracking-tight text-[#EEEEEE] text-center mb-16"
				>
					From Raw Text To Decisions
				</motion.h2>
				<div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1417]/80 backdrop-blur-xl">
					<div className="relative">
						<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
						<div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-white/10">
							{timeline.map((t, i) => (
								<div key={t.phase} className="p-6 md:p-8 relative">
									<div className="flex items-center gap-3 mb-4">
										<div className="h-8 w-8 rounded-lg bg-[#76ABAE]/15 ring-1 ring-inset ring-[#76ABAE]/40 flex items-center justify-center text-[#76ABAE] font-medium text-xs">
											{i + 1}
										</div>
										<h3 className="text-base md:text-lg font-semibold text-[#EEEEEE]">
											{t.phase}
										</h3>
									</div>
									<ul className="space-y-2">
										{t.points.map((p) => (
											<li
												key={p}
												className="flex gap-2 text-sm text-[#EEEEEE]/65"
											>
												<CheckCircle2 className="h-4 w-4 text-[#76ABAE] mt-0.5" />{" "}
												{p}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export function TeamFooter() {
	return (
		<section className="pt-24 pb-16">
			<div className="container mx-auto px-6 max-w-5xl text-center">
				<motion.h2
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.4 }}
					transition={{ duration: 0.6 }}
					className="text-3xl md:text-5xl font-bold tracking-tight text-[#EEEEEE]"
				>
					We're Just Getting Started
				</motion.h2>
				<p className="mt-6 text-[#EEEEEE]/60 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
					TalentSync is evolving fast. We're expanding deeper into structured
					career intelligence, recruiter collaboration, and predictive hiring
					signals.
				</p>
				<div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
					<a
						href="/"
						className="px-6 py-3 rounded-lg bg-[#76ABAE] text-white text-sm font-medium hover:bg-[#76ABAE]/90 transition"
					>
						Back Home
					</a>
					<a
						href="/dashboard/seeker"
						className="px-6 py-3 rounded-lg border border-white/15 text-[#EEEEEE]/80 hover:text-white hover:bg-white/10 text-sm font-medium transition"
					>
						Try It Now
					</a>
				</div>
				<p className="mt-10 text-[10px] uppercase tracking-wider text-[#EEEEEE]/40">
					© {new Date().getFullYear()} TalentSync AI
				</p>
			</div>
		</section>
	);
}
