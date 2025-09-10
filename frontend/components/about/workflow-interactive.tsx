"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card } from "@/components/ui/card";

const pipeline = [
	{
		step: "DOCUMENT PARSING",
		stage: "Input Layer",
		details: "PyPDF2, docx, OCR",
		desc: "Multi-format extraction",
		color: "blue",
		process: "Format detect → Extract → Structure map",
	},
	{
		step: "CONTENT VALIDATION",
		stage: "Validation",
		details: "Structure + heuristic",
		desc: "Resume shape check",
		color: "orange",
		process: "Layout inspect → Density → Compliance",
	},
	{
		step: "ENTITY EXTRACTION",
		stage: "NLP Layer",
		details: "spaCy + custom",
		desc: "Contact & profile entities",
		color: "green",
		process: "NER pass → Normalize → Aggregate",
	},
	{
		step: "TEXT PREPROCESS",
		stage: "Preprocess",
		details: "Normalize & clean",
		desc: "Canonical token stream",
		color: "teal",
		process: "Tokenize → Lower → Filter stop",
	},
	{
		step: "SKILL CLASSIFY",
		stage: "ML Mapping",
		details: "Taxonomy index",
		desc: "Skill categorization",
		color: "purple",
		process: "Extract → Cluster → Map",
	},
	{
		step: "EXPERIENCE ANALYSIS",
		stage: "Career Intelligence",
		details: "Role timeline",
		desc: "Progression signals",
		color: "indigo",
		process: "Span calc → Seniority → Growth",
	},
	{
		step: "FIELD PREDICTION",
		stage: "AI Prediction",
		details: "Ensemble",
		desc: "Job domain scoring",
		color: "pink",
		process: "Features → Inference → Confidence",
	},
	{
		step: "QUALITY SCORING",
		stage: "Assessment",
		details: "Composite score",
		desc: "Effectiveness rating",
		color: "yellow",
		process: "Completeness → ATS fit → Style",
	},
];

const colorMap: Record<string, string> = {
	blue: "from-blue-500/30 to-blue-600/20 border-blue-400 text-blue-200 hover:shadow-blue-500/40",
	orange:
		"from-orange-500/30 to-orange-600/20 border-orange-400 text-orange-200 hover:shadow-orange-500/40",
	green:
		"from-green-500/30 to-green-600/20 border-green-400 text-green-200 hover:shadow-green-500/40",
	teal: "from-teal-500/30 to-teal-600/20 border-teal-400 text-teal-200 hover:shadow-teal-500/40",
	purple:
		"from-purple-500/30 to-purple-600/20 border-purple-400 text-purple-200 hover:shadow-purple-500/40",
	indigo:
		"from-indigo-500/30 to-indigo-600/20 border-indigo-400 text-indigo-200 hover:shadow-indigo-500/40",
	pink: "from-pink-500/30 to-pink-600/20 border-pink-400 text-pink-200 hover:shadow-pink-500/40",
	yellow:
		"from-yellow-500/30 to-yellow-600/20 border-yellow-400 text-yellow-200 hover:shadow-yellow-500/40",
};

export default function WorkflowInteractive() {
	return (
		<section id="pipeline" className="py-20 px-6 scroll-mt-28">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center max-w-4xl mx-auto mb-14"
				>
					<h2 className="text-3xl md:text-5xl font-bold text-[#EEEEEE] tracking-tight">
						Intelligent Parsing & Scoring Pipeline
					</h2>
					<p className="mt-5 text-lg text-[#EEEEEE]/70 leading-relaxed">
						Raw documents evolve into structured, ranked, and contextualized
						talent intelligence via an 8-stage ML + NLP workflow.
					</p>
				</motion.div>
				<Card className="relative p-8 bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
					<div
						className="absolute inset-0 opacity-5"
						style={{
							backgroundImage:
								"radial-gradient(circle at 25% 25%,#76ABAE 1px,transparent 1px),radial-gradient(circle at 75% 75%,#76ABAE 1px,transparent 1px)",
							backgroundSize: "55px 55px",
						}}
					/>
					<div className="hidden md:grid grid-cols-4 gap-6 mb-10">
						{pipeline.map((p, i) => (
							<motion.div
								key={p.step}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.55, delay: i * 0.05 }}
								className={`group relative overflow-hidden border-3 rounded-xl px-5 py-6 text-center font-medium cursor-pointer bg-gradient-to-br ${
									colorMap[p.color]
								}`}
							>
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
								<div className="text-sm font-semibold mb-1 tracking-wide">
									{p.step}
								</div>
								<div className="text-xs opacity-80 mb-2">{p.desc}</div>
								<div className="text-[10px] uppercase tracking-wide opacity-70 bg-black/30 rounded px-2 py-1 inline-block">
									{p.stage}
								</div>
								<div className="mt-2 text-[10px] opacity-60 bg-black/20 rounded px-2 py-1 inline-block">
									{p.details}
								</div>
								<div className="mt-3 text-[10px] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40 border border-white/10 rounded p-2">
									{p.process}
								</div>
							</motion.div>
						))}
					</div>
					{/* Mobile simplified flow image */}
					<div className="md:hidden">
						<Image
							src="/flowchat.svg"
							width={900}
							height={800}
							alt="Workflow"
							className="w-full h-auto"
						/>
					</div>
				</Card>
			</div>
		</section>
	);
}
