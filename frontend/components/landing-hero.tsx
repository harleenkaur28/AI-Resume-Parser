"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	FileText,
	Users,
	Sparkles,
	ArrowRight,
	PlayCircle,
	CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function calMobile() {
	if (typeof window === "undefined") return false;
	return window.innerWidth < 640;
}

function LandingHero() {
	const [isMobile, setIsMobile] = useState(calMobile());
	const [mode, setMode] = useState<"seeker" | "recruiter">("seeker");

	useEffect(() => {
		function handleResize() {
			setIsMobile(calMobile());
		}
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const highlight =
		mode === "seeker"
			? ["Gap analysis", "Tailored resume variants", "Interview prep questions"]
			: ["Bulk parsing", "Candidate signal ranking", "Cold outreach drafts"];

	return (
		<div className="relative min-h-[100vh] flex items-center pt-32 md:pt-40 pb-16 overflow-hidden px-4">
			{/* Ambient shapes */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-32 -right-40 w-[38rem] h-[38rem] bg-[#76ABAE]/20 blur-[140px] rounded-full" />
				<div className="absolute -bottom-32 -left-40 w-[32rem] h-[32rem] bg-[#76ABAE]/10 blur-[120px] rounded-full" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(118,171,174,0.15),transparent_70%)]" />
			</div>
			<div className="relative z-10 container mx-auto max-w-7xl">
				<div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
					{/* Left / Center copy */}
					<div className="lg:col-span-7 text-center lg:text-left">
						<motion.div
							initial={{ opacity: 0, y: 24 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7 }}
						>
							<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur text-xs text-[#EEEEEE]/70 mb-5">
								<Sparkles className="h-3.5 w-3.5 text-[#76ABAE]" />{" "}
								<span>AI talent intelligence</span>
							</div>
							<h1 className="font-bold tracking-tight text-4xl sm:text-5xl md:text-6xl xl:text-7xl leading-[1.05] bg-clip-text text-transparent bg-gradient-to-b from-[#F5F7F7] via-[#E5EFEF] to-[#76ABAE]">
								Turn Resumes Into{" "}
								<span className="">
									<span className="pr-1">Decisions</span>
									{/* decorative underline - allow it to overflow and ignore pointer events */}
									<span className="absolute inset-x-0 bottom-1 h-2 bg-[#76ABAE]/30 blur-sm rounded pointer-events-none" />
								</span>
							</h1>
							<p className="mt-6 text-lg sm:text-xl text-[#EEEEEE]/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
								TalentSync parses, analyzes & generates actionable outputs for
								seekers and recruiters—faster than opening a doc.
							</p>
							{/* Mode switch */}
							<div className="mt-8 inline-flex p-1 rounded-xl bg-white/5 ring-1 ring-white/10 backdrop-blur">
								{(["seeker", "recruiter"] as const).map((m) => (
									<button
										key={m}
										onClick={() => setMode(m)}
										className={`relative px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
											mode === m
												? "bg-[#76ABAE] text-white shadow-[0_0_0_1px_#76ABAE40]"
												: "text-[#EEEEEE]/60 hover:text-[#EEEEEE]"
										}`}
									>
										{m === "seeker" ? "For Job Seekers" : "For Recruiters"}
									</button>
								))}
							</div>
							<div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
								<Link
									href={
										mode === "seeker"
											? "/dashboard/seeker"
											: "/dashboard/recruiter"
									}
								>
									<Button
										size="lg"
										className="bg-[#76ABAE] hover:bg-[#76ABAE]/90 text-white min-w-[190px]"
									>
										{mode === "seeker" ? (
											<FileText className="mr-2 h-5 w-5" />
										) : (
											<Users className="mr-2 h-5 w-5" />
										)}
										{mode === "seeker" ? "Get Started" : "Recruiter Console"}
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</Link>
								<Link href="/dashboard/seeker">
									<Button
										size="lg"
										variant="outline"
										className="border-white/15 text-[#76ABAE]/90 hover:text-white hover:bg-white/10"
									>
										<PlayCircle className="mr-2 h-5 w-5" /> Live Demo
									</Button>
								</Link>
							</div>
							{/* Metrics */}
							<div className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-left">
								{[
									{ label: "Resumes Parsed", value: "12K+" },
									{ label: "Avg. Time Saved", value: "6h/wk" },
									{ label: "Generated Assets", value: "30K+" },
								].map((item) => (
									<div
										key={item.label}
										className="rounded-lg bg-white/5 ring-1 ring-white/10 px-4 py-3"
									>
										<p className="text-lg font-semibold text-[#EEEEEE]">
											{item.value}
										</p>
										<p className="text-[10px] uppercase tracking-wide text-[#EEEEEE]/50 font-medium">
											{item.label}
										</p>
									</div>
								))}
							</div>
						</motion.div>
					</div>
					{/* Right preview */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.15 }}
						className="lg:col-span-5 w-full"
					>
						<div className="relative">
							<div className="absolute -inset-1 bg-gradient-to-tr from-[#76ABAE]/40 via-transparent to-transparent rounded-2xl blur opacity-60" />
							<div className="relative rounded-2xl bg-[#101518]/90 ring-1 ring-white/10 backdrop-blur-xl p-6 flex flex-col gap-5 min-h-[340px]">
								<p className="text-xs font-mono tracking-wide text-[#76ABAE] uppercase">
									{mode === "seeker"
										? "AI Resume Insights"
										: "Candidate Signal Snapshot"}
								</p>
								<div className="space-y-3">
									{highlight.map((h) => (
										<div key={h} className="flex items-start gap-3">
											<CheckCircle2 className="h-5 w-5 text-[#76ABAE] shrink-0 mt-0.5" />
											<p className="text-sm text-[#EEEEEE]/80 leading-snug">
												{h}
											</p>
										</div>
									))}
								</div>
								<div className="mt-auto">
									<div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.03] ring-1 ring-white/10 p-4">
										<p className="text-[11px] font-mono text-[#EEEEEE]/50 mb-2">
											sample_output.json
										</p>
										<pre className="text-[11px] leading-relaxed text-[#EEEEEE]/70 whitespace-pre-wrap font-mono">
											{`{
	"candidate_strengths": ["Leadership", "Product sense", "Cross-functional comms"],
	"role_alignment_score": 87,
	"suggested_actions": ["Tighten impact numbers", "Add AI tooling examples"],
	"next_step": "Generate tailored PM resume"
}`}
										</pre>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
				{/* Bottom mini bar */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6, duration: 0.8 }}
					className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-[#EEEEEE]/60 text-xs sm:text-sm"
				>
					<div className="flex items-center gap-2">
						<Sparkles className="h-4 w-4" />
						<p>Context-aware AI</p>
					</div>
					<div className="hidden sm:block">|</div>
					<p>Secure & private</p>
					<div className="hidden sm:block">|</div>
					<p>No ML training on your data</p>
				</motion.div>

				{isMobile && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.7, duration: 0.8 }}
						className="mt-10 flex flex-col items-center justify-center gap-4 text-[#EEEEEE]/60 text-sm"
					>
						<div className="relative mt-4 flex flex-col items-center">
							<div className="backdrop-blur-md bg-white/10 rounded-full p-3 shadow-lg border border-white/20">
								<svg width="32" height="48" viewBox="0 0 32 48" fill="none">
									<rect
										x="4"
										y="4"
										width="24"
										height="40"
										rx="12"
										fill="#76ABAE"
										fillOpacity="0.15"
										stroke="#76ABAE"
										strokeWidth="2"
									/>
									<motion.circle
										cx="16"
										initial={{ cy: 14 }}
										animate={{ cy: [14, 30, 14] }}
										transition={{
											repeat: Infinity,
											duration: 1.5,
											ease: "easeInOut",
										}}
										r="4"
										fill="#76ABAE"
									/>
								</svg>
							</div>
							<span className="mt-2 text-xs text-[#EEEEEE]/70">
								Scroll down
							</span>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}

export { calMobile, LandingHero };
