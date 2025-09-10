"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const seeker = [
	{
		title: "Detailed Resume Analysis",
		desc: "Actionable ATS-aligned recommendations.",
	},
	{ title: "AI Job Field Prediction", desc: "Mapped trajectory + domain fit." },
	{ title: "Unlimited Free Access", desc: "Remove friction early in journey." },
];
const employer = [
	{
		title: "Curated Candidate Dashboard",
		desc: "Structured profiles & rankings.",
	},
	{ title: "Bulk ZIP Processing", desc: "Parallel ingest + extraction." },
	{ title: "Reduced Time-To-Hire", desc: "Prioritized signal + automation." },
];

export default function DualValue() {
	return (
		<section className="py-20 px-6">
			<div className="max-w-6xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center max-w-3xl mx-auto mb-14"
				>
					<h2 className="text-3xl md:text-5xl font-bold text-[#EEEEEE] tracking-tight">
						Dual-Sided Compounding Flywheel
					</h2>
					<p className="mt-5 text-lg text-[#EEEEEE]/70 leading-relaxed">
						Value to seekers increases structured supply; value to teams
						increases qualified demand—tightening the signal loop.
					</p>
				</motion.div>
				<div className="grid lg:grid-cols-2 gap-8">
					<motion.div
						initial={{ opacity: 0, x: -24 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<Card className="p-8 h-full bg-white/5 border-white/10 backdrop-blur-md">
							<h3 className="text-2xl font-semibold text-[#76ABAE] mb-6">
								Seekers
							</h3>
							<ul className="space-y-6">
								{seeker.map((f) => (
									<li key={f.title} className="flex items-start gap-4">
										<CheckCircle className="h-6 w-6 text-[#76ABAE] mt-0.5" />
										<div>
											<div className="font-semibold text-[#EEEEEE] mb-1">
												{f.title}
											</div>
											<p className="text-[#EEEEEE]/60 text-sm leading-relaxed">
												{f.desc}
											</p>
										</div>
									</li>
								))}
							</ul>
						</Card>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 24 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<Card className="p-8 h-full bg-white/5 border-white/10 backdrop-blur-md">
							<h3 className="text-2xl font-semibold text-[#76ABAE] mb-6">
								Employers
							</h3>
							<ul className="space-y-6">
								{employer.map((f) => (
									<li key={f.title} className="flex items-start gap-4">
										<CheckCircle className="h-6 w-6 text-[#76ABAE] mt-0.5" />
										<div>
											<div className="font-semibold text-[#EEEEEE] mb-1">
												{f.title}
											</div>
											<p className="text-[#EEEEEE]/60 text-sm leading-relaxed">
												{f.desc}
											</p>
										</div>
									</li>
								))}
							</ul>
						</Card>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
