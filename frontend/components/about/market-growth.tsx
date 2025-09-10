"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MarketGrowth() {
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
						Sizing The Opportunity
					</h2>
					<p className="mt-5 text-lg text-[#EEEEEE]/70 leading-relaxed">
						Acceleration of AI adoption in HR + parsing automation forms a
						compounding wedge for talent intelligence. Dual-sided leverage
						expands TAM.
					</p>
				</motion.div>
				<div className="grid lg:grid-cols-2 gap-8">
					<motion.div
						initial={{ opacity: 0, x: -24 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<Card className="p-8 bg-white/[0.05] border-white/10 backdrop-blur-md relative overflow-hidden">
							<div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#76ABAE80,transparent_60%)]" />
							<h3 className="text-xl font-semibold text-center text-[#EEEEEE] mb-2">
								AI in HR (2024 → 2029)
							</h3>
							<p className="text-center text-[#EEEEEE]/60 text-sm mb-8 max-w-md mx-auto">
								High CAGR outpaces broader HR SaaS as intelligent orchestration
								replaces static workflows.
							</p>
							<div className="space-y-5">
								<div className="flex justify-between items-center text-sm text-[#EEEEEE]/70">
									<span>Market</span>
									<Badge className="bg-rose-500/20 text-rose-300 border-rose-400">
										CAGR 19.1%
									</Badge>
								</div>
								<div className="grid grid-cols-3 gap-4 text-center">
									{[
										{ year: "2024", value: "$6.05B" },
										{ year: "2027", value: "$10.08B" },
										{ year: "2029", value: "$14.08B" },
									].map((p) => (
										<div key={p.year} className="flex flex-col gap-1">
											<div className="text-2xl font-bold text-rose-300">
												{p.value}
											</div>
											<div className="text-[11px] tracking-wide text-[#EEEEEE]/50">
												{p.year}
											</div>
										</div>
									))}
								</div>
							</div>
						</Card>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 24 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<Card className="p-8 bg-white/[0.05] border-white/10 backdrop-blur-md relative overflow-hidden">
							<div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_70%,#76ABAE80,transparent_65%)]" />
							<h3 className="text-xl font-semibold text-center text-[#EEEEEE] mb-2">
								Resume Parsing Market
							</h3>
							<p className="text-center text-[#EEEEEE]/60 text-sm mb-8 max-w-md mx-auto">
								Automation of early-funnel qualification more than doubles
								extractive/value layers by 2029.
							</p>
							<div className="space-y-5">
								<div className="flex justify-between items-center text-sm text-[#EEEEEE]/70">
									<span>Parsing Segment</span>
									<Badge className="bg-sky-500/20 text-sky-300 border-sky-400">
										114% Growth
									</Badge>
								</div>
								<div className="grid grid-cols-2 gap-10 text-center">
									<div className="flex flex-col gap-1">
										<div className="text-3xl font-bold text-sky-300">
											$20.19B
										</div>
										<div className="text-[11px] tracking-wide text-[#EEEEEE]/50">
											2024
										</div>
									</div>
									<div className="flex flex-col gap-1">
										<div className="text-3xl font-bold text-sky-300">
											$43.20B
										</div>
										<div className="text-[11px] tracking-wide text-[#EEEEEE]/50">
											2029
										</div>
									</div>
								</div>
							</div>
						</Card>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
