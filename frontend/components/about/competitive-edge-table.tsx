"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const rows = [
	{ feature: "Detailed Seeker Analysis", us: true, b2b: false, b2c: true },
	{ feature: "Employer Hiring Dashboard", us: true, b2b: true, b2c: false },
	{ feature: "Bulk ZIP Uploads", us: true, b2b: "limited", b2c: false },
	{
		feature: "Unlimited Free Seeker Access",
		us: true,
		b2b: false,
		b2c: "limited",
	},
];

function cell(val: boolean | string) {
	if (val === true) return <span className="text-green-400">✓</span>;
	if (val === false) return <span className="text-red-400">✗</span>;
	return <span className="text-yellow-400">△</span>;
}

export default function CompetitiveEdgeTable() {
	return (
		<section id="edge" className="py-20 px-6 scroll-mt-28">
			<div className="max-w-6xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center max-w-3xl mx-auto mb-14"
				>
					<h2 className="text-3xl md:text-5xl font-bold text-[#EEEEEE] tracking-tight">
						Differentiated Surface Area
					</h2>
					<p className="mt-5 text-lg text-[#EEEEEE]/70 leading-relaxed">
						Integrated seeker + employer workflow reduces system handoffs and
						amplifies structured feedback loops.
					</p>
				</motion.div>
				<Card className="p-6 overflow-x-auto bg-white/5 border-white/10 backdrop-blur-md">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="border-b border-white/10 text-[#EEEEEE]">
								<th className="p-4 font-semibold text-base">Feature</th>
								<th className="p-4 font-semibold text-base text-center text-[#76ABAE]">
									Our Platform
								</th>
								<th className="p-4 font-semibold text-base text-center">
									B2B Parsers
								</th>
								<th className="p-4 font-semibold text-base text-center">
									B2C Builders
								</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((r, i) => (
								<tr
									key={r.feature}
									className={`border-b border-white/10 ${
										i % 2 ? "bg-white/5" : ""
									}`}
								>
									<td className="p-4 font-medium text-[#EEEEEE]">
										{r.feature}
									</td>
									<td className="p-4 text-2xl text-center">{cell(r.us)}</td>
									<td className="p-4 text-2xl text-center">{cell(r.b2b)}</td>
									<td className="p-4 text-2xl text-center">{cell(r.b2c)}</td>
								</tr>
							))}
						</tbody>
					</table>
					<p className="text-[10px] uppercase tracking-wide text-center text-[#EEEEEE]/40 mt-4">
						✓ Full | △ Limited | ✗ None
					</p>
				</Card>
			</div>
		</section>
	);
}
