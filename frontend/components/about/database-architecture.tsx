"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Database, Server } from "lucide-react";

export default function DatabaseArchitecture() {
	return (
		<section id="data" className="py-20 px-6 scroll-mt-28">
			<div className="max-w-6xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center max-w-3xl mx-auto mb-14"
				>
					<h2 className="text-3xl md:text-5xl font-bold text-[#EEEEEE] tracking-tight">
						Data Model & Persistence
					</h2>
					<p className="mt-5 text-lg text-[#EEEEEE]/70 leading-relaxed">
						Normalized relational schema supports scalable parsing throughput,
						multi-tenant access control, and historical analytics.
					</p>
				</motion.div>
				<div className="grid lg:grid-cols-2 gap-8">
					<motion.div
						initial={{ opacity: 0, x: -24 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<Card className="p-6 h-full bg-white/5 border-white/10 backdrop-blur-md">
							<div className="flex items-center gap-3 mb-4">
								<Database className="h-7 w-7 text-[#76ABAE]" />
								<h3 className="text-lg font-semibold text-[#EEEEEE]">
									Logical Architecture
								</h3>
							</div>
							<div className="relative group">
								<Image
									src="/database-archetecture.png"
									width={600}
									height={420}
									alt="Database Architecture"
									className="rounded-lg border border-white/15 group-hover:scale-[1.02] transition"
								/>
								<div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition" />
							</div>
							<p className="mt-4 text-sm text-[#EEEEEE]/60 leading-relaxed">
								Supports resume entity extraction, scoring artifacts, user
								account roles, and pipeline stage logging for observability.
							</p>
						</Card>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 24 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<Card className="p-6 h-full bg-white/5 border-white/10 backdrop-blur-md">
							<div className="flex items-center gap-3 mb-4">
								<Server className="h-7 w-7 text-[#76ABAE]" />
								<h3 className="text-lg font-semibold text-[#EEEEEE]">
									Entity Relationships
								</h3>
							</div>
							<div className="relative group">
								<Image
									src="/database-relationships.png"
									width={600}
									height={420}
									alt="Database Relationships"
									className="rounded-lg border border-white/15 group-hover:scale-[1.02] transition"
								/>
								<div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition" />
							</div>
							<p className="mt-4 text-sm text-[#EEEEEE]/60 leading-relaxed">
								Relational mapping across users, resumes, analyses, predictions,
								and hiring flows preserves referential integrity.
							</p>
						</Card>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
