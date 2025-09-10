"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const industries = [
	{
		name: "IT & Telecom",
		pct: 25,
		color: "#3b82f6",
		desc: "Tech sector leads adoption",
	},
	{
		name: "Banking & Financial",
		pct: 20,
		color: "#10b981",
		desc: "High compliance automation",
	},
	{
		name: "Healthcare",
		pct: 15,
		color: "#8b5cf6",
		desc: "Digitization & workforce scale",
	},
	{ name: "Retail", pct: 12, color: "#f97316", desc: "E‑commerce velocity" },
	{
		name: "Manufacturing",
		pct: 10,
		color: "#ef4444",
		desc: "Industrial modernization",
	},
	{ name: "Other", pct: 18, color: "#6b7280", desc: "Emerging sectors" },
];

export default function TargetIndustries() {
	return (
		<section id="industries" className="py-20 px-6 scroll-mt-28">
			<div className="max-w-6xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center max-w-3xl mx-auto mb-14"
				>
					<h2 className="text-3xl md:text-5xl font-bold text-[#EEEEEE] tracking-tight">
						Target Adoption Vectors
					</h2>
					<p className="mt-5 text-lg text-[#EEEEEE]/70 leading-relaxed">
						High-volume recruiting + structured compliance needs accelerate ROI
						realization across initial sectors.
					</p>
				</motion.div>
				<Card className="p-8 bg-white/5 border-white/10 backdrop-blur-md">
					<h3 className="text-xl font-semibold text-center text-[#EEEEEE] mb-8">
						Sector Share & Focus
					</h3>
					<div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
						<motion.div
							initial={{ opacity: 0, scale: 0.85 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.9 }}
							className="relative"
						>
							<div
								className="w-72 h-72 md:w-80 md:h-80 rounded-full relative overflow-hidden"
								style={{
									background: `conic-gradient(${industries
										.map(
											(i, idx) =>
												`${i.color} ${
													industries
														.slice(0, idx)
														.reduce((a, c) => a + c.pct, 0) * 3.6
												}deg ${
													industries
														.slice(0, idx + 1)
														.reduce((a, c) => a + c.pct, 0) * 3.6
												}deg`
										)
										.join(",")})`,
								}}
							>
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#1d2228] border border-white/10 flex flex-col items-center justify-center">
										<span className="text-2xl font-bold text-[#EEEEEE]">
											100%
										</span>
										<span className="text-[10px] text-[#EEEEEE]/50 uppercase tracking-wide">
											Market
										</span>
									</div>
								</div>
							</div>
						</motion.div>
						<div className="flex-1 space-y-4 w-full max-w-md">
							{industries.map((ind, i) => (
								<motion.div
									key={ind.name}
									initial={{ opacity: 0, x: 24 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: i * 0.05 }}
									className="flex items-center gap-3 group p-2 rounded-lg hover:bg-white/5 cursor-pointer"
								>
									<div
										className="h-4 w-4 rounded-full"
										style={{ background: ind.color }}
									/>
									<div className="flex-1">
										<div className="font-medium text-[#EEEEEE] group-hover:text-[#76ABAE] transition-colors">
											{ind.name}
										</div>
										<div className="text-xs text-[#EEEEEE]/50">{ind.desc}</div>
									</div>
									<div className="text-[#76ABAE] font-bold text-sm">
										{ind.pct}%
									</div>
								</motion.div>
							))}
						</div>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10">
						{industries.map((ind, i) => (
							<motion.div
								key={ind.name + "card"}
								initial={{ opacity: 0, scale: 0.9 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ duration: 0.45, delay: i * 0.04 }}
								className="p-4 rounded-lg bg-white/5 border border-white/10 text-center hover:border-white/20 transition"
							>
								<div
									className="text-lg font-semibold text-[#EEEEEE] mb-1"
									style={{ color: ind.color }}
								>
									{ind.pct}%
								</div>
								<div className="text-xs text-[#EEEEEE]/60 leading-snug">
									{ind.name}
								</div>
							</motion.div>
						))}
					</div>
				</Card>
			</div>
		</section>
	);
}
