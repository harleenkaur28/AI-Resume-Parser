"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Code, Server, Cpu } from "lucide-react";

const stack = [
	{
		category: "Frontend",
		icon: Code,
		color: "border-[#76ABAE]",
		items: [
			{ name: "Next.js", desc: "Hybrid rendering & route ergonomics." },
			{ name: "Tailwind CSS", desc: "Utility-first rapid design system." },
			{ name: "Framer Motion", desc: "Declarative animation primitives." },
		],
	},
	{
		category: "Backend & Data",
		icon: Server,
		color: "border-orange-500",
		items: [
			{ name: "FastAPI", desc: "Async Python API throughput." },
			{ name: "PostgreSQL", desc: "Relational durability + indexing." },
		],
	},
	{
		category: "AI / NLP",
		icon: Cpu,
		color: "border-purple-500",
		items: [
			{ name: "NLP", desc: "Entity + semantic extraction." },
			{ name: "ML", desc: "Predictive ranking & scoring." },
			{ name: "GenAI", desc: "Assistive generation surfaces." },
			{ name: "LangChain", desc: "Composable inference orchestration." },
		],
	},
];

export default function TechStackGrid() {
	return (
		<section id="stack" className="py-20 px-6 scroll-mt-28">
			<div className="max-w-6xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center max-w-3xl mx-auto mb-14"
				>
					<h2 className="text-3xl md:text-5xl font-bold text-[#EEEEEE] tracking-tight">
						Architecture & Tooling
					</h2>
					<p className="mt-5 text-lg text-[#EEEEEE]/70 leading-relaxed">
						Composable layers optimize ingest, transformation, and feedback
						surfaces while preserving extensibility.
					</p>
				</motion.div>
				<div className="grid md:grid-cols-3 gap-6">
					{stack.map((c, i) => {
						const Icon = c.icon;
						return (
							<motion.div
								key={c.category}
								initial={{ opacity: 0, y: 26 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.55, delay: i * 0.07 }}
							>
								<Card
									className={`h-full p-7 bg-white/5 border-white/10 backdrop-blur-md border-t-4 ${c.color} relative overflow-hidden`}
								>
									<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_80%_120%,#76ABAE22,transparent_60%)]" />
									<div className="flex items-center gap-3 mb-5">
										<Icon className="h-7 w-7 text-[#76ABAE]" />
										<h3 className="text-xl font-semibold text-[#EEEEEE]">
											{c.category}
										</h3>
									</div>
									<ul className="space-y-3">
										{c.items.map((it) => (
											<li key={it.name} className="text-sm text-[#EEEEEE]/70">
												<span className="text-[#EEEEEE] font-medium">
													{it.name}:
												</span>{" "}
												{it.desc}
											</li>
										))}
									</ul>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
