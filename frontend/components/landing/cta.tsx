"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FinalCTA() {
	return (
		<section className="relative py-28 md:py-40">
			<div className="absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent)] opacity-70">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#76ABAE22,transparent_70%)]" />
			</div>
			<div className="container relative mx-auto px-6 max-w-4xl text-center">
				<motion.h2
					initial={{ opacity: 0, y: 18 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.55 }}
					className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#EEEEEE] to-[#76ABAE]"
				>
					Start Turning Profiles Into Progress
				</motion.h2>
				<motion.p
					initial={{ opacity: 0, y: 18 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.55, delay: 0.1 }}
					className="mt-5 text-base md:text-lg text-[#EEEEEE]/70 max-w-2xl mx-auto"
				>
					Upload a resume or explore recruiter tools. No friction—just signal.
				</motion.p>
				<motion.div
					initial={{ opacity: 0, y: 18 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.55, delay: 0.18 }}
					className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
				>
					<Link href="/dashboard/seeker">
						<Button
							size="lg"
							className="bg-[#76ABAE] hover:bg-[#76ABAE]/90 text-white min-w-[200px]"
						>
							I'm a Job Seeker
						</Button>
					</Link>
					<Link href="/dashboard/recruiter">
						<Button
							size="lg"
							variant="outline"
							className="border-[#76ABAE] text-[#76ABAE] hover:bg-[#76ABAE]/10 hover:text-white min-w-[200px]"
						>
							I'm a Recruiter
						</Button>
					</Link>
				</motion.div>
				<p className="mt-6 text-xs text-[#EEEEEE]/40">
					No credit card required • Fast onboarding
				</p>
			</div>
		</section>
	);
}
