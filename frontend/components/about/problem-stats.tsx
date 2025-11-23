"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrendingUp, Building } from "lucide-react";

const stats = [
	{
		value: "286%",
		label: "YoY Application Surge",
		description:
			"Avg 48.7 applications per posting, overwhelming manual review.",
		color: "from-rose-500 to-pink-600",
		icon: TrendingUp,
	},
	{
		value: "93%",
		label: "Employers Use ATS",
		description: "Formatting + keyword bias silently filter strong candidates.",
		color: "from-amber-500 to-orange-600",
		icon: Building,
	},
];

export default function ProblemStats() {
	return (
		<section id="problem" className="relative scroll-mt-28 py-20 px-6">
			<div className="mx-auto max-w-6xl">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center max-w-3xl mx-auto mb-14"
				>
					<h2 className="text-3xl md:text-5xl font-bold text-[#EEEEEE] tracking-tight">
						The Challenge Of Modern Hiring
					</h2>
					<p className="mt-5 text-[#EEEEEE]/70 text-lg leading-relaxed">
						Application volume & noisy signals create drag for recruiters while
						seekers face opaque filters. We surface structure & context—fast.
					</p>
				</motion.div>
				<div className="grid md:grid-cols-2 gap-6">
					{stats.map((s, i) => {
						const Icon = s.icon;
						return (
							<motion.div
								key={s.label}
								initial={{ opacity: 0, y: 28 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.55, delay: i * 0.08 }}
							>
								<Card className="relative overflow-hidden border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] backdrop-blur-xl p-8 h-full">
									<div
										className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${s.color}`}
									/>
									<div className="flex flex-col items-center text-center">
										<Icon className="h-12 w-12 text-[#76ABAE] mb-5" />
										<div
											className={`text-6xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent leading-none mb-3`}
										>
											{s.value}
										</div>
										<div className="text-lg font-semibold text-[#EEEEEE] mb-2">
											{s.label}
										</div>
										<p className="text-sm text-[#EEEEEE]/60 leading-relaxed max-w-sm">
											{s.description}
										</p>
									</div>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
